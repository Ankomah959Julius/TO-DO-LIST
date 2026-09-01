import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const todos = db.prepare("SELECT * FROM todos ORDER BY id DESC").all();
  return NextResponse.json(todos);
}

export async function POST(request) {
  const { task } = await request.json();

  if (!task || !task.trim()) {
    return NextResponse.json(
      { error: "Task text is required" },
      { status: 400 }
    );
  }

  const result = db
    .prepare("INSERT INTO todos (task, completed) VALUES (?, 0)")
    .run(task.trim());

  const newTodo = db
    .prepare("SELECT * FROM todos WHERE id = ?")
    .get(result.lastInsertRowid);

  return NextResponse.json(newTodo, { status: 201 });
}
