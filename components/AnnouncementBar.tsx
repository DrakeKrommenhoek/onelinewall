import Link from "next/link";
import type { Prompt } from "@/lib/store";

export default function AnnouncementBar({ prompt }: { prompt: Prompt }) {
  return (
    <div className="announce">
      <div className="wrap">
        <span className="announce-label">On the wall this week:</span>
        <span>
          <strong>{prompt.title}</strong>
          {prompt.detail ? <span className="announce-detail"> {prompt.detail}</span> : null}
        </span>
        <Link href="/#pitch">Pitch next week&apos;s →</Link>
      </div>
    </div>
  );
}
