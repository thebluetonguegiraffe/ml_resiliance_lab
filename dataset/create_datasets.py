import logging
import pandas as pd
from sklearn.model_selection import train_test_split
from config import DATASET_DIR, DATASET_PATH, LAB_DATASET_PATH, TRAIN_DATASET_PATH, TRAINING_SAMPLES

logger = logging.getLogger("datasets_creation")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    df = pd.read_csv(DATASET_PATH)
    train_df, lab_df = train_test_split(
        df,
        train_size=TRAINING_SAMPLES,
        random_state=42,
        stratify=df['Class'] 
    )

    logger.info(f"Training set size: {len(train_df)} rows")
    logger.info(f"Lab (Streaming) set size: {len(lab_df)} rows")

    train_output = TRAIN_DATASET_PATH
    lab_output = LAB_DATASET_PATH

    logger.info("Saving new datasets to disk...")
    train_df.to_csv(train_output, index=False)
    lab_df.to_csv(lab_output, index=False)

    logger.info("'train_dataset_balanced.csv' created to train the model.")
    logger.info("'lab_stream_dataset.csv' created as transactions source for the Producer.")