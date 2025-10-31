import { NextResponse } from "next/server";
import { verifyAdmin, createToken } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body ?? {};

    if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) {
      return NextResponse.json(
        { error: "Admin credentials not configured on server." },
        { status: 500 }
      );
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing username or password" },
        { status: 400 }
      );
    }

    const ok = verifyAdmin(username, password);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // createToken is async (dynamic import fallback) so await it
    const token = await createToken({ username });

    const res = NextResponse.json({ ok: true });
    // define cookie httpOnly
    res.cookies.set("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
