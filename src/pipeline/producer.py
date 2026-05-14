import random
import time
import logging
from pymongo import MongoClient
from enum import Enum

logger = logging.getLogger("producer")


class ProducerMode(Enum):
    NORMAL = "normal"
    DEMO = "demo"
    STRESS = "stress"


class Producer:
    def __init__(
        self,
        mongo_client: MongoClient,
        db_name: str,
        coll_name: str,
        mode: ProducerMode = ProducerMode.NORMAL,
    ):
        self.mongo_client = mongo_client
        self.db_name = db_name
        self.coll_name = coll_name
        self.mode = mode

        self._delay_mapper = {
            ProducerMode.NORMAL: lambda: random.uniform(0.5, 2.0),
            ProducerMode.DEMO: lambda: 0.05,
            ProducerMode.STRESS: lambda: 0.0,
        }

    def stream(self, mode: ProducerMode, limit: int = None):
        """
        Streams documents from MongoDB sequentially.
        If 'limit' is provided, the generator will yield exactly that amount and then stop.
        """
        logger.info(f"Starting producer stream in {mode.value} mode with limit: {limit}")
        db = self.mongo_client[self.db_name]
        self.collection = db[self.coll_name]

        # Get a random starting point
        random_doc = list(self.collection.aggregate([{"$sample": {"size": 1}}]))
        last_id = random_doc[0]["_id"] if random_doc else None

        delay_func = self._delay_mapper.get(mode, lambda: 1.0)

        samples_produced = 0

        while True:
            # Query fetches only documents strictly greater than the last processed ID
            query = {"_id": {"$gt": last_id}} if last_id else {}

            # Optimize MongoDB fetch if a limit is set
            cursor = self.collection.find(query).sort("_id", 1)
            if limit:
                remaining_samples = limit - samples_produced
                cursor = cursor.limit(remaining_samples)

            docs_found = False
            for doc in cursor:
                docs_found = True
                last_id = doc["_id"]  # Update last_id to avoid fetching this document again

                yield doc
                samples_produced += 1

                # Stop the generator if the limit is reached
                if limit and samples_produced >= limit:
                    logger.info(f"Reached the requested limit of {limit} samples. Stopping stream.")
                    return

                wait_time = delay_func()
                if wait_time > 0:
                    time.sleep(wait_time)

            if not docs_found:
                logger.info("Source collection exhausted. Stopping producer stream.")
                return