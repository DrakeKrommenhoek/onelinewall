"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#mission", label: "Mission" },
  { href: "/#formats", label: "Formats" },
  { href: "/about", label: "About us" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <nav className="wrap" aria-label="Main">
        <Logo />
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="bars" />
          <span className="sr-only">Menu</span>
        </button>
        <ul id="nav-links" className={`nav-links${open ? " open" : ""}`}>
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={l.href === pathname ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/#pitch" className="btn btn-sm" onClick={() => setOpen(false)}>
              Pitch a prompt <span className="arrow">→</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
