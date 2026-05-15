import os

import pandas as pd
import mlflow.sklearn
from pymongo import MongoClient

from config import INFERENCE_RESULTS, MLFLOW_DB, MODEL_VERSION, MONGO_DB_NAME, TRANSACTIONS_GOLD


class InferenceLayer:
    def __init__(self, mongo_client: MongoClient, model_version: str, pipeline_run_id: str):
        self.gold_col = mongo_client[MONGO_DB_NAME][TRANSACTIONS_GOLD]
        self.inference_col = mongo_client[MONGO_DB_NAME][INFERENCE_RESULTS]

        self.pipeline_run_id = pipeline_run_id

        mlflow.set_tracking_uri(MLFLOW_DB)
        model_name = "fraud-detector"
        model_uri = f"models:/{model_name}/{model_version}"

        self.model = mlflow.sklearn.load_model(model_uri)

    def get_sample(self) -> dict:
        sample = self.gold_col.find_one()
        formatted_data = {"_id": sample["_id"]}

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

        df_sample = pd.DataFrame([sample])

        prediction = self.model.predict(df_sample)

        probability = self.model.predict_proba(df_sample)[0][1]

        return {
            "_id": sample_id,
            "pred_class": int(prediction[0]),
            "fraud_probability": float(probability),
        }

    def save_inference(self, prediction_result: dict, original_sample: dict):
        document = {
            **prediction_result,
            "processed": False,
            **original_sample
        }

        self.inference_col.insert_one(document)

    def process(self) -> dict:
        sample_data, original_sample = self.get_sample()

        if sample_data:
            result = self.predict(sample_data)
            self.save_inference(result, original_sample)

        return result


if __name__ == "__main__":

    mongo_uri = os.getenv("MONGO_URI")
    mongo_client = MongoClient(mongo_uri)

    predictor = InferenceLayer(
        mongo_client=mongo_client,
        model_version=MODEL_VERSION,
    )

    try:
        result = predictor.process()
        print(f"Prediction result: {result}")

    except Exception as e:
        print(f"Error during inference: {e}")
    finally:
        mongo_client.close()
