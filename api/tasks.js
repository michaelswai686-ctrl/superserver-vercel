import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;

let cachedClient;
let cachedDb;

export default async function handler(req, res) {
  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
      cachedDb = cachedClient.db("superserver");
    }
    const db = cachedDb;
    const tasks = db.collection("tasks");

    if (req.method === "GET") {
      const allTasks = await tasks.find({}).toArray();
      return res.status(200).json(allTasks);
    }

    // Add more methods here if you want

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: error.message });
  }
}
