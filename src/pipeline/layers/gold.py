import logging
from typing import Dict
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, Field, ValidationError

from pymongo import MongoClient

from config import (
    DRIFT_THRESHOLD,
    FAULT_BURST_THRESHOLD,
    INITIAL_DRIFT_PCT,
    MONGO_DB_NAME,
    PIPELINE_STATUS,
    STATUS_COLL_ID,
    TRANSACTIONS_GOLD,
    TRANSACTIONS_SILVER,
    TRANSACTIONS_REJECTED,
    SCHEMA_VERSION,
)
from src.utils.contract import PyObjectId

logger = logging.getLogger("gold_layer")


class GoldContract(BaseModel):
    id: PyObjectId = Field(..., alias="_id")
    internal_id: int | str = Field(..., description="Internal ID for UI tracking")
    time: float
    amount: float
    credit_score: int
    v_features: Dict[str, float]

    # New Gold fields
    tx_count_last_1s: int = Field(..., description="Transactions in the last second")
    high_velocity_alert: bool = Field(
        ..., description="Deterministic flag if tx_count_last_1s > 10"
    )

    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)


class GoldLayer:
    def __init__(self, mongo_client: MongoClient, pipeline_run_id: str):
        self.silver_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_SILVER]
        self.gold_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_GOLD]
        self.rejected_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_REJECTED]

        self.system_status_coll = mongo_client[MONGO_DB_NAME][PIPELINE_STATUS]

        self.pipeline_run_id = pipeline_run_id

    def _get_tx_count_last_1s(self, current_time: float) -> int:
        time_1s_ago = current_time - 1

        count = self.silver_col.count_documents(
            {"time": {"$gte": time_1s_ago, "$lte": current_time}}
        )
        return count

    def _check_time_drift(self, drift_pct: float):
        four_am_seconds = 14400.0  # 4:00 AM
        four_thirty_am = 18000.0  # 5:00 PM

        tx_in_target_time = self.silver_col.count_documents(
            {"time": {"$gte": four_am_seconds, "$lte": four_thirty_am}}
        )

        if tx_in_target_time > FAULT_BURST_THRESHOLD:
            if drift_pct == 0:
                updated_drift_pct = INITIAL_DRIFT_PCT
            else:
                updated_drift_pct = drift_pct * 2

            control_document = {
                "drift_level": updated_drift_pct,
            }

            if updated_drift_pct > DRIFT_THRESHOLD:
                control_document["kill_switch"] = True

            self.system_status_coll.update_one(
                {"_id": STATUS_COLL_ID}, {"$set": control_document}
            )

    def process(self, drift_pct: float, record_id: str):
        silver_docs = list(self.silver_col.find({"processed": False, "_id": record_id}))

        if not silver_docs:
            logger.info("No new transactions in Silver to process.")
            return

        for silver_doc in silver_docs:
            try:
                self._check_time_drift(drift_pct=drift_pct)
                tx_count = self._get_tx_count_last_1s(silver_doc["time"])
                high_velocity = tx_count > FAULT_BURST_THRESHOLD

                gold_data = {
                    **silver_doc,
                    "tx_count_last_1s": tx_count,
                    "high_velocity_alert": high_velocity,
                }

                validated_data = GoldContract(**gold_data)
                gold_doc = validated_data.model_dump(by_alias=True)

                gold_doc.update(
                    {
                        "aggregated_at": datetime.now(timezone.utc),
                        "schema_version": SCHEMA_VERSION,
                        "pipeline_run_id": self.pipeline_run_id,
                        "processed": False,  # Pending for inference
                    }
                )

                self.gold_col.insert_one(gold_doc)
                self.silver_col.update_one(
                    {"_id": silver_doc["_id"]}, {"$set": {"processed": True}}
                )

            except ValidationError as e:
                logger.info(f"Transaction rejected due to validation error: {e}")
                silver_doc["rejection_reason"] = f"Gold Layer Exception: {str(e)}"
                silver_doc["rejected_at_layer"] = "gold"
                silver_doc["processed"] = False
                self.rejected_col.insert_one(silver_doc)
                e.failed_layer = "gold"
                raise e

            finally:
                self.silver_col.update_one(
                    {"_id": silver_doc["_id"]}, {"$set": {"processed": True}}
                )
