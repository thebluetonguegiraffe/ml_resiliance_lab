import random
import logging
import time
from pymongo import MongoClient
from enum import Enum

from config import MONGO_DB_NAME, TRANSACTIONS_RAW, TRANSACTIONS_RAW

logger = logging.getLogger("producer")


class ProducerMode(Enum):
    NORMAL = "normal"
    DEMO = "demo"
    STRESS = "stress"
    SLOW = "slow"


class Producer:
    def __init__(
        self,
        mongo_client: MongoClient,
    ):
        self.mongo_client = mongo_client
        self.raw_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_RAW]

        self._delay_mapper = {
            ProducerMode.NORMAL: lambda: random.uniform(0.5, 2.0),
            ProducerMode.DEMO: lambda: 0.05,
            ProducerMode.STRESS: lambda: 0.0,
            ProducerMode.SLOW: lambda: 5.0,
        }

    def stream(self, mode: ProducerMode):
        """
        Streams documents from MongoDB sequentially and infinitely.
        The consumer is responsible for stopping the iteration.
        """
        logger.info(f"Starting infinite producer stream in {mode.value} mode")

        random_doc = list(self.raw_col.aggregate([{"$sample": {"size": 1}}]))
        last_id = random_doc[0]["_id"] if random_doc else None

        delay_func = self._delay_mapper.get(mode, lambda: 1.0)

        while True:
            query = {"_id": {"$gt": last_id}} if last_id else {}
            cursor = self.raw_col.find(query).sort("_id", 1)

            docs_found = False
            for doc in cursor:
                docs_found = True
                last_id = doc["_id"]
                
                # Yield the document to whoever is calling next()
                yield doc
                
                # Apply the delay based on the mode
                wait_time = delay_func()
                if wait_time > 0:
                    time.sleep(wait_time)

            if not docs_found:
                logger.info("Reached the end of the source collection. Wrapping around to the start...")
                last_id = None