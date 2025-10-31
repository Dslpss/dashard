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
    const { content } = body as { content?: string };
    if (!content)
      return NextResponse.json(
        { error: "Conteúdo é obrigatório" },
        { status: 400 }
      );

    const now = new Date().toISOString();
    const db = await getDb();
    const result = await db
      .collection("annotations")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { content, updatedAt: now } },
        { returnDocument: "after" }
      );

    if (!result || !result.value)
      return NextResponse.json(
        { error: "Anotação não encontrada" },
        { status: 404 }
      );

    return NextResponse.json(result.value);
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar anotação" },
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
      .collection("annotations")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0)
      return NextResponse.json(
        { error: "Anotação não encontrada" },
        { status: 404 }
      );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao excluir anotação" },
      { status: 500 }
    );
  }
}
