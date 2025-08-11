import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;

let cachedClient = global.mongoClient;
let cachedDb = global.mongoDb;

export default async function handler(req, res) {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
    cachedDb = cachedClient.db("superserver");
    global.mongoClient = cachedClient;
    global.mongoDb = cachedDb;
  }

  const db = cachedDb;
  const tasks = db.collection("tasks");

  if (req.method === "GET") {
    const allTasks = await tasks.find({}).toArray();
    return res.status(200).json(allTasks);
  }

  // Add other HTTP methods (POST, PUT, DELETE) here if needed

  res.status(405).end();
}
