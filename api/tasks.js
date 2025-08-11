import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = globalThis._mongoClient;
let cachedDb = globalThis._mongoDb;

export default async function handler(req, res) {
  if (!cachedClient) {
    cachedClient = globalThis._mongoClient = new MongoClient(uri);
    await cachedClient.connect();
    cachedDb = globalThis._mongoDb = cachedClient.db("superserver");
  }
  const db = cachedDb;
  const tasks = db.collection("tasks");

  if (req.method === "GET") {
    const all = await tasks.find({}).toArray();
    return res.status(200).json(all);
  }

  if (req.method === "POST") {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    const doc = { title, done: false, created_at: new Date() };
    await tasks.insertOne(doc);
    return res.status(201).json(doc);
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    const existing = await tasks.findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ error: "not found" });
    await tasks.updateOne({ _id: existing._id }, { $set: { done: !existing.done } });
    return res.status(200).json({ ...existing, done: !existing.done });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    await tasks.deleteOne({ _id: new ObjectId(id) });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
