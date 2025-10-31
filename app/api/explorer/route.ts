import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

type ExplorerNode = {
  name: string;
  id?: string;
  type: "course" | "lesson" | "annotation";
  courseId?: string;
  children?: ExplorerNode[];
};

export async function GET() {
  try {
    const db = await getDb();
    const courses = await db
      .collection("courses")
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    const result: ExplorerNode[] = [];

    for (const c of courses) {
      const courseId = c._id?.toString?.() ?? String(c._id);
      const lessons = await db
        .collection("lessons")
        .find({ $or: [{ courseId: c._id }, { courseId: courseId }] })
        .sort({ updatedAt: -1 })
        .toArray();

      // Build map of lesson nodes by id to support nested folders (parentId)
      const lessonMap = new Map<string, ExplorerNode>();
      for (const l of lessons) {
        const lessonId = l._id?.toString?.() ?? String(l._id);
        lessonMap.set(lessonId, {
          name: l.title,
          id: lessonId,
          type: "lesson",
          courseId: courseId,
          children: [],
        });
      }

      // Attach annotations to their lesson node
      for (const l of lessons) {
        const lessonId = l._id?.toString?.() ?? String(l._id);
        const annotations = await db
          .collection("annotations")
          .find({ $or: [{ lessonId: l._id }, { lessonId: lessonId }] })
          .sort({ updatedAt: -1 })
          .toArray();

        const annotationNodes: ExplorerNode[] = annotations.map((a) => ({
          name: a.title
            ? String(a.title)
            : a.content
            ? String(a.content).split("\n")[0]
            : "anotação",
          id: a._id?.toString?.(),
          type: "annotation",
        }));

        const node = lessonMap.get(lessonId);
        if (node)
          node.children = [...(node.children ?? []), ...annotationNodes];
      }

      // Build hierarchical lesson tree using parentId
      const topLevelLessons: ExplorerNode[] = [];
      for (const l of lessons) {
        const lessonId = l._id?.toString?.() ?? String(l._id);
        const node = lessonMap.get(lessonId)!;
        const parentId = l.parentId ? String(l.parentId) : null;
        if (parentId && lessonMap.has(parentId)) {
          const parent = lessonMap.get(parentId)!;
          parent.children = [...(parent.children ?? []), node];
        } else {
          topLevelLessons.push(node);
        }
      }

      result.push({
        name: c.title,
        id: courseId,
        type: "course",
        children: topLevelLessons,
      });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Falha ao montar árvore do explorer" },
      { status: 500 }
    );
  }
}
