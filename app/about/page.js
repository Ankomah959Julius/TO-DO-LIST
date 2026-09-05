import Link from "next/link";
import { CreatorAvatar } from "../creator-avatar";
import Footer from "../footer";

export const metadata = {
  title: "About — Checklist",
};

export default function AboutPage() {
  return (
    <main className="page">
      <div className="sheet">
        <div className="profile-page-header">
          <Link href="/" className="back-btn" aria-label="Back to list">
            &#8592;
          </Link>
          <span>About</span>
        </div>

        <div className="profile-card about-card">
          <CreatorAvatar size={88} className="about-avatar" />
          <h3 className="about-name">Julius Ankomah</h3>
          <p className="about-title">Creator of Checklist</p>
          <p className="about-bio">
            Julius Ankomah — developer. Checklist is a to-do list app with user accounts, persistent storage, and a custom design system, built entirely with Next.js.
          </p>

          <div className="about-links">
            <a
              href="https://github.com/Ankomah959Julius"
              target="_blank"
              rel="noreferrer"
              className="about-link-btn"
            >
              GitHub
            </a>
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="about-link-btn"
            >
              Portfolio
            </a>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
