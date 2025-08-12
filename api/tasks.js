import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("superserver"); // Your database name
    const tasks = db.collection("tasks");

    if (req.method === "GET") {
      const allTasks = await tasks.find({}).toArray();
      return res.status(200).json(allTasks);
    }

    res.status(405).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
