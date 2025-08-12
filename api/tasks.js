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
      console.log("Connected to MongoDB successfully");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return res.status(500).json({ error: "Database connection failed", details: error.message });
  }

  if (!cachedDb) {
    console.error("Database object is undefined after connection");
    return res.status(500).json({ error: "Database not initialized" });
  }

  const tasks = cachedDb.collection("tasks");

  if (req.method === "GET") {
    try {
      const allTasks = await tasks.find({}).toArray();
      return res.status(200).json(allTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ error: "Failed to fetch tasks", details: err.message });
    }
  }

  res.status(405).end();
}
