from datetime import datetime, timezone
import logging
import random
from typing import Dict
from pydantic import BaseModel, Field
from pymongo import MongoClient

from config import MONGO_DB_NAME, TRANSACTIONS_BRONZE, TRANSACTIONS_SILVER, SCHEMA_VERSION

logger = logging.getLogger("silver_layer")


class SilverContract(BaseModel):
    """Schema for the Silver layer (Enrichment)"""

    time: float
    amount: float
    v_features: Dict[str, float]

    # New Silver fields
    credit_score: int = Field(..., description="Simulated external API score")


class SilverLayer:
    def __init__(self, mongo_client: MongoClient, pipeline_run_id: str):
        self.bronze_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_BRONZE]
        self.silver_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_SILVER]

        self.pipeline_run_id = pipeline_run_id

    def _mock_credit_score_api(self, circuit_breaker_open: bool = False) -> int:
        if circuit_breaker_open:
            logger.warning("Circuit Breaker OPEN: Fallback applied")
            return 0  # Default fallback in case of failure
        return random.randint(300, 850)

    def process(self, circuit_breaker_open: bool):
        bronze_docs = list(self.bronze_col.find({"processed": False}))

        if not bronze_docs:
            logger.info("No new transactions in Bronze to process.")
            return

        for bronze_doc in bronze_docs:
            try:
                # Enrichment logic
                score = self._mock_credit_score_api(
                    circuit_breaker_open=circuit_breaker_open
                )  # Set to True for Event 2
                silver_data = {**bronze_doc, "credit_score": score}

                validated_data = SilverContract(**silver_data)
                silver_doc = validated_data.model_dump()

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

            except Exception as e:
                logger.error(f"Error processing doc {bronze_doc.get('_id')} in Silver: {str(e)}")
