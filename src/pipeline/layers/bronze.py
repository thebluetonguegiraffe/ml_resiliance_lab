from datetime import datetime, timezone
import logging
from typing import Dict
from pydantic import BaseModel, Field, field_validator
from pymongo import MongoClient

from config import MONGO_DB_NAME, TRANSACTIONS_BRONZE, TRANSACTIONS_REJECTED, SCHEMA_VERSION

logger = logging.getLogger("bronze_layer")


class TransactionContract(BaseModel):
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

    def process(self, data):
        try:
            validated_data = TransactionContract(**data)
            bronze_doc = validated_data.model_dump(by_alias=True)
            bronze_doc.update({
                "ingested_at": datetime.now(timezone.utc).isoformat(),
                "schema_version": SCHEMA_VERSION,
                "pipeline_run_id": self.pipeline_run_id,
                "processed": False
            })
            db = self.mongo_client[MONGO_DB_NAME]
            db[TRANSACTIONS_BRONZE].insert_one(bronze_doc)
        except Exception as e:
            logger.info("Transaction rejected due to validation error")
            db = self.mongo_client[MONGO_DB_NAME]
            db[TRANSACTIONS_REJECTED].insert_one(data)
