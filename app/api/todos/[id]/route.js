import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(request, { params }) {
  const { id } = params;
  const existing = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);

  if (!existing) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  const newCompleted = existing.completed ? 0 : 1;
  db.prepare("UPDATE todos SET completed = ? WHERE id = ?").run(
    newCompleted,
    id
  );

  const updated = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);
  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const { id } = params;
  const result = db.prepare("DELETE FROM todos WHERE id = ?").run(id);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
