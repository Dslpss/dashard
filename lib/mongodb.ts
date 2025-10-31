import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const dbName = (process.env.MONGODB_DB as string) || "dashard";

if (!uri) {
  throw new Error("MONGODB_URI não está definido nas variáveis de ambiente");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb && cachedClient) return cachedDb;

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;
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
