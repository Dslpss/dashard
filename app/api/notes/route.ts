import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const notes = await db
      .collection("notes")
      .find(
        {},
        { projection: { content: 1, title: 1, createdAt: 1, updatedAt: 1 } }
      )
      .sort({ updatedAt: -1 })
      .toArray();
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json(
      { error: "Falha ao listar notas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body as { title?: string; content?: string };
    if (!title || !content) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios" },
        { status: 400 }
      );
    }
    const now = new Date().toISOString();
    const db = await getDb();
    const result = await db
      .collection("notes")
      .insertOne({ title, content, createdAt: now, updatedAt: now });
    return NextResponse.json(
      {
        _id: result.insertedId,
        title,
        content,
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Falha ao criar nota" }, { status: 500 });
  }
}
