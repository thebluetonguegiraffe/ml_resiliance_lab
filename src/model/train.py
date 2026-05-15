import argparse
import logging
from enum import StrEnum
import os
import pandas as pd

from config import DATASET_PATH, TRAIN_DATASET_PATH, TRAINING_SAMPLES

MLFLOW_DB = "sqlite:///src/model/mlflow.db"
MLFLOW_ARTIFACTS = os.path.abspath("src/model/mlruns")

import mlflow
import mlflow.sklearn

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report

import xgboost as xgb


class DatasetConfig(StrEnum):
    SMALL = "small"
    FULL = "full"


logger = logging.getLogger(__name__)


MODELS_MAPPER = {
    "rf": {
        "model": RandomForestClassifier,
        "params": {
            "n_estimators": 50,
            "max_depth": 8,
            "random_state": 42,
        },
    },
    "xgb": {
        "model": xgb.XGBClassifier,
        "params": {
            "n_estimators": 50,
            "max_depth": 8,
            "random_state": 42,
            "learning_rate": 0.1,
            "eval_metric": "aucpr",
        },
    },
}


mlflow.set_tracking_uri(MLFLOW_DB)


def train(
    model_config: str,
    dataset_config: DatasetConfig = DatasetConfig.FULL,
    run_name: str = None,
):
    if run_name is None:
        run_name = f"{model_config}_{dataset_config.value}_baseline"

    logger.info(f"Training {model_config} on {dataset_config.value} dataset...")

    params = MODELS_MAPPER[model_config]["params"]

    if dataset_config == DatasetConfig.SMALL:
        frauds = pd.read_csv(DATASET_PATH).query("Class == 1").head(50)
        normal = pd.read_csv(DATASET_PATH).query("Class == 0").head(950)
        df = pd.concat([frauds, normal]).sample(frac=1)
    elif dataset_config == DatasetConfig.FULL:
        df = pd.read_csv(TRAIN_DATASET_PATH)

    X = df.drop("Class", axis=1)
    y = df["Class"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=params["random_state"]
    )

    if model_config == "xgb":
        params["scale_pos_weight"] = (y_train == 0).sum() / (y_train == 1).sum()

    client = mlflow.tracking.MlflowClient()
    try:
        client.create_experiment(
            name="fraud-detection",
            artifact_location=MLFLOW_ARTIFACTS,
        )
    except mlflow.exceptions.MlflowException:
        pass

    mlflow.set_experiment(f"fraud-detection")

    model = MODELS_MAPPER[model_config]["model"](**params)

    with mlflow.start_run(run_name=run_name):
        mlflow.log_params(params)
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]

        report_dict = classification_report(y_test, y_pred, output_dict=True)
        auc = roc_auc_score(y_test, y_prob)

        # save metrics to mlflow
        mlflow.log_metric("roc_auc", auc)
        mlflow.log_metric("precision_fraude", report_dict["1"]["precision"])
        mlflow.log_metric("recall_fraude", report_dict["1"]["recall"])
        mlflow.log_metric("f1_fraude", report_dict["1"]["f1-score"])

        logger.info(f"\nROC-AUC: {auc:.4f}")
        logger.info(report_dict)

        model_info = mlflow.sklearn.log_model(
            model,
            artifact_path="model",
            registered_model_name="fraud-detector",
        )

        eval_data = pd.DataFrame(X_test.values, columns=X_test.columns)
        eval_data["label"] = y_test.values

        mlflow.evaluate(
            model=model_info.model_uri,
            data=eval_data,
            targets="label",
            model_type="classifier",
            evaluators=["default"],
        )

    logger.info("Done!")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    parser = argparse.ArgumentParser(description="Credit Card Fraud Detection Training Pipeline")
    parser.add_argument(
        "--model",
        type=str,
        required=True,
        choices=MODELS_MAPPER.keys(),
        help="Model to train: 'rf' for Random Forest or 'xgb' for XGBoost",
    )

    parser.add_argument(
        "--dataset",
        type=str,
        choices=[item.value for item in DatasetConfig],
        help="Dataset size: 'small' (1k samples) or 'full' (100k samples)",
    )

    parser.add_argument(
        "--run-name",
        type=str,
        help="Name for the MLflow run (optional, default: <model>_<dataset>_baseline)",
    )

    args = parser.parse_args()

    train(
        model_config=args.model, dataset_config=DatasetConfig(args.dataset), run_name=args.run_name
    )
