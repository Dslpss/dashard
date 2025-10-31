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
    const { title } = body as { title?: string };
    if (!title)
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );

    const now = new Date().toISOString();
    const db = await getDb();
    const result = await db
      .collection("courses")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { title, updatedAt: now } },
        { returnDocument: "after" }
      );

    if (!result || !result.value)
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );

    return NextResponse.json(result.value);
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar curso" },
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

    // Deletar todas as aulas do curso primeiro
    await db.collection("lessons").deleteMany({ courseId: id });

    // Deletar o curso
    const result = await db
      .collection("courses")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0)
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao excluir curso" },
      { status: 500 }
    );
  }
}
