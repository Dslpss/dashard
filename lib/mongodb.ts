import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const dbName = (process.env.MONGODB_DB as string) || "dashard";

if (!uri) {
  throw new Error("MONGODB_URI não está definido nas variáveis de ambiente");
}

// In serverless environments (Netlify, Vercel), modules can be reloaded per
// invocation. Use a global cache to reuse the MongoClient across invocations
// and avoid exhausting connections.
declare global {
  var _mongoClient: { client: MongoClient; db: Db } | undefined;
}

export async function getDb(): Promise<Db> {
  if (global._mongoClient) return global._mongoClient.db;

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const db = client.db(dbName);

  // store on global to allow reuse across lambda invocations
  global._mongoClient = { client, db };
  return db;
}

export type Note = {
  _id?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Course = {
  _id?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type Lesson = {
  _id?: string;
  courseId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type Annotation = {
  _id?: string;
  lessonId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};
