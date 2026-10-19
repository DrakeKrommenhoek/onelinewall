import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="logo" aria-label="The One-Line Wall, home">
      <svg viewBox="0 0 46 22" aria-hidden="true">
        <path d="M2 15 C 9 4, 15 4, 20 12 S 31 20, 36 9" fill="none" stroke="#1f5fd6" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M36 9 C 38 5, 41 4, 44 6" fill="none" stroke="#e23b2e" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
      <span className="logo-text">One-Line Wall</span>
    </Link>
  );
}
