import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = global._mongoClient;
let cachedDb = global._mongoDb;

export default async function handler(req, res) {
  if (!cachedClient) {
    cachedClient = global._mongoClient = new MongoClient(uri);
    await cachedClient.connect();
    cachedDb = global._mongoDb = cachedClient.db("superserver");
  }
  const db = cachedDb;
  const tasks = db.collection("tasks");

  if (req.method === "GET") {
    const allTasks = await tasks.find({}).toArray();
    return res.status(200).json(allTasks);
  }

  if (req.method === "POST") {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title required" });
    const newTask = { title, done: false, created_at: new Date() };
    await tasks.insertOne(newTask);
    return res.status(201).json(newTask);
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    const existingTask = await tasks.findOne({ _id: new ObjectId(id) });
    if (!existingTask) return res.status(404).json({ error: "Not found" });
    await tasks.updateOne(
      { _id: existingTask._id },
      { $set: { done: !existingTask.done } }
    );
    return res.status(200).json({ ...existingTask, done: !existingTask.done });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    await tasks.deleteOne({ _id: new ObjectId(id) });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end(); // Method Not Allowed
}
