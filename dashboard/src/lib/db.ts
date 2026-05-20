import { MongoClient } from "mongodb";

const options = {};

let clientPromise: Promise<MongoClient>;
const uri = process.env.MONGO_URI;

if (!uri) {
  // Return a rejected promise instead of throwing immediately during module evaluation.
  // This allows 'next build' to compile successfully without env vars, while failing
  // safely at runtime if the variable is still missing when database access is requested.
  clientPromise = Promise.reject(
    new Error(
      "Critical Error: MONGO_URI environment variable is not defined. " +
      "Please define it in your environment or configuration settings."
    )
  );
} else {
  const client = new MongoClient(uri, options);
  if (process.env.NODE_ENV === "development") {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    clientPromise = client.connect();
  }
}

export default clientPromise;
