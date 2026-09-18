import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogin } from "@/components/admin-login";
import { Footer } from "@/components/footer";
import { SiteNav } from "@/components/site-nav";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const metadata: Metadata = {
  title: "首领后台",
  description: "醉乡堂部落首领后台：查看联赛报名情况并导出 Excel。",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);

  return (
    <>
      <SiteNav />
      <main>
        {session ? (
          <AdminDashboard username={session.username} />
        ) : (
          <AdminLogin />
        )}
      </main>
      <Footer />
    </>
  );
}
