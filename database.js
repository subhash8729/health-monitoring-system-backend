import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

await client.connect();
console.log("database connection success")

export const db = client.db("health-monitoring-system");