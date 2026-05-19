from datetime import datetime, timezone
import logging
from typing import Any, Dict
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

from pydantic_core import PydanticCustomError

from pymongo import MongoClient

from config import (
    MONGO_DB_NAME,
    TRANSACTIONS_BRONZE,
    TRANSACTIONS_INPUT,
    TRANSACTIONS_REJECTED,
    SCHEMA_VERSION,
)
from src.utils.contract import PyObjectId
from src.utils.validation import parse_validation_error

logger = logging.getLogger("bronze_layer")


class BronzeLayerException(Exception):
    pass


class BronzeContract(BaseModel):
    id: PyObjectId = Field(..., alias="_id")
    internal_id: int | str = Field(..., description="Internal ID for UI tracking")
    time: float = Field(..., description="Transaction time")
    amount: float = Field(..., description="Transaction amount")

    v_features: Dict[str, float]

    @field_validator("time", mode="before")
    @classmethod
    def check_time(cls, v: float) -> float:
        try:
            if v is None:
                raise PydanticCustomError("time_missing", "Time is required")
            val = float(v)
            if val <= 0:
                raise PydanticCustomError("negative_time", "Negative time")
            return val
        except (ValueError, TypeError):
            raise PydanticCustomError("invalid_time", "Invalid time")

    @field_validator("amount")
    def check_amount(cls, v: Any) -> float:
        try:
            if isinstance(v, str):
                raise PydanticCustomError(
                    "invalid_float_type", "Not numerical Amount"
                )
            if v < 0.0:
                raise PydanticCustomError(
                    "greater_than_or_equal_zero",
                    "Negative amount",
                )
            return v
        except (ValueError, TypeError):
            raise PydanticCustomError("invalid_amount", "Invalid amount")

    @field_validator("v_features", mode="before")
    def check_v_contents(cls, v: Dict[str, Any]) -> Dict[str, float]:
        try:
            if len(v) != 28:
                raise PydanticCustomError(
                    "missing_v_features",
                    "Missing V features",
                    {"value": len(v)},
                )

            invalid_features = []
            for key, value in v.items():
                if not isinstance(value, (int, float)):
                    invalid_features.append(f"'{key}' ({type(value).__name__})")

            if invalid_features:
                raise PydanticCustomError(
                    "invalid_float_type",
                    "V features must be numerical",
                )

            return v
        except (ValueError, TypeError):
            raise PydanticCustomError(
                "invalid_v_features",
                f"Invalid v_features: {v}",
            )

    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)


class BronzeLayer:
    def __init__(self, mongo_client: MongoClient, pipeline_run_id: str):
        self.mongo_client = mongo_client

        self.bronze_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_BRONZE]
        self.rejected_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_REJECTED]
        self.input_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_INPUT]

        self.pipeline_run_id = pipeline_run_id

    def process(self, raw_data: dict):
        try:
            bronze_data = BronzeContract(**raw_data)
            bronze_doc = bronze_data.model_dump(by_alias=True)

            bronze_doc.update(
                {
                    "ingested_at": datetime.now(timezone.utc).isoformat(),
                    "schema_version": SCHEMA_VERSION,
                    "pipeline_run_id": self.pipeline_run_id,
                    "processed": False,  # pending for silver layer
                }
            )
            self.bronze_col.insert_one(bronze_doc)

        except ValidationError as e:
            errors = parse_validation_error(e)
            error_str = "; ".join(err["message"] for err in errors)
            logger.debug(f"Transaction rejected due to validation error: {errors}")
            raw_data["rejection_reason"] = error_str
            raw_data["rejected_at_layer"] = "bronze"
            raw_data["processed"] = False
            self.rejected_col.insert_one(raw_data)
            e.failed_layer = "bronze"
            raise e
        finally:
            self.input_col.update_one({"_id": raw_data["_id"]}, {"$set": {"processed": True}})
