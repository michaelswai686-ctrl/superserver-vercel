import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;

let cachedClient = globalThis.mongoClient;
let cachedDb = globalThis.mongoDb;

export default async function handler(req, res) {
  if (!cachedClient) {
    try {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
      cachedDb = cachedClient.db("superserver");
      globalThis.mongoClient = cachedClient;
      globalThis.mongoDb = cachedDb;
    } catch (error) {
      console.error("MongoDB connection error:", error);
      return res.status(500).json({ error: "Database connection failed" });
    }
  }

  const db = cachedDb;
  const tasks = db.collection("tasks");

  if (req.method === "GET") {
    try {
      const allTasks = await tasks.find({}).toArray();
      return res.status(200).json(allTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return res.status(500).json({ error: "Failed to fetch tasks" });
    }
  }

  res.status(405).end();
}
