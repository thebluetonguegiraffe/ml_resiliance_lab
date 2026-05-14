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
    time_bucket: str = Field(..., description="Time of day category: morning, afternoon, night")
    credit_score: int = Field(..., description="Simulated external API score")


class SilverLayer:
    def __init__(self, mongo_client: MongoClient, pipeline_run_id: str):
        self.mongo_client = mongo_client
        self.db = mongo_client[MONGO_DB_NAME]
        self.pipeline_run_id = pipeline_run_id

    def _calculate_time_bucket(self, time_seconds: float) -> str:
        """
        Calculates the time bucket. 
        Assumes 'time' represents seconds since the dataset started (e.g., Kaggle fraud dataset).
        """
        hour_of_day = (time_seconds % 86400) // 3600
        if 6 <= hour_of_day < 14:
            return "morning"
        elif 14 <= hour_of_day < 22:
            return "afternoon"
        else:
            return "night"

    def _mock_credit_score_api(self, circuit_breaker_open: bool = False) -> int:
        """Simulates an external API that might fail for Event 2"""
        if circuit_breaker_open:
            logger.warning("Circuit Breaker OPEN: Fallback applied")
            return 0 # Default fallback in case of failure
        return random.randint(300, 850)

    def process(self):
        # 1. Read unprocessed records from Bronze
        bronze_docs = list(self.db[TRANSACTIONS_BRONZE].find({"processed": False}))
        
        if not bronze_docs:
            logger.info("No new transactions in Bronze to process.")
            return

        for doc in bronze_docs:
            try:
                # Enrichment logic
                bucket = self._calculate_time_bucket(doc["time"])
                score = self._mock_credit_score_api(circuit_breaker_open=False) # Set to True for Event 2

                # Prepare validated payload
                silver_data = {
                    "time": doc["time"],
                    "amount": doc["amount"],
                    "v_features": doc["v_features"],
                    "time_bucket": bucket,
                    "credit_score": score,
                    "_id": str(doc["_id"])
                }
                
                validated_data = SilverContract(**silver_data)
                silver_doc = validated_data.model_dump(by_alias=True)
                
                silver_doc.update({
                    "enriched_at": datetime.now(timezone.utc).isoformat(),
                    "schema_version": SCHEMA_VERSION,
                    "pipeline_run_id": self.pipeline_run_id,
                    "processed": False # Pending for Gold layer
                })

                # Insert into Silver
                self.db[TRANSACTIONS_SILVER].insert_one(silver_doc)
                
                # Mark as processed in Bronze
                self.db[TRANSACTIONS_BRONZE].update_one(
                    {"_id": doc["_id"]}, 
                    {"$set": {"processed": True}}
                )
                
            except Exception as e:
                logger.error(f"Error processing doc {doc.get('_id')} in Silver: {str(e)}")