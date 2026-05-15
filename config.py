DATASET_DIR = "dataset/files"
DATASET_PATH = f"{DATASET_DIR}/creditcard.csv"
TRAIN_DATASET_PATH = f"{DATASET_DIR}/train_dataset_balanced.csv"
LAB_DATASET_PATH = f"{DATASET_DIR}/lab_stream_dataset.csv"

TRAINING_SAMPLES = 200000
CORRUPTED_SAMPLES = 10000

MLFLOW_DB = "sqlite:///src/model/mlflow.db"
MODEL_VERSION = 5

MONGO_DB_NAME = "fraud_detection"
TRANSACTIONS_RAW = "transactions_raw"
TRANSACTIONS_BRONZE = "transactions_bronze"
TRANSACTIONS_REJECTED = "transactions_rejected"
TRANSACTIONS_SILVER = "transactions_silver"
TRANSACTIONS_GOLD = "transactions_gold"
INJECTED_EVENTS_QUEUE = "injected_events_queue"
INFERENCE_RESULTS = "inference_results"
FINAL_RESULTS = "final_results"

SCHEMA_VERSION = "1.0"