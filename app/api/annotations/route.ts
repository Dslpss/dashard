import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId, type Filter, type Document } from "mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    const id = searchParams.get("id");

    const db = await getDb();
    if (id) {
      // try find by _id
      try {
        const oid = new ObjectId(id);
        const ann = await db
          .collection("annotations")
          .findOne({ _id: oid } as Filter<Document>);
        return NextResponse.json(ann);
      } catch {
        const ann = await db
          .collection("annotations")
          .findOne({ _id: id } as unknown as Filter<Document>);
        return NextResponse.json(ann);
      }
    }

    const query = lessonId ? { lessonId } : {};
    const annotations = await db
      .collection("annotations")
      .find(query)
      .sort({ updatedAt: -1 })
      .toArray();
    return NextResponse.json(annotations);
  } catch {
    return NextResponse.json(
      { error: "Falha ao listar anotações" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, content, title } = body as {
      id?: string;
      content?: string;
      title?: string;
    };
    if (!id)
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    if (content === undefined && title === undefined)
      return NextResponse.json(
        { error: "Nada para atualizar" },
        { status: 400 }
      );

    const db = await getDb();
    let oid: ObjectId | null = null;
    try {
      oid = new ObjectId(id);
    } catch {}

    const query: Filter<Document> = oid
      ? ({ _id: oid } as Filter<Document>)
      : ({ _id: id } as unknown as Filter<Document>);

    const setObj: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (content !== undefined) setObj.content = content;
    if (title !== undefined) setObj.title = title;

    const updateObj: { $set: Record<string, unknown> } = { $set: setObj };
    await db
      .collection("annotations")
      .updateOne(query, updateObj as unknown as Document);
    const updated = await db.collection("annotations").findOne(query);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar annotation" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lessonId, content, title } = body as {
      lessonId?: string;
      content?: string | null;
      title?: string;
    };
    if (!lessonId) {
      return NextResponse.json(
        { error: "ID da aula é obrigatório" },
        { status: 400 }
      );
    }
    const now = new Date().toISOString();
    const db = await getDb();
    type AnnotationDoc = {
      lessonId: string;
      content?: string | null;
      createdAt: string;
      updatedAt: string;
      title?: string | null;
    };
    const doc: AnnotationDoc = {
      lessonId: String(lessonId),
      content: content ?? "",
      createdAt: now,
      updatedAt: now,
    };
    if (title) doc.title = title;
    const result = await db.collection("annotations").insertOne(doc);
    return NextResponse.json(
      {
        _id: result.insertedId,
        lessonId,
        title: title ?? null,
        content,
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Falha ao criar anotação" },
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

    let oid: ObjectId | null = null;
    try {
      oid = new ObjectId(id);
    } catch {}

    let query: Filter<Document>;
    if (oid) query = { _id: oid } as Filter<Document>;
    else query = { _id: id } as unknown as Filter<Document>;

    await db.collection("annotations").deleteOne(query);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao deletar annotation" },
      { status: 500 }
    );
  }
}
