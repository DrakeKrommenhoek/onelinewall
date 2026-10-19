import Link from "next/link";
import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <p className="footer-sign">
            See you
            <br />
            at the wall.
          </p>
          <ul className="footer-links">
            <li>
              <Link href="/#how">How it works</Link>
            </li>
            <li>
              <Link href="/#formats">Formats</Link>
            </li>
            <li>
              <Link href="/#pitch">Pitch a prompt</Link>
            </li>
            <li>
              <Link href="/about">About us</Link>
            </li>
            <li>
              <Link href="/qr">QR poster</Link>
            </li>
          </ul>
        </div>
        <div className="footer-small">
          <span>Made by W&amp;L students, for W&amp;L students.</span>
          <span>
            {site.course} · {site.term}
          </span>
        </div>
      </div>
    </footer>
  );
}
