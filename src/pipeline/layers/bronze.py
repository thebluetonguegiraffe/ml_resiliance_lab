from datetime import datetime, timezone
import logging
from typing import Dict
from pydantic import BaseModel, Field, field_validator
from pymongo import MongoClient

from config import MONGO_DB_NAME, TRANSACTIONS_BRONZE, TRANSACTIONS_REJECTED, SCHEMA_VERSION

logger = logging.getLogger("bronze_layer")


class BronzeContract(BaseModel):
    time: float = Field(..., gt=0, description="Transaction time, strictly > 0")
    amount: float = Field(
        ..., ge=0.0, le=25000.0, description="Transaction amount, between 0.0 and 25000.0"
    )
    v_features: Dict[str, float]

    @field_validator("v_features")
    @classmethod
    def check_v_contents(cls, v: Dict[str, float]):
        if len(v) != 28:
            raise ValueError("Missing some V features in the sub-dictionary")
        return v


class BronzeLayer:
    def __init__(self, mongo_client: MongoClient, pipeline_run_id: str):
        self.mongo_client = mongo_client
        
        self.bronze_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_BRONZE]
        self.rejected_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_REJECTED]

        self.pipeline_run_id = pipeline_run_id

    def process(self, raw_data: dict):
        try:
            bronze_data = BronzeContract(**raw_data)
            bronze_doc = bronze_data.model_dump()
            
            bronze_doc.update({
                "ingested_at": datetime.now(timezone.utc).isoformat(),
                "schema_version": SCHEMA_VERSION,
                "pipeline_run_id": self.pipeline_run_id,
                "processed": False  # pending for silver layer
            })
            self.bronze_col.insert_one(bronze_doc)
        
        except Exception as e:
            logger.info(f"Transaction rejected due to validation error: {e}")
            self.rejected_col.insert_one(raw_data)
