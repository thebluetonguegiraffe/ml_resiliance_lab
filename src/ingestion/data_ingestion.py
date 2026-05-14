import argparse
import logging
import os
import random
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient

from config import (
    DATASET_PATH, 
    MONGO_COLLECTION_NAME_RAW, 
    MONGO_DB_NAME, 
    TRAINING_SAMPLES, 
    CORRUPTED_SAMPLES
)

logger = logging.getLogger('data_ingestion')

def generate_corrupted_data(num_samples):
    """Generates a specific number of corrupted samples."""
    records = []
    for _ in range(num_samples):
        amount = random.choice([-10.5, 30000.0, "high_value"]) # Negative, out of bounds, or String
        time = random.choice([0.0, -1.0, None])               # Not > 0
        v_val = random.choice(["ERROR", None, 0.0])           # Noise injection in V columns
        class_val = random.choice([2, "0", -1])               # Out of {0, 1}
    
        record = {
            "time": time,
            "amount": amount,
            "class": class_val,
            "v_features": {}
        }
        
        for j in range(1, 29):
            record["v_features"][f"V{j}"] = v_val
            
        records.append(record)
        
    return records

def get_valid_data(size_mode):
    """Reads the CSV and processes real data based on the selected size."""
    if size_mode == 'tiny':
        df = pd.read_csv(DATASET_PATH, skiprows=range(1, TRAINING_SAMPLES + 1), nrows=9)
    else:
        df = pd.read_csv(DATASET_PATH, skiprows=range(1, TRAINING_SAMPLES + 1))

    df.columns = [c.lower() for c in df.columns]
    v_cols = [c for c in df.columns if c.startswith('v')]
    df['v_features'] = df[v_cols].to_dict(orient='records')
    df_clean = df.drop(columns=v_cols)
    
    return df_clean.to_dict(orient="records")

if __name__ == "__main__":
    load_dotenv()
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    
    parser = argparse.ArgumentParser(description="Data Ingestion & Corrupted Generator for Fraud Detection Pipeline")
    parser.add_argument(
        '--size', 
        type=str, 
        choices=['full', 'tiny'], 
        default='full',
        help="Ingestion size: 'full' (uses constants) or 'tiny' (9 real, 1 corrupted)."
    )
    args = parser.parse_args()

    mongo_uri = os.getenv("MONGO_URI")
    db_name = MONGO_DB_NAME
    collection_name = MONGO_COLLECTION_NAME_RAW
    
    if args.size == 'tiny':
        num_corrupted = 1
        logger.info("TINY mode activated: Loading 9 real samples and 1 corrupted sample.")
    else:
        num_corrupted = CORRUPTED_SAMPLES
        logger.info(f"FULL mode activated: Loading remaining valid samples and {num_corrupted} corrupted samples.")

    logger.info("Processing real data from CSV...")
    valid_records = get_valid_data(args.size)
    
    logger.info("Generating corrupted samples...")
    corrupted_records = generate_corrupted_data(num_corrupted)
    
    all_records = valid_records + corrupted_records
    random.shuffle(all_records)
    logger.info(f"Total records to insert (shuffled): {len(all_records)}")

    try:
        client = MongoClient(mongo_uri)
        db = client[db_name]
        collection = db[collection_name]
        
        result = collection.insert_many(all_records)
        logger.info(f"Success: Uploaded {len(result.inserted_ids)} records to MongoDB in collection '{collection_name}'.")
        
    except Exception as e:
        logger.error(f"Error connecting to MongoDB or inserting data: {e}")
    finally:
        if 'client' in locals():
            client.close()