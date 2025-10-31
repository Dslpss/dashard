import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId, type Filter, type Document } from "mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const courses = await db
      .collection("courses")
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();
    return NextResponse.json(courses);
  } catch {
    return NextResponse.json(
      { error: "Falha ao listar cursos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title } = body as { title?: string };
    if (!title) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }
    const now = new Date().toISOString();
    const db = await getDb();
    const result = await db
      .collection("courses")
      .insertOne({ title, createdAt: now, updatedAt: now });
    return NextResponse.json(
      { _id: result.insertedId, title, createdAt: now, updatedAt: now },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Falha ao criar curso" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body as { id?: string };
    if (!id)
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    const db = await getDb();

    // try to build ObjectId
    let oid: ObjectId | null = null;
    try {
      oid = new ObjectId(id);
    } catch {}

    // delete annotations and lessons related to course
    let lessonQuery: Filter<Document>;
    if (oid) lessonQuery = { courseId: oid } as Filter<Document>;
    else lessonQuery = { courseId: id } as unknown as Filter<Document>;

    const lessons = await db.collection("lessons").find(lessonQuery).toArray();
    const lessonIds = lessons.map((l) => l._id).filter(Boolean);
    if (lessonIds.length > 0) {
      // delete annotations that reference these lessons
      await db.collection("annotations").deleteMany({
        lessonId: { $in: lessonIds },
      } as unknown as Filter<Document>);
    }

    await db.collection("lessons").deleteMany(lessonQuery);

    let courseQuery: Filter<Document>;
    if (oid) courseQuery = { _id: oid } as Filter<Document>;
    else courseQuery = { _id: id } as unknown as Filter<Document>;
    await db.collection("courses").deleteOne(courseQuery);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao deletar curso" },
      { status: 500 }
    );
  }
}
