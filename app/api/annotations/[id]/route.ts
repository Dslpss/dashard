import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function resolveParams(context: unknown) {
  const raw = (context as { params?: unknown })?.params;
  if (!raw) return {} as Record<string, string>;
  // Next may provide params as a Promise in dev types — await if needed
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

export async function DELETE(_req: Request, context: unknown) {
  try {
    const { id } = await resolveParams(context);
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
