import { MongoClient, Db } from "mongodb";

// Delay reading env vars until getDb is called so import-time errors don't
// crash route module loading and can be handled by the caller's try/catch.
const DEFAULT_DB = "dashard";

// In serverless environments (Netlify, Vercel), modules can be reloaded per
// invocation. Use a global cache to reuse the MongoClient across invocations
// and avoid exhausting connections.
declare global {
  var _mongoClient: { client: MongoClient; db: Db } | undefined;
}

export async function getDb(): Promise<Db> {
  if (global._mongoClient) return global._mongoClient.db;

  // Read and sanitize env vars at call time. Some deployment UIs allow
  // users to include surrounding quotes which break the connection string
  // (e.g. "mongodb+srv://..."). Trim and strip surrounding single/double
  // quotes to be more forgiving.
  const rawUri = process.env.MONGODB_URI as string | undefined;
  const dbName = (process.env.MONGODB_DB as string) || DEFAULT_DB;

  if (!rawUri) {
    throw new Error("MONGODB_URI não está definido nas variáveis de ambiente");
  }

  // remove surrounding whitespace and optional surrounding quotes
  const uri = rawUri.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");

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
