import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import db from "@/lib/db";

const MAX_IMAGE_BYTES = 1_500_000; // ~1.5MB, generous for a small avatar

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const result = await db.execute({
    sql: "SELECT name, image FROM users WHERE id = ?",
    args: [session.user.id],
  });

  return NextResponse.json(result.rows[0] || { name: null, image: null });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { name, image } = await request.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (image && image.length > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image is too large. Please choose a smaller photo." },
      { status: 400 }
    );
  }

  if (image && !image.startsWith("data:image/")) {
    return NextResponse.json(
      { error: "Invalid image format" },
      { status: 400 }
    );
  }

  if (image) {
    await db.execute({
      sql: "UPDATE users SET name = ?, image = ? WHERE id = ?",
      args: [name.trim(), image, session.user.id],
    });
  } else {
    await db.execute({
      sql: "UPDATE users SET name = ? WHERE id = ?",
      args: [name.trim(), session.user.id],
    });
  }

  const updated = await db.execute({
    sql: "SELECT name, image FROM users WHERE id = ?",
    args: [session.user.id],
  });

  return NextResponse.json(updated.rows[0]);
}
