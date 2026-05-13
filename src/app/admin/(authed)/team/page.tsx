import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/admin/PageHeader";
import { listAdmins, listPendingInvites } from "@/lib/server/team";
import { requireAdmin } from "@/lib/session";
import { TeamView } from "@/components/admin/TeamView";

export const metadata = buildMetadata({
  title: "Team",
  description: "Manage admin teammates",
  path: "/admin/team",
  noIndex: true,
});
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const me = await requireAdmin();
  const [admins, invites] = await Promise.all([listAdmins(), listPendingInvites()]);

  return (
    <div className="p-8">
      <PageHeader title="Team" eyebrow="Studio access" />
      <TeamView admins={admins} invites={invites} currentUserId={me?.id ?? null} />
    </div>
  );
}
