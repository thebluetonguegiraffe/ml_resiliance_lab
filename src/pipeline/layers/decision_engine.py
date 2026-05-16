from enum import StrEnum
import logging

from pymongo import MongoClient

from config import INFERENCE_RESULTS, MONGO_DB_NAME, FINAL_RESULTS

logger = logging.getLogger("decision_engine")


class TransactionStatus(StrEnum):
    PENDING = "pending_decision"
    APPROVED = "APPROVED"
    DENIED = "DENIED"
    TO_REVISE = "TO_REVISE"


class TransactionDecisionEngine:
    def __init__(
        self,
        mongo_client: MongoClient,
        pipeline_run_id: str,
        safe_threshold: float = 0.30,
        deny_threshold: float = 0.80,
    ):
        self.pipeline_run_id = pipeline_run_id

        # Define the thresholds
        self.safe_threshold = safe_threshold
        self.deny_threshold = deny_threshold

        self.inference_col = mongo_client[MONGO_DB_NAME][INFERENCE_RESULTS]
        self.final_col = mongo_client[MONGO_DB_NAME][FINAL_RESULTS]

    def process(self):
        pending_docs = self.inference_col.find({"processed": False})
        for doc in pending_docs:
            self._evaluate_and_update(doc)

    def _evaluate_and_update(self, doc: dict):
        probability = doc.get("fraud_probability")
        doc_id = doc["_id"]

        credit_score = doc.get("credit_score")
        tx_count_last_1s = doc.get("tx_count_last_1s")
        if probability >= self.deny_threshold:
            new_status = TransactionStatus.DENIED
            reason = f"Probability ({probability:.2%}) exceeds the denial threshold."

        elif credit_score == 0:
            new_status = TransactionStatus.TO_REVISE
            reason = "Credit Score is 0. Requires manual review of history."

        elif tx_count_last_1s > 10:
            new_status = TransactionStatus.TO_REVISE
            reason = f"High transaction velocity ({tx_count_last_1s} in the last s). Possible account takeover."  # noqa

        elif probability >= self.safe_threshold:
            new_status = TransactionStatus.TO_REVISE
            reason = f"Probability ({probability:.2%}) in the gray area. Requires manual review."

        else:
            new_status = TransactionStatus.APPROVED
            reason = (
                f"Probability ({probability:.2%}) is safe and transactional behavior is normal."
            )

        self.final_col.insert_one({"_id": doc_id, "status": new_status, "decision_reason": reason})

    def close_connection(self):
        self.mongo_client.close()
