import { formatLabel } from "@/content/site";
import { isAdmin, jsonError } from "@/lib/request";
import { getStore } from "@/lib/store";
import { isWeekKey } from "@/lib/week";

function csv(rows: (string | number | boolean)[][]): string {
  const cell = (v: string | number | boolean) => {
    const s = String(v);
    // Prefix formula-looking cells so spreadsheets don't execute them.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return rows.map((r) => r.map(cell).join(",")).join("\n") + "\n";
}

function download(body: string, filename: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

// /api/admin/export?type=ideas[&week=YYYY-MM-DD] or ?type=subscribers. Feeds the newsletter.
export async function GET(req: Request) {
  if (!(await isAdmin())) return jsonError("Not signed in.", 401);
  const store = getStore();
  const params = new URL(req.url).searchParams;

  if (params.get("type") === "subscribers") {
    const subs = await store.listSubscribers();
    return download(
      csv([["email", "signed_up"], ...subs.map((s) => [s.email, new Date(s.createdAt).toISOString()])]),
      "one-line-wall-subscribers.csv",
    );
  }

  const weekParam = params.get("week");
  const weeks = weekParam && isWeekKey(weekParam) ? [weekParam] : await store.listWeeks();
  const rows: (string | number | boolean)[][] = [
    ["week", "pitch", "format", "name", "year", "score", "up", "down", "reports", "hidden", "created_at"],
  ];
  for (const week of weeks) {
    for (const i of await store.listIdeas(week)) {
      rows.push([
        week,
        i.text,
        formatLabel(i.format),
        i.name,
        i.year,
        i.up - i.down,
        i.up,
        i.down,
        i.reports,
        i.hidden,
        new Date(i.createdAt).toISOString(),
      ]);
    }
  }
  return download(csv(rows), weekParam ? `one-line-wall-${weekParam}.csv` : "one-line-wall-all.csv");
}
