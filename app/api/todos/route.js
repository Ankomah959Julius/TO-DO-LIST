import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import db from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const result = await db.execute({
    sql: "SELECT * FROM todos WHERE user_id = ? ORDER BY id DESC",
    args: [session.user.id],
  });

  return NextResponse.json(result.rows);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { task } = await request.json();

  if (!task || !task.trim()) {
    return NextResponse.json(
      { error: "Task text is required" },
      { status: 400 }
    );
  }

  const insertResult = await db.execute({
    sql: "INSERT INTO todos (task, completed, user_id) VALUES (?, 0, ?)",
    args: [task.trim(), session.user.id],
  });

  const newTodo = await db.execute({
    sql: "SELECT * FROM todos WHERE id = ?",
    args: [insertResult.lastInsertRowid.toString()],
  });

  return NextResponse.json(newTodo.rows[0], { status: 201 });
}
