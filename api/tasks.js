const { MongoClient, ObjectId } = require('mongodb');

const rawUri = process.env.MONGODB_URI || '';
const uri = rawUri.trim();

if (!uri) {
  console.error('MONGODB_URI is missing or empty in environment');
}

let cachedClient = globalThis.__mongoClient;
let cachedDb = globalThis.__mongoDb;

async function connectToDatabase() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };
  if (!uri) throw new Error('Missing MONGODB_URI');

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000, // fail faster
  });

  await client.connect();
  const db = client.db('superserver');

  cachedClient = client;
  cachedDb = db;
  globalThis.__mongoClient = client;
  globalThis.__mongoDb = db;

  return { client, db };
}

function sendJson(res, status, payload) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).json(payload);
}

function sendError(res, status, message, details) {
  if (details) console.error(message, details);
  return sendJson(res, status, { error: message });
}

module.exports = async function handler(req, res) {
  if (!uri) return sendError(res, 500, 'Database configuration missing');

  let db;
  try {
    ({ db } = await connectToDatabase());
  } catch (err) {
    console.error('MongoDB connection failed:', err && err.message ? err.message : err);
    return sendError(res, 500, 'Database connection failed');
  }

  const tasks = db.collection('tasks');

  try {
    if (req.method === 'GET') {
      const list = await tasks.find({}).sort({ created_at: -1 }).toArray();
      return sendJson(res, 200, list);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      if (!title) return sendError(res, 400, 'title required');

      const doc = { title, done: false, created_at: new Date() };
      const result = await tasks.insertOne(doc);
      doc._id = result.insertedId;
      return sendJson(res, 201, doc);
    }

    if (req.method === 'PUT') {
      const id = req.query && req.query.id;
      if (!id) return sendError(res, 400, 'id required');
      let _id;
      try { _id = new ObjectId(id); } catch (e) { return sendError(res, 400, 'invalid id'); }

      const existing = await tasks.findOne({ _id });
      if (!existing) return sendError(res, 404, 'not found');

      const updated = await tasks.findOneAndUpdate(
        { _id },
        { $set: { done: !existing.done } },
        { returnDocument: 'after' }
      );

      return sendJson(res, 200, updated.value);
    }

    if (req.method === 'DELETE') {
      const id = req.query && req.query.id;
      if (!id) return sendError(res, 400, 'id required');
      let _id;
      try { _id = new ObjectId(id); } catch (e) { return sendError(res, 400, 'invalid id'); }

      await tasks.deleteOne({ _id });
      return sendJson(res, 200, { ok: true });
    }

    res.setHeader('Allow', 'GET,POST,PUT,DELETE');
    return sendError(res, 405, 'Method Not Allowed');
  } catch (err) {
    console.error('/api/tasks unexpected error:', err);
    return sendError(res, 500, 'internal_server_error');
  }
};
