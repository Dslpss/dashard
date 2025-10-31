import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id))
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const body = await req.json();
    const { title, content } = body as { title?: string; content?: string };
    if (!title || !content)
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios" },
        { status: 400 }
      );

    const now = new Date().toISOString();
    const db = await getDb();
    const result = await db
      .collection("notes")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { title, content, updatedAt: now } },
        { returnDocument: "after" }
      );

    if (!result || !result.value)
      return NextResponse.json(
        { error: "Nota não encontrada" },
        { status: 404 }
      );

    return NextResponse.json(result.value);
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar nota" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id))
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const db = await getDb();
    const result = await db
      .collection("notes")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0)
      return NextResponse.json(
        { error: "Nota não encontrada" },
        { status: 404 }
      );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao excluir nota" },
      { status: 500 }
    );
  }
}
