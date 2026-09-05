"use client";

import { useState } from "react";

// Shows /public/creator.jpg if it exists; falls back to initials so the
// footer and About page still look fine before a real photo is added.
export function CreatorAvatar({ size = 24, className = "" }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={`creator-avatar-fallback ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        JA
      </div>
    );
  }

  return (
    <img
      src="/creator.jpg"
      alt="Julius Ankomah"
      className={`creator-avatar-img ${className}`}
      style={{ width: size, height: size }}
      onError={() => setErrored(true)}
    />
  );
}
