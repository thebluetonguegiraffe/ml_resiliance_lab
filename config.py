DATASET_DIR = "dataset/files"
DATASET_PATH = f"{DATASET_DIR}/creditcard.csv"
TRAIN_DATASET_PATH = f"{DATASET_DIR}/train_dataset_balanced.csv"
LAB_DATASET_PATH = f"{DATASET_DIR}/lab_stream_dataset.csv"

TRAINING_SAMPLES = 200000
CORRUPTED_SAMPLES = 10000

MLFLOW_DB = "sqlite:///src/model/mlflow.db"

MONGO_DB_NAME = "fraud_detection"
TRANSACTIONS_RAW = "transactions_raw"
TRANSACTIONS_INPUT = "transactions_input"
TRANSACTIONS_BRONZE = "transactions_bronze"
TRANSACTIONS_REJECTED = "transactions_rejected"
TRANSACTIONS_SILVER = "transactions_silver"
TRANSACTIONS_GOLD = "transactions_gold"
INJECTED_EVENTS_QUEUE = "injected_events_queue"
INFERENCE_RESULTS = "inference_results"
FINAL_RESULTS = "final_results"

PIPELINE_STATUS = "pipeline_status"
PIPELINE_LOGS = "pipeline_logs"

INITIAL_DRIFT_PCT = 50.0
DRIFT_THRESHOLD = 80.0

STATUS_COLL_ID = "current"

SCHEMA_VERSION = "1.0"
FAULT_BURST_SIZE = 5
FAULT_BURST_THRESHOLD = 3
