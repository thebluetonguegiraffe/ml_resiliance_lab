import logging
import os
from dotenv import load_dotenv
import requests

from pymongo import MongoClient

from config import INFERENCE_RESULTS, MONGO_DB_NAME, TRANSACTIONS_GOLD


logger = logging.getLogger("inference_layer")


class InferenceLayer:
    def __init__(
        self,
        mongo_client: MongoClient,
        pipeline_run_id: str,
    ):
        load_dotenv()
        self.gold_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_GOLD]
        self.inference_col = mongo_client[MONGO_DB_NAME][INFERENCE_RESULTS]

        self.pipeline_run_id = pipeline_run_id

        self.mflow_api_url = os.getenv("MLFLOW_API_URL")

    def get_sample(self, record_id: str) -> dict:
        sample = self.gold_col.find_one({"_id": record_id, "processed": False})
        formatted_data = {"_id": sample["_id"], "internal_id": sample["internal_id"]}

        if "time" in sample:
            formatted_data["Time"] = sample["time"]

        if "v_features" in sample:
            for key, value in sample["v_features"].items():
                formatted_data[key.upper()] = value

        if "amount" in sample:
            formatted_data["Amount"] = sample["amount"]

        return formatted_data, sample

    def predict(self, sample: dict) -> dict:
        if not sample:
            raise ValueError("Nothing to predict. Sample data is empty.")

        sample_id = sample.pop("_id")
        internal_id = sample.pop("internal_id")

        payload = {"dataframe_records": [sample]}

        response = requests.post(
            self.mflow_api_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        response.raise_for_status()

        result = response.json()["predictions"][0]

        prediction = result["pred_class"]
        probability = result["fraud_probability"]

        return {
            "_id": sample_id,
            "internal_id": internal_id,
            "pred_class": int(prediction),
            "fraud_probability": float(probability),
        }

    def save_inference(self, prediction_result: dict, original_sample: dict):
        document = {**prediction_result, "processed": False, **original_sample}

        self.inference_col.insert_one(document)

        self.gold_col.update_one({"_id": original_sample["_id"]}, {"$set": {"processed": True}})

    def process(self, record_id: str) -> dict:
        try:
            sample_data, original_sample = self.get_sample(record_id=record_id)

            if sample_data:
                result = self.predict(sample_data)
                self.save_inference(result, original_sample)

            return result
        except Exception as e:
            e.failed_layer = "inference"
            raise e


if __name__ == "__main__":

    mongo_uri = os.getenv("MONGO_URI")
    mongo_client = MongoClient(mongo_uri)

    predictor = InferenceLayer(
        mongo_client=mongo_client,
        pipeline_run_id="test_run_id",
    )

    try:
        result = predictor.process()
        logger.info(f"Prediction result: {result}")

    except Exception as e:
        logger.error(f"Error during inference: {e}")
    finally:
        mongo_client.close()
