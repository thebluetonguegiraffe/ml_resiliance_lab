from datetime import datetime, timezone
import logging
import random
from typing import Dict
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from pymongo import MongoClient

from config import (
    MONGO_DB_NAME,
    TRANSACTIONS_BRONZE,
    TRANSACTIONS_SILVER,
    TRANSACTIONS_REJECTED,
    SCHEMA_VERSION,
)
from src.utils.contract import PyObjectId

logger = logging.getLogger("silver_layer")


class SilverContract(BaseModel):
    id: PyObjectId = Field(..., alias="_id")
    internal_id: int | str = Field(..., description="Internal ID for UI tracking")
    time: float
    amount: float
    v_features: Dict[str, float]

    # New Silver fields
    credit_score: int = Field(..., description="Simulated external API score")

    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)


class SilverLayer:
    def __init__(self, mongo_client: MongoClient, pipeline_run_id: str):
        self.bronze_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_BRONZE]
        self.silver_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_SILVER]
        self.rejected_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_REJECTED]

        self.pipeline_run_id = pipeline_run_id

    def _mock_credit_score_api(self, api_status: bool) -> int:
        if api_status is False:
            logger.warning("API is DOWN: Fallback applied")
            return 0
        return random.randint(300, 850)

    def process(self, api_status: bool, record_id: str):
        bronze_docs = list(self.bronze_col.find({"processed": False, "_id": record_id}))

        if not bronze_docs:
            logger.info("No new transactions in Bronze to process.")
            return

        for bronze_doc in bronze_docs:
            try:
                score = self._mock_credit_score_api(api_status=api_status)
                silver_data = {**bronze_doc, "credit_score": score}

                validated_data = SilverContract(**silver_data)
                silver_doc = validated_data.model_dump(by_alias=True)

                silver_doc.update(
                    {
                        "enriched_at": datetime.now(timezone.utc).isoformat(),
                        "schema_version": SCHEMA_VERSION,
                        "pipeline_run_id": self.pipeline_run_id,
                        "processed": False,  # Pending for Gold layer
                    }
                )

                self.silver_col.insert_one(silver_doc)

                self.bronze_col.update_one(
                    {"_id": bronze_doc["_id"]}, {"$set": {"processed": True}}
                )

            except ValidationError as e:
                logger.info(f"Transaction rejected due to validation error: {e}")
                bronze_doc["rejection_reason"] = f"Silver Layer Exception: {str(e)}"
                bronze_doc["rejected_at_layer"] = "silver"
                bronze_doc["processed"] = False
                self.rejected_col.insert_one(bronze_doc)
                e.failed_layer = "silver"
                raise e

            finally:
                self.bronze_col.update_one(
                    {"_id": bronze_doc["_id"]}, {"$set": {"processed": True}}
                )
