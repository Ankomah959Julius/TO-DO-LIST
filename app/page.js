"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "./footer";

export const dynamic = "force-dynamic";

const ACCENTS = ["#f472b6", "#7c5cf0", "#34d399", "#fbbf24", "#60a5fa"];

function initialsFor(name, email) {
  const source = name || email || "?";
  const parts = source.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function WelcomeScreen() {
  const router = useRouter();
  return (
    <main className="page">
      <div className="welcome-card">
        <div className="welcome-illustration">
          <img src="/logo.png" alt="" />
        </div>
        <h2>Task Management and To-Do List</h2>
        <p>
          This productive tool is designed to help you manage your tasks
          conveniently.
        </p>
        <button
          className="welcome-btn"
          onClick={() => router.push("/login")}
        >
          Let&rsquo;s start &#8594;
        </button>
      </div>
      <Footer />
    </main>
  );
}

export default function Home() {
  const { data: session, status } = useSession();

  const [todos, setTodos] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTodos();
      fetchProfile();
    }
  }, [status]);

  async function fetchProfile() {
    const res = await fetch("/api/profile");
    if (!res.ok) return;
    const data = await res.json();
    setProfileImage(data.image || null);
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  if (status === "loading") {
    return (
      <main className="page">
        <div className="sheet">
          <p className="empty">Loading&hellip;</p>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return <WelcomeScreen />;
  }

  const total = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const remaining = total - completedCount;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const circumference = 2 * Math.PI * 22;
  const dashOffset = circumference - (percent / 100) * circumference;

  const visibleTodos = todos.filter((t) => {
    if (filter === "todo") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const displayName = session?.user?.name || session?.user?.email || "";
  const firstName = displayName.split(" ")[0];

  return (
    <main className="page">
      <div className="sheet">
        <header className="dash-header">
          <div>
            <p className="greeting-label">Hello,</p>
            <p className="greeting-name">{firstName}</p>
          </div>

          <div className="profile" ref={profileRef}>
            <button
              className="avatar"
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Open profile menu"
            >
              {profileImage ? (
                <img src={profileImage} alt="" />
              ) : (
                initialsFor(session?.user?.name, session?.user?.email)
              )}
            </button>

            {profileOpen && (
              <div className="profile-menu">
                <p className="profile-name">
                  {session?.user?.name || "Account"}
                </p>
                <p className="profile-email">{session?.user?.email}</p>
                <Link
                  href="/profile"
                  className="profile-settings-link"
                  onClick={() => setProfileOpen(false)}
                >
                  &#9881;&#65039; Profile settings
                </Link>
                <Link
                  href="/about"
                  className="profile-settings-link"
                  onClick={() => setProfileOpen(false)}
                >
                  &#8505;&#65039; About us
                </Link>
                <div className="profile-menu-divider" />
                <button
                  className="profile-signout"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="progress-card">
          <div>
            <p className="progress-label">
              {total === 0
                ? "Nothing on your list yet"
                : remaining === 0
                ? "All tasks done"
                : "Your list is almost done"}
            </p>
            <p className="progress-count">
              {completedCount} of {total} tasks
            </p>
          </div>
          <div className="progress-ring">
            <svg width="52" height="52">
              <circle
                cx="26"
                cy="26"
                r="22"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="26"
                cy="26"
                r="22"
                stroke="#fff"
                strokeWidth="5"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 26 26)"
              />
            </svg>
            <span className="progress-percent">{percent}%</span>
          </div>
        </div>

        <div className="filter-pills">
          <button
            className={filter === "all" ? "pill active" : "pill"}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "todo" ? "pill active" : "pill"}
            onClick={() => setFilter("todo")}
          >
            To do
          </button>
          <button
            className={filter === "done" ? "pill active" : "pill"}
            onClick={() => setFilter("done")}
          >
            Done
          </button>
        </div>

        <form className="entry-form" onSubmit={addTask}>
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Add a task"
            autoFocus
          />
          <button type="submit" disabled={submitting || !taskInput.trim()}>
            Add
          </button>
        </form>

        {loading ? (
          <p className="empty">Loading&hellip;</p>
        ) : visibleTodos.length === 0 ? (
          <p className="empty">
            {filter === "done"
              ? "No completed tasks yet."
              : filter === "todo"
              ? "Nothing left to do."
              : "Nothing on the list yet."}
          </p>
        ) : (
          <ul className="list">
            {visibleTodos.map((todo) => (
              <li className="item" key={todo.id}>
                <span
                  className="accent-bar"
                  style={{ background: ACCENTS[todo.id % ACCENTS.length] }}
                />
                <div className="item-body">
                  <span
                    className={`task-text ${todo.completed ? "done" : ""}`}
                  >
                    {todo.task}
                  </span>
                </div>
                <button
                  className={`checkbox ${todo.completed ? "checked" : ""}`}
                  onClick={() => toggleTask(todo.id)}
                  aria-label={
                    todo.completed ? "Mark as not done" : "Mark as done"
                  }
                />
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
      </div>
      <Footer />
    </main>
  );
}
