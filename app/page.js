"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";


export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [todos, setTodos] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTodos();
    }
  }, [status]);

  async function fetchTodos() {
    const res = await fetch("/api/todos");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setTodos(data);
    setLoading(false);
  }

  async function addTask(e) {
    e.preventDefault();
    const task = taskInput.trim();
    if (!task) return;

    setSubmitting(true);
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
    });
    const newTodo = await res.json();
    setTodos((prev) => [newTodo, ...prev]);
    setTaskInput("");
    setSubmitting(false);
  }

  async function toggleTask(id) {
    const res = await fetch(`/api/todos/${id}`, { method: "PUT" });
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function deleteTask(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="page">
        <div className="sheet">
          <p className="empty">Loading&hellip;</p>
        </div>
      </main>
    );
  }

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <main className="page">
      <div className="sheet">
        <header className="masthead">
          <div className="masthead-row">
            <div>
              <h1>Checklist</h1>
              <p>Add what needs doing. Cross it off when it&rsquo;s done.</p>
            </div>
            <button
              className="signout"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign out
            </button>
          </div>
          {session?.user?.name && (
            <p className="signed-in-as">Signed in as {session.user.name}</p>
          )}
        </header>

        <form className="entry-form" onSubmit={addTask}>
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Write a new task"
            autoFocus
          />
          <button type="submit" disabled={submitting || !taskInput.trim()}>
            Add
          </button>
        </form>

        {loading ? (
          <p className="empty">Loading&hellip;</p>
        ) : todos.length === 0 ? (
          <p className="empty">Nothing on the list yet.</p>
        ) : (
          <ul className="list">
            {todos.map((todo) => (
              <li className="item" key={todo.id}>
                <button
                  className={`checkbox ${todo.completed ? "checked" : ""}`}
                  onClick={() => toggleTask(todo.id)}
                  aria-label={
                    todo.completed ? "Mark as not done" : "Mark as done"
                  }
                />
                <span className={`task-text ${todo.completed ? "done" : ""}`}>
                  {todo.task}
                </span>
                <button
                  className="remove"
                  onClick={() => deleteTask(todo.id)}
                  aria-label="Delete task"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}

        {!loading && todos.length > 0 && (
          <p className="count">
            {remaining} of {todos.length} remaining
          </p>
        )}
      </div>
    </main>
  );
}
