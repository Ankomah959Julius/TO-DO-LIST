import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import db from "@/lib/db";

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = params;
  const existingResult = await db.execute({
    sql: "SELECT * FROM todos WHERE id = ? AND user_id = ?",
    args: [id, session.user.id],
  });

  const existing = existingResult.rows[0];
  if (!existing) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  const newCompleted = existing.completed ? 0 : 1;
  await db.execute({
    sql: "UPDATE todos SET completed = ? WHERE id = ?",
    args: [newCompleted, id],
  });

  const updated = await db.execute({
    sql: "SELECT * FROM todos WHERE id = ?",
    args: [id],
  });

  return NextResponse.json(updated.rows[0]);
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = params;
  const result = await db.execute({
    sql: "DELETE FROM todos WHERE id = ? AND user_id = ?",
    args: [id, session.user.id],
  });

  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
