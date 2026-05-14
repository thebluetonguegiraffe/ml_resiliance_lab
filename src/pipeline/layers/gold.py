from datetime import datetime, timezone
import logging
from typing import Literal

from pydantic import BaseModel, Field

from pymongo import MongoClient

from config import MONGO_DB_NAME, TRANSACTIONS_GOLD, TRANSACTIONS_SILVER, SCHEMA_VERSION

logger = logging.getLogger("gold_layer")


class GoldContract(BaseModel):
    """Schema for the Gold layer (Aggregation/Business Logic)"""
    time: float
    amount: float
    credit_score: int
    time_bucket: str
    
    # New Gold fields
    tx_count_last_1h: int = Field(..., description="Transactions in the last hour")
    high_velocity_alert: bool = Field(..., description="Deterministic flag if tx_count_last_1h > 10")


class GoldLayer:
    def __init__(self, mongo_client: MongoClient, pipeline_run_id: str):
        self.mongo_client = mongo_client
        self.db = mongo_client[MONGO_DB_NAME]
        self.pipeline_run_id = pipeline_run_id

    def _get_tx_count_last_1h(self, current_time: float) -> int:
        """
        Calculates how many transactions occurred in the last hour (3600 seconds).
        """
        time_1h_ago = current_time - 3600
        
        # Count transactions within that time window in the Silver collection
        count = self.db[TRANSACTIONS_SILVER].count_documents({
            "time": {"$gte": time_1h_ago, "$lte": current_time}
        })
        return count

    def process(self):
        # 1. Read unprocessed records from Silver
        silver_docs = list(self.db[TRANSACTIONS_SILVER].find({"processed": False}))
        
        if not silver_docs:
            logger.info("No new transactions in Silver to process.")
            return

        for doc in silver_docs:
            try:
                # Business logic (Historical)
                tx_count = self._get_tx_count_last_1h(doc["time"])
                
                # Event 4: Deterministic rule
                high_velocity = tx_count > 10

                gold_data = {
                    "time": doc["time"],
                    "amount": doc["amount"],
                    "credit_score": doc["credit_score"],
                    "time_bucket": doc["time_bucket"],
                    "tx_count_last_1h": tx_count,
                    "high_velocity_alert": high_velocity,
                    "_id": str(doc["_id"])
                }

                validated_data = GoldContract(**gold_data)
                gold_doc = validated_data.model_dump(by_alias=True)
                
                gold_doc.update({
                    "aggregated_at": datetime.now(timezone.utc).isoformat(),
                    "schema_version": SCHEMA_VERSION,
                    "pipeline_run_id": self.pipeline_run_id
                })

                # Insert into Gold
                self.db[TRANSACTIONS_GOLD].insert_one(gold_doc)
                
                # Mark as processed in Silver
                self.db[TRANSACTIONS_SILVER].update_one(
                    {"_id": doc["_id"]}, 
                    {"$set": {"processed": True}}
                )
                
            except Exception as e:
                logger.error(f"Error processing doc {doc.get('_id')} in Gold: {str(e)}")