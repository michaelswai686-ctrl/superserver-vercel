import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable in Vercel");
}

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // Use a global variable in dev to avoid creating multiple connections
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, just create a new client
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
