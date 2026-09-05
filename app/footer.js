import Link from "next/link";
import { CreatorAvatar } from "./creator-avatar";

export default function Footer() {
  return (
    <footer className="app-footer">
      <Link href="/about" className="app-footer-link">
        <CreatorAvatar size={18} />
        <span>
          Developer <b>Julius Ankomah</b>
        </span>
      </Link>
    </footer>
  );
}
