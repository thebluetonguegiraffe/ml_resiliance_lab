from datetime import datetime, timezone
import logging
from typing import Dict, Literal

from pydantic import BaseModel, Field

from pymongo import MongoClient

from config import MONGO_DB_NAME, TRANSACTIONS_GOLD, TRANSACTIONS_SILVER, SCHEMA_VERSION

logger = logging.getLogger("gold_layer")


class GoldContract(BaseModel):
    """Schema for the Gold layer (Aggregation/Business Logic)"""

    time: float
    amount: float
    credit_score: int
    v_features: Dict[str, float]

    # New Gold fields
    tx_count_last_1h: int = Field(..., description="Transactions in the last hour")
    high_velocity_alert: bool = Field(
        ..., description="Deterministic flag if tx_count_last_1h > 10"
    )


class GoldLayer:
    def __init__(self, mongo_client: MongoClient, pipeline_run_id: str):
        self.silver_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_SILVER]
        self.gold_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_GOLD]

        self.pipeline_run_id = pipeline_run_id

    def _get_tx_count_last_1h(self, current_time: float) -> int:
        time_1h_ago = current_time - 3600

        count = self.silver_col.count_documents(
            {"time": {"$gte": time_1h_ago, "$lte": current_time}}
        )
        return count

    def process(self):
        silver_docs = list(self.silver_col.find({"processed": False}))

        if not silver_docs:
            logger.info("No new transactions in Silver to process.")
            return

        for silver_doc in silver_docs:
            try:
                tx_count = self._get_tx_count_last_1h(silver_doc["time"])
                high_velocity = tx_count > 10

                gold_data = {
                    **silver_doc,
                    "tx_count_last_1h": tx_count,
                    "high_velocity_alert": high_velocity,
                }

                validated_data = GoldContract(**gold_data)
                gold_doc = validated_data.model_dump()

                gold_doc.update(
                    {
                        "aggregated_at": datetime.now(timezone.utc).isoformat(),
                        "schema_version": SCHEMA_VERSION,
                        "pipeline_run_id": self.pipeline_run_id,
                        "processed": False,  # Pending for inference
                    }
                )

                self.gold_col.insert_one(gold_doc)
                self.silver_col.update_one(
                    {"_id": silver_doc["_id"]},
                    {"$set": {"processed": True}}
                )

            except Exception as e:
                logger.error(f"Error processing doc {silver_doc.get('_id')} in Gold: {str(e)}")
