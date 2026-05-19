import os
import time
import uuid
import logging
import argparse
import concurrent
from dotenv import load_dotenv
from pydantic_core import ValidationError
from pymongo import MongoClient

from config import (
    FINAL_RESULTS,
    INFERENCE_RESULTS,
    MONGO_DB_NAME,
    PIPELINE_STATUS,
    STATUS_COLL_ID,
    TRANSACTIONS_BRONZE,
    TRANSACTIONS_GOLD,
    TRANSACTIONS_REJECTED,
    TRANSACTIONS_SILVER,
    TRANSACTIONS_INPUT,
    PIPELINE_LOGS
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
        self.system_status_coll = self.mongo_client[self.db_name][PIPELINE_STATUS]

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
            TRANSACTIONS_INPUT,
            TRANSACTIONS_BRONZE,
            TRANSACTIONS_SILVER,
            TRANSACTIONS_GOLD,
            TRANSACTIONS_REJECTED,
            INFERENCE_RESULTS,
            FINAL_RESULTS,
            PIPELINE_LOGS,
        ]

        for coll in collections_to_clear:
            db[coll].delete_many({})

    def set_initial_pipeline_status(self):
        self.system_status_coll.update_one(
            {"_id": STATUS_COLL_ID},
            {"$set": {"kill_switch": False, "drift_level": 0}},
            upsert=True,
        )

    def _process_single_transaction(self, record, visual_delay):
        try:
            record["processed"] = False
            self.mongo_client[self.db_name][TRANSACTIONS_INPUT].insert_one(record)
            time.sleep(visual_delay)

            self.bronze_layer.process(record)
            time.sleep(visual_delay)

            record_id = record.get("_id")

            self.silver_layer.process(api_status=self.api_is_up, record_id=record_id)
            time.sleep(visual_delay)

            self.gold_layer.process(drift_pct=self.drift_pct, record_id=record_id)
            time.sleep(visual_delay)

            result = self.predictor.process(record_id=record_id)
            result.pop("_id")
            logger.info(f"Prediction result: {result}")
            time.sleep(visual_delay)

            self.decision_engine.process(record_id=record_id)

        except Exception as e:
            if isinstance(e, ValidationError):
                error_msg = "; ".join(
                    err["msg"].removeprefix("Value error, ")
                    for err in e.errors()
                )
            else:
                error_msg = str(e)

            if hasattr(e, "failed_layer"):
                logger.error(
                    f"Error in transaction {record.get('internal_id')} - Layer: {e.failed_layer} - Error: {error_msg}"  # noqa
                )
            else:
                logger.error(
                    f"Unexpected error in transaction {record.get('internal_id')}: {error_msg}"
                )

    def run(self, mode: str, max_samples: int, max_workers: int):
        self._clear_collections()
        self.set_initial_pipeline_status()

        logger.info(f"Starting pipeline run ID: {self.pipeline_run_id}")
        logger.info(
            f"Execution parameters -> Mode: {mode}, Max Samples: {max_samples}, Max Workers: {max_workers}"  # noqa
        )

        producer_mode = ProducerMode(mode)
        raw_data_stream = self.producer.stream(mode=producer_mode)

        visual_delay = 1.5

        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            samples_processed = 0
            current_id_counter = 0
            active_futures = set()

            while True:
                pending_injected = self.producer.events_col.count_documents({})
                if samples_processed >= max_samples and pending_injected == 0:
                    logger.info("Target samples reached and event queue is empty. Stopping stream.")
                    break

                # get system status
                sys_status = self.system_status_coll.find_one() or {}
                self.kill_switch_active = sys_status.get("kill_switch")
                self.api_is_up = sys_status.get("api_is_up")
                self.drift_pct = sys_status.get("drift_level")

                if self.kill_switch_active:
                    logger.warning("Kill switch is active. Stopping pipeline execution.")
                    break

                if len(active_futures) >= max_workers:
                    done, active_futures = concurrent.futures.wait(
                        active_futures, return_when=concurrent.futures.FIRST_COMPLETED
                    )
                    for future in done:
                        exc = future.exception()
                        if exc:
                            logger.error(f"¡Error in thread !: {exc}")

                try:
                    record = next(raw_data_stream)
                except StopIteration:
                    break

                if "internal_id" not in record:
                    record["internal_id"] = current_id_counter
                    current_id_counter += 1

                if record.get("_from_event_queue"):
                    future = executor.submit(self._process_single_transaction, record, visual_delay)
                    active_futures.add(future)
                else:
                    if samples_processed >= max_samples:
                        continue

                    samples_processed += 1
                    future = executor.submit(self._process_single_transaction, record, visual_delay)
                    active_futures.add(future)

        if not self.kill_switch_active:
            logger.info("Pipeline run finished. All background processing is complete.")


if __name__ == "__main__":
    load_dotenv()
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    parser = argparse.ArgumentParser(description="Pipeline runner for processing transactions")
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
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help="Number of worker threads to use",
    )

    args = parser.parse_args()

    pipeline = Pipeline()
    pipeline.run(mode=args.mode, max_samples=args.samples, max_workers=args.workers)
