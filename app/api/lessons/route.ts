import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId, type Filter, type Document } from "mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const db = await getDb();
    const query = courseId ? { courseId } : {};
    const lessons = await db
      .collection("lessons")
      .find(query)
      .sort({ updatedAt: -1 })
      .toArray();
    return NextResponse.json(lessons);
  } catch {
    return NextResponse.json(
      { error: "Falha ao listar aulas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, title, parentId } = body as {
      courseId?: string;
      title?: string;
      parentId?: string | null;
    };
    if (!title || !courseId) {
      return NextResponse.json(
        { error: "Título e ID do curso são obrigatórios" },
        { status: 400 }
      );
    }
    const now = new Date().toISOString();
    const db = await getDb();
    const doc: Record<string, unknown> = {
      courseId,
      title,
      createdAt: now,
      updatedAt: now,
    };
    if (parentId) doc.parentId = String(parentId);
    const result = await db.collection("lessons").insertOne(doc);
    return NextResponse.json(
      {
        _id: result.insertedId,
        courseId,
        title,
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Falha ao criar aula" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body as { id?: string };
    if (!id)
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    const db = await getDb();

    let oid: ObjectId | null = null;
    try {
      oid = new ObjectId(id);
    } catch {}

    let lessonQuery: Filter<Document>;
    if (oid) lessonQuery = { _id: oid } as Filter<Document>;
    else lessonQuery = { _id: id } as unknown as Filter<Document>;

    // delete annotations of this lesson
    await db
      .collection("annotations")
      .deleteMany({ lessonId: id } as unknown as Filter<Document>);

    // delete child lessons (one level) and their annotations
    let childQuery: Filter<Document>;
    if (oid) childQuery = { parentId: oid } as unknown as Filter<Document>;
    else childQuery = { parentId: id } as unknown as Filter<Document>;
    const childLessons = await db
      .collection("lessons")
      .find(childQuery)
      .toArray();
    const childIds = childLessons.map((c) => c._id).filter(Boolean);
    if (childIds.length > 0) {
      await db
        .collection("annotations")
        .deleteMany({
          lessonId: { $in: childIds },
        } as unknown as Filter<Document>);
    }
    await db.collection("lessons").deleteMany(childQuery);

    await db.collection("lessons").deleteOne(lessonQuery);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao deletar lesson" },
      { status: 500 }
    );
  }
}
