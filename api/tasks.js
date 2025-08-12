import { MongoClient, ObjectId } from "mongodb";

const rawUri = process.env.MONGODB_URI || "";
const uri = rawUri.trim();

let cachedClient = globalThis.mongoClient;
let cachedDb = globalThis.mongoDb;

export default async function handler(req, res) {
  if (!uri) {
    console.error("MONGODB_URI missing or empty");
    return res.status(500).json({ error: "Missing DB config" });
  }

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
      cachedDb = cachedClient.db("superserver");
      globalThis.mongoClient = cachedClient;
      globalThis.mongoDb = cachedDb;
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    return res.status(500).json({ error: "Database connection failed" });
  }

  const db = cachedDb;
  if (!db) {
    console.error("Database not initialized");
    return res.status(500).json({ error: "Database not initialized" });
  }

  const tasks = db.collection("tasks");

  if (req.method === "GET") {
    const allTasks = await tasks.find({}).toArray();
    return res.status(200).json(allTasks);
  }

  // other HTTP methods...

  res.status(405).end();
}
