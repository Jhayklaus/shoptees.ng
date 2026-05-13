import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Studio — Shoptees",
  description: "Admin",
  path: "/admin",
});

// Bare wrapper. Routes inside /admin/(authed) get the sidebar + auth gate.
// The /admin/login route stays outside that group and is publicly reachable.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-paper text-ink">{children}</div>;
}
