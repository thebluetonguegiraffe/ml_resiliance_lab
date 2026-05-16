import logging
from typing import Dict
from datetime import datetime, timezone
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
    tx_count_last_1s: int = Field(..., description="Transactions in the last second")
    high_velocity_alert: bool = Field(
        ..., description="Deterministic flag if tx_count_last_1s > 10"
    )


class GoldLayer:
    def __init__(self, mongo_client: MongoClient, pipeline_run_id: str):
        self.silver_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_SILVER]
        self.gold_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_GOLD]

        self.pipeline_run_id = pipeline_run_id

    def _get_tx_count_last_1s(self, current_time: float) -> int:
        time_1s_ago = current_time - 1

        count = self.silver_col.count_documents(
            {"time": {"$gte": time_1s_ago, "$lte": current_time}}
        )
        return count

    from datetime import datetime, time

    def _check_time_drift(self):
        four_am_seconds = 14400.0  # 4:00 AM
        four_thirty_am = 16200.0  # 4:30 AM (14400 + 1800)

        tx_in_target_time = self.silver_col.count_documents(
            {"time": {"$gte": four_am_seconds, "$lte": four_thirty_am}}
        )

        if tx_in_target_time > 10:
            self.drift_pct = tx_in_target_time * 1.40
        else:
            self.drift_pct = float(tx_in_target_time)

        if tx_in_target_time > 400 and not self.pipeline.kill_switch_active:
            self.queue_coll.insert_one(
                {
                    "is_control_message": True,
                    "target": "kill_switch",
                    "is_active": True,
                    "reason": f"time_drift_anomaly_{tx_in_target_time}_tx",
                }
            )

    def process(self):
        silver_docs = list(self.silver_col.find({"processed": False}))

        if not silver_docs:
            logger.info("No new transactions in Silver to process.")
            return

        for silver_doc in silver_docs:
            try:
                self._check_time_drift()
                tx_count = self._get_tx_count_last_1s(silver_doc["time"])
                high_velocity = tx_count > 10

                gold_data = {
                    **silver_doc,
                    "tx_count_last_1s": tx_count,
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
                    {"_id": silver_doc["_id"]}, {"$set": {"processed": True}}
                )

            except Exception as e:
                logger.error(f"Error processing doc {silver_doc.get('_id')} in Gold: {str(e)}")

        return self.drift_pct
