import Link from "next/link";
import { findValidInviteByToken } from "@/lib/server/team";
import { AcceptInviteForm } from "@/components/admin/AcceptInviteForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Accept invitation",
  path: "/admin/accept",
  noIndex: true,
});
export const dynamic = "force-dynamic";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <NoticeShell heading="Invalid invitation" body="No token was provided." />;
  }

  const invite = await findValidInviteByToken(token);
  if (!invite) {
    return (
      <NoticeShell heading="Invitation not found" body="This invite link is invalid." />
    );
  }
  if (invite.status === "used") {
    return (
      <NoticeShell
        heading="Already accepted"
        body="This invitation has already been used. Try signing in instead."
        cta={{ href: "/admin/login", label: "Go to sign in →" }}
      />
    );
  }
  if (invite.status === "expired") {
    return (
      <NoticeShell
        heading="Invitation expired"
        body="This invite has expired. Ask the person who invited you to send a new one."
      />
    );
  }

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <header className="text-center mb-10">
          <p className="font-mono-tight text-ink/55">Studio access</p>
          <h1 className="font-display text-5xl tracking-tight mt-1 leading-[0.95]">
            Set your <span className="font-italic-accent text-vermillion">password.</span>
          </h1>
          <p className="font-italic-accent text-ink/70 mt-3">
            Signing in as <span className="text-ink">{invite.email}</span>
          </p>
        </header>
        <AcceptInviteForm
          token={token}
          email={invite.email}
          defaultName={invite.name ?? ""}
        />
      </div>
    </main>
  );
}

function NoticeShell({
  heading,
  body,
  cta,
}: {
  heading: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <main className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <p className="font-mono-tight text-ink/55">Studio access</p>
        <h1 className="font-display text-4xl tracking-tight mt-2">{heading}</h1>
        <p className="mt-4 text-ink-soft">{body}</p>
        {cta && (
          <Link
            href={cta.href}
            className="inline-block mt-8 border border-ink px-5 py-2.5 font-mono-tight hover:bg-ink hover:text-paper transition-colors"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </main>
  );
}
