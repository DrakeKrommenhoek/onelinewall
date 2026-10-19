"use client";

export default function PrintButton() {
  return (
    <button className="btn btn-sm" onClick={() => window.print()}>
      Print poster
    </button>
  );
}
