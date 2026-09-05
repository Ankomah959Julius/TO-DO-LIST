"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "../theme-provider";

export const dynamic = "force-dynamic";

function initialsFor(name, email) {
  const source = name || email || "?";
  const parts = source.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.image) setImagePreview(data.image);
        });
    }
  }, [status]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 1_500_000) {
      setError("Image is too large. Please choose one under ~1.5MB.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        image: imagePreview,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    await update({ name: data.name });
    setSuccess(true);
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

  return (
    <main className="page">
      <div className="sheet">
        <div className="profile-page-header">
          <Link href="/" className="back-btn" aria-label="Back to list">
            &#8592;
          </Link>
          <span>Profile settings</span>
        </div>

        <div className="profile-card">
          <div className="avatar-upload">
            <div className="avatar-upload-photo">
              {imagePreview ? (
                <img src={imagePreview} alt="" />
              ) : (
                initialsFor(name, session?.user?.email)
              )}
              <button
                type="button"
                className="avatar-edit-badge"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change photo"
              >
                &#128247;
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload photo
            </button>
            <p className="upload-hint">JPG or PNG, up to 1.5MB</p>
          </div>

          <form className="auth-form" onSubmit={handleSave}>
            <div>
              <label className="field-label">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="field-disabled"
              />
            </div>

            {error && <p className="auth-error">{error}</p>}
            {success && <p className="auth-success">Profile updated.</p>}

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        <div className="profile-card appearance-section">
          <span className="appearance-label">Appearance</span>
          <div className="theme-toggle">
            <button
              type="button"
              className={`theme-toggle-btn ${theme === "light" ? "active" : ""}`}
              onClick={() => setTheme("light")}
            >
              <span className="theme-icon">&#9728;&#65039;</span>
              Light
            </button>
            <button
              type="button"
              className={`theme-toggle-btn ${theme === "dark" ? "active" : ""}`}
              onClick={() => setTheme("dark")}
            >
              <span className="theme-icon">&#127769;</span>
              Dark
            </button>
            <button
              type="button"
              className={`theme-toggle-btn ${theme === "system" ? "active" : ""}`}
              onClick={() => setTheme("system")}
            >
              <span className="theme-icon">&#128421;&#65039;</span>
              System
            </button>
          </div>
        </div>

        <Link href="/" className="cancel-link">
          Cancel
        </Link>
      </div>
    </main>
  );
}
