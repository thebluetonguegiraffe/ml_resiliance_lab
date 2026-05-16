import argparse
import os
import logging
from dotenv import load_dotenv
from pymongo import MongoClient

from config import MONGO_DB_NAME, TRANSACTIONS_RAW, INJECTED_EVENTS_QUEUE, FAULT_BURST_SIZE

logger = logging.getLogger("fault_injector")


class FaultInjector:
    """
    Classifies and injects faults into the pipeline to test resilience patterns.
    Events are categorized into: Data Contract, Data Drift, and Circuit Breaker.
    """

    def __init__(self, mongo_client: MongoClient):
        self.queue_coll = mongo_client[MONGO_DB_NAME][INJECTED_EVENTS_QUEUE]
        self.raw_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_RAW]

    def _get_records(self, size: int = 1) -> list:
        pipeline = [{"$sample": {"size": size}}]
        real_docs = list(self.raw_col.aggregate(pipeline))
        return real_docs

    # ==========================================
    # CATEGORY 1: DATA CONTRACT FAULTS
    # Goal: Test schema validation and immediate rejection.
    # ==========================================

    def inject_contract_violation(self):
        """
        EVENT 1: Invalid Transaction.
        Injects a record with an impossible amount to trigger Bronze Pydantic validation.
        """
        record = self._get_records()[0]
        record["amount"] = -999.0
        self.queue_coll.insert_one(record)
        logger.info("Data Contract Fault injected: Invalid amount (-999).")

    # ==========================================
    # CATEGORY 2: DATA DRIFT FAULTS
    # Goal: Test statistical monitoring and KILL SWITCH (Halt).
    # ==========================================

    def inject_drift_burst(self, size: int = FAULT_BURST_SIZE):
        """
        EVENT 3: Time Bucket Drift.
        Injects a burst of transactions at 04:00 AM (14400 seconds).
        Statistically, 4 AM has the lowest baseline, making this drift highly visible.
        """
        drift_records = []
        # 4 AM = 4 * 3600 seconds
        four_am_seconds = 14400.0

        records = self._get_records(size)
        for record in records:
            record["time"] = four_am_seconds
            drift_records.append(record)

        self.queue_coll.insert_many(drift_records)
        logger.info(f"Data Drift Fault injected: Burst of {size} records at 04:00 AM.")

    # ==========================================
    # CATEGORY 3: CIRCUIT BREAKER FAULTS
    # Goal: Test infrastructure resilience and Human Review escalation.
    # ==========================================

    def toggle_api_circuit_breaker(self, is_down: bool):
        """
        EVENT 2: External API Failure.
        Sends a control message to simulate an external dependency outage.
        Should result in Fallback (Score 0) + Human Review escalation.
        """
        control_message = {
            "is_control_message": True,
            "target": "silver_api",
            "is_down": is_down,
        }
        self.queue_coll.insert_one(control_message)
        status = "OPEN (Down)" if is_down else "CLOSED (Up)"
        logger.info(f"Circuit Breaker state toggled: API is {status}.")

    def inject_velocity_burst(self, count: int = FAULT_BURST_SIZE):
        """
        EVENT 4: High Velocity (Fraud Rule).
        Injects many records with the same timestamp.
        Should trip the deterministic rule (tx_count > 10) and escalate to human review.
        """
        velocity_records = []
        fixed_time = 20000.0
        records = self._get_records(count)
        for record in records:
            record["time"] = fixed_time
            velocity_records.append(record)

        self.queue_coll.insert_many(velocity_records)
        logger.info(
            f"Circuit Breaker Fault injected: {count} simultaneous records for Velocity trip."
        )


if __name__ == "__main__":
    load_dotenv()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    parser = argparse.ArgumentParser(
        description="CLI Tool to inject faults into the ML Resilience Lab"
    )
    parser.add_argument(
        "--event",
        type=str,
        required=True,
        choices=["invalid_tx", "api_down", "api_up", "time_drift", "high_velocity"],
        help="Specify which fault event to trigger.",
    )

    args = parser.parse_args()

    mongo_uri = os.getenv("MONGO_URI")
    client = MongoClient(mongo_uri)

    injector = FaultInjector(mongo_client=client)

    if args.event == "invalid_tx":
        injector.inject_contract_violation()
    elif args.event == "api_down":
        injector.toggle_api_circuit_breaker(is_down=True)
    elif args.event == "api_up":
        injector.toggle_api_circuit_breaker(is_down=False)
    elif args.event == "time_drift":
        injector.inject_drift_burst()
    elif args.event == "high_velocity":
        injector.inject_velocity_burst()

    logger.info(f"CLI execution finished for event: {args.event}")
