import argparse
import logging
import os
import random
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient

from config import (
    TRANSACTIONS_RAW, 
    MONGO_DB_NAME,
    LAB_DATASET_PATH, 
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

def get_valid_data():
    df = pd.read_csv(LAB_DATASET_PATH)

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

    mongo_uri = os.getenv("MONGO_URI")
    db_name = MONGO_DB_NAME
    collection_name = TRANSACTIONS_RAW
    
    valid_records = get_valid_data()
    
    logger.info("Generating corrupted samples...")
    corrupted_records = generate_corrupted_data(CORRUPTED_SAMPLES)
    
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