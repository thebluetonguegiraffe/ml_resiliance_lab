import os
import uuid
import logging
import argparse
from dotenv import load_dotenv
from pymongo import MongoClient

from config import (
    FINAL_RESULTS,
    INFERENCE_RESULTS,
    MONGO_DB_NAME,
    TRANSACTIONS_BRONZE,
    TRANSACTIONS_GOLD,
    TRANSACTIONS_REJECTED,
    TRANSACTIONS_SILVER,
    INJECTED_EVENTS_QUEUE,
    TRANSACTIONS_INPUT,
)
from src.pipeline.layers.producer import Producer, ProducerMode
from src.pipeline.layers.bronze import BronzeLayer
from src.pipeline.layers.silver import SilverLayer
from src.pipeline.layers.gold import GoldLayer
from src.pipeline.layers.inference import InferenceLayer
from src.pipeline.layers.decision_engine import TransactionDecisionEngine


logger = logging.getLogger("pipeline")


class Pipeline:
    """
    Orchestrates the streaming data flow through the Medallion architecture.
    Simulates a real-time event-driven system with configurable execution speeds.
    """

    def __init__(self):
        mongo_uri = os.getenv("MONGO_URI")
        self.mongo_client = MongoClient(mongo_uri)
        self.db_name = MONGO_DB_NAME

        self.pipeline_run_id = str(uuid.uuid4())

        self.producer = Producer(
            mongo_client=self.mongo_client,
        )

        self.bronze_layer = BronzeLayer(
            mongo_client=self.mongo_client, pipeline_run_id=self.pipeline_run_id
        )

        self.silver_layer = SilverLayer(
            mongo_client=self.mongo_client, pipeline_run_id=self.pipeline_run_id
        )

        self.gold_layer = GoldLayer(
            mongo_client=self.mongo_client, pipeline_run_id=self.pipeline_run_id
        )

        self.predictor = InferenceLayer(
            mongo_client=self.mongo_client,
            pipeline_run_id=self.pipeline_run_id,
        )

        self.decision_engine = TransactionDecisionEngine(
            mongo_client=self.mongo_client,
            pipeline_run_id=self.pipeline_run_id,
        )

    def _clear_collections(self):
        logger.info("Clearing existing data from all Medallion collections...")
        db = self.mongo_client[self.db_name]

        collections_to_clear = [
            TRANSACTIONS_BRONZE,
            TRANSACTIONS_SILVER,
            TRANSACTIONS_GOLD,
            TRANSACTIONS_REJECTED,
            INJECTED_EVENTS_QUEUE,
            TRANSACTIONS_INPUT,
            INFERENCE_RESULTS,
            FINAL_RESULTS,
        ]

        for coll in collections_to_clear:
            db[coll].delete_many({})

    def run(self, mode: str, max_samples: int):
        self._clear_collections()

        logger.info(f"Starting pipeline run ID: {self.pipeline_run_id}")
        logger.info(f"Execution parameters -> Mode: {mode}, Max Samples: {max_samples}")

        producer_mode = ProducerMode(mode)
        raw_data_stream = self.producer.stream(mode=producer_mode)
        queue_coll = self.mongo_client[self.db_name]["injected_events_queue"]

        self.api_is_down = False
        self.kill_switch_active = False
        self.drift_pct = 0.0

        for _ in range(max_samples):
            record_to_process = None

            injected_record = queue_coll.find_one_and_delete({})

            if injected_record:
                if injected_record.get("is_control_message"):
                    if injected_record.get("target") == "silver_api":
                        self.api_is_down = injected_record.get("is_down")
                        logger.warning(
                            f"SYSTEM ALERT: Silver API 'is_down' set to {self.api_is_down}"
                        )

                    if injected_record.get("target") == "kill_switch":
                        self.kill_switch_active = injected_record.get("is_active")
                        logger.error(
                            "SYSTEM ALERT: Kill switch is active, "
                            "stopping the pipeline run immediately!"
                        )
                        break

                    try:
                        record_to_process = next(raw_data_stream)
                    except StopIteration:
                        break
                else:
                    # It's a malicious data transaction (Events 1, 3, 4)
                    injected_record.pop("_id", None)
                    record_to_process = injected_record
            else:
                try:
                    record_to_process = next(raw_data_stream)
                except StopIteration:
                    break

            if record_to_process:
                input_doc = record_to_process.copy()
                input_doc["_id"] = str(uuid.uuid4())
                self.mongo_client[self.db_name][TRANSACTIONS_INPUT].insert_one(
                    input_doc
                )

            self.bronze_layer.process(record_to_process)

            self.drift_pct = self.silver_layer.process(
                circuit_breaker_open=self.api_is_down
            )

            self.gold_layer.process()

            result = self.predictor.process()
            logger.info(f"Prediction result: {result}")

            self.decision_engine.process()


if __name__ == "__main__":
    load_dotenv()
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    parser = argparse.ArgumentParser(
        description="Pipeline runner for processing transactions"
    )
    parser.add_argument(
        "--mode",
        choices=[item.value for item in ProducerMode],
        default=ProducerMode.NORMAL.value,
        help="Delay mode: slow (5s), normal (0.5-2s), demo (50ms), stress (0ms)",
    )
    parser.add_argument(
        "--samples",
        type=int,
        default=10,
        help="Number of samples to process before stopping",
    )

    args = parser.parse_args()

    pipeline = Pipeline()
    pipeline.run(mode=args.mode, max_samples=args.samples)
