import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function resolveParams(context: unknown) {
  const raw = (context as { params?: unknown })?.params;
  if (!raw) return {} as Record<string, string>;
  if (raw && typeof (raw as { then?: unknown }).then === "function") {
    return await (raw as Promise<Record<string, string>>);
  }
  return raw as Record<string, string>;
}

export async function PUT(req: Request, context: unknown) {
  try {
    const { id } = await resolveParams(context);
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
      .collection("lessons")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { title, updatedAt: now } },
        { returnDocument: "after" }
      );

    if (!result || !result.value)
      return NextResponse.json(
        { error: "Aula não encontrada" },
        { status: 404 }
      );

    return NextResponse.json(result.value);
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar aula" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: unknown) {
  try {
    const { id } = await resolveParams(context);
    if (!ObjectId.isValid(id))
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const db = await getDb();

    // Deletar todas as anotações da aula primeiro
    await db.collection("annotations").deleteMany({ lessonId: id });

    // Deletar a aula
    const result = await db
      .collection("lessons")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0)
      return NextResponse.json(
        { error: "Aula não encontrada" },
        { status: 404 }
      );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Falha ao excluir aula" },
      { status: 500 }
    );
  }
}
