import random
import logging
import time
from pymongo import MongoClient
from enum import Enum

from config import INJECTED_EVENTS_QUEUE, MONGO_DB_NAME, TRANSACTIONS_RAW

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
        self.events_col = mongo_client[MONGO_DB_NAME][INJECTED_EVENTS_QUEUE]

        self._delay_mapper = {
            ProducerMode.NORMAL: lambda: random.uniform(0.5, 2.0),
            ProducerMode.DEMO: lambda: 0.05,
            ProducerMode.STRESS: lambda: 0.0,
            ProducerMode.SLOW: lambda: 2.0,
        }

    def stream(self, mode: ProducerMode):
        """
        Streams documents from MongoDB sequentially and infinitely,
        while also injecting manual events from the events queue.
        """
        logger.info(f"Starting infinite producer stream in {mode.value} mode")

        random_doc = list(self.raw_col.aggregate([{"$sample": {"size": 1}}]))
        last_id = random_doc[0]["_id"] if random_doc else None

        delay_func = self._delay_mapper.get(mode, lambda: 1.0)

        while True:
            injected_record = self.events_col.find_one_and_delete({})
            if injected_record:
                injected_record["_from_event_queue"] = True

                logger.info("Producer: Injecting manual event/error into the stream.")
                yield injected_record

                wait_time = delay_func()
                if wait_time > 0:
                    time.sleep(wait_time)

                continue

            query = {"_id": {"$gt": last_id}} if last_id else {}
            doc = self.raw_col.find_one(query, sort=[("_id", 1)])

            if doc:
                last_id = doc["_id"]
                yield doc

                wait_time = delay_func()
                if wait_time > 0:
                    time.sleep(wait_time)
            else:
                logger.info(
                    "Reached the end of the source collection. Wrapping around to the start..."
                )
                last_id = None

                time.sleep(0.2)
