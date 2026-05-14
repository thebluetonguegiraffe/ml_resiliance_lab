import os
import uuid
import time
import random
import logging
import argparse
from enum import Enum
from dotenv import load_dotenv
from pymongo import MongoClient

# Assuming these are imported from your actual project structure
from config import MONGO_DB_NAME, MONGO_COLLECTION_NAME_RAW, TRANSACTIONS_BRONZE, TRANSACTIONS_GOLD, TRANSACTIONS_REJECTED, TRANSACTIONS_SILVER
from producer import Producer
from src.pipeline.layers.bronze import BronzeLayer
from src.pipeline.layers.silver import SilverLayer
from src.pipeline.layers.gold import GoldLayer

# Enum for the pipeline execution modes
class ProducerMode(Enum):
    NORMAL = "normal"
    DEMO = "demo"
    STRESS = "stress"

logger = logging.getLogger("pipeline_orchestrator")

class Pipeline:
    """
    Orchestrates the streaming data flow through the Medallion architecture.
    Simulates a real-time event-driven system with configurable execution speeds.
    """
    def __init__(self):
        # Initialize MongoDB connection
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        self.mongo_client = MongoClient(mongo_uri)
        self.db_name = MONGO_DB_NAME
        
        # Generate a unique ID for this specific pipeline instantiation
        self.pipeline_run_id = str(uuid.uuid4())
        
        # Initialize the Producer
        self.producer = Producer(
            mongo_client=self.mongo_client,
            db_name=self.db_name,
            coll_name=MONGO_COLLECTION_NAME_RAW,
        )

        # Initialize Medallion Layers
        self.bronze_layer = BronzeLayer(
            mongo_client=self.mongo_client,
            pipeline_run_id=self.pipeline_run_id
        )
        
        self.silver_layer = SilverLayer(
            mongo_client=self.mongo_client,
            pipeline_run_id=self.pipeline_run_id
        )
        
        self.gold_layer = GoldLayer(
            mongo_client=self.mongo_client,
            pipeline_run_id=self.pipeline_run_id
        )


    def _clear_collections(self):
        logger.info("Clearing existing data from all Medallion collections...")
        db = self.mongo_client[self.db_name]
        
        collections_to_clear = [
            TRANSACTIONS_BRONZE,
            TRANSACTIONS_SILVER,
            TRANSACTIONS_GOLD,
            TRANSACTIONS_REJECTED
        ]
        
        for coll in collections_to_clear:
            result = db[coll].delete_many({})
            logger.info(f"Cleared {result.deleted_count} records from '{coll}'")


    def run(self, mode: str, max_samples: int):
        """
        Executes the data pipeline in a pseudo-streaming fashion.
        """

        self._clear_collections()

        logger.info(f"Starting pipeline run ID: {self.pipeline_run_id}")
        logger.info(f"Execution parameters -> Mode: {mode}, Max Samples: {max_samples}")
        
        try:
            # Convert string mode back to Enum for the Producer
            producer_mode = ProducerMode(mode)
            
            # 1. Initialize the generator stream
            raw_data_stream = self.producer.stream(mode=producer_mode, limit=max_samples)
            
            # We can't use len() on a generator, so we log the intent using max_samples
            
            # 2. Process each record sequentially to simulate a real-time stream
            for i, record in enumerate(raw_data_stream, start=1):
                
                # Step A: Ingest into Bronze
                self.bronze_layer.process(record)
                
                # Step B: Pick up unprocessed from Bronze and move to Silver
                self.silver_layer.process()
                
                # Step C: Pick up unprocessed from Silver and move to Gold
                self.gold_layer.process()
                
                # Note: The delay (time.sleep) is now handled natively by the Producer
                # as it yields each document, so we don't need to sleep here anymore.
                
                if i % 10 == 0 or i == max_samples:
                    logger.info(f"Processed {i}/{max_samples} transactions.")

            self.silver_layer.process() 
            self.gold_layer.process()

            logger.info("Pipeline stopped: All transactions have reached the Gold layer.")
            
        except Exception as e:
            logger.error(f"Pipeline execution failed: {str(e)}")
            raise

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
        help="Delay mode: normal (0.5-2s), demo (50ms), stress (0ms)",
    )
    parser.add_argument(
        "--samples",
        type=int,
        default=10,
        help="Number of samples to process before stopping",
    )
    
    args = parser.parse_args()

    # Initialize and execute the pipeline
    pipeline = Pipeline()
    pipeline.run(mode=args.mode, max_samples=args.samples)