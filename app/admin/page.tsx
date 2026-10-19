import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";
import AdminLogin from "@/components/AdminLogin";
import { adminEnabled, isAdmin } from "@/lib/request";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!adminEnabled()) {
    return (
      <section className="wrap admin">
        <div className="board-frame admin-card">
          <h2>Admin is off</h2>
          <p>
            Add an <code>ADMIN_PASSWORD</code> environment variable in Vercel (Project → Settings → Environment
            Variables), redeploy, and come back.
          </p>
        </div>
      </section>
    );
  }
  return <section className="wrap admin">{(await isAdmin()) ? <AdminDashboard /> : <AdminLogin />}</section>;
}
