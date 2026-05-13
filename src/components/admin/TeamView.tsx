"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Send } from "lucide-react";
import {
  inviteTeammateAction,
  revokeInviteAction,
  removeAdminAction,
} from "@/app/admin/(authed)/team/actions";

type Admin = { id: string; email: string; name: string; createdAt: Date };
type Invite = {
  id: string;
  email: string;
  name: string | null;
  expiresAt: Date;
  createdAt: Date;
  invitedBy: { name: string } | null;
};

export function TeamView({
  admins,
  invites,
  currentUserId,
}: {
  admins: Admin[];
  invites: Invite[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await inviteTeammateAction({
        email: email.trim(),
        name: name.trim() || undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(`Invitation sent to ${email}.`);
      setEmail("");
      setName("");
      router.refresh();
    });
  };

  const onRevoke = (id: string) => {
    if (!confirm("Revoke this pending invitation?")) return;
    startTransition(async () => {
      const res = await revokeInviteAction(id);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  };

  const onRemove = (id: string, displayName: string) => {
    if (!confirm(`Remove ${displayName} from the team? They will lose access immediately.`)) return;
    startTransition(async () => {
      const res = await removeAdminAction(id);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  };

  return (
    <div className="space-y-12 max-w-3xl">
      {/* Invite form */}
      <section className="space-y-5">
        <header className="border-b border-line pb-2">
          <h3 className="font-display text-2xl tracking-tight">Invite teammate</h3>
          <p className="font-italic-accent text-ink/55 mt-1">
            They&apos;ll get an email with a 7-day link to set their password.
          </p>
        </header>

        <form onSubmit={onInvite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              id="invite-email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={setEmail}
              placeholder="cx@shoptees.ng"
            />
            <Field
              id="invite-name"
              label="Name (optional)"
              value={name}
              onChange={setName}
              placeholder="Customer Experience"
            />
          </div>

          {error && (
            <p className="bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-mono-tight text-ink-soft">
              {error}
            </p>
          )}
          {success && (
            <p className="bg-ink/5 border-l-2 border-ink px-3 py-2 font-mono-tight">{success}</p>
          )}

          <button
            type="submit"
            disabled={pending || !email}
            className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 font-mono-tight hover:bg-vermillion transition-colors disabled:opacity-50"
          >
            <Send size={14} />
            {pending ? "Sending…" : "Send invitation"}
          </button>
        </form>
      </section>

      {/* Pending invites */}
      {invites.length > 0 && (
        <section className="space-y-4">
          <header className="border-b border-line pb-2">
            <h3 className="font-display text-2xl tracking-tight">Pending invitations</h3>
          </header>
          <ul className="divide-y divide-line border-y border-line">
            {invites.map((inv) => (
              <li key={inv.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-lg">
                    {inv.email}
                    {inv.name && (
                      <span className="font-italic-accent text-ink/55 ml-2">{inv.name}</span>
                    )}
                  </p>
                  <p className="font-mono-tight text-ink/55 text-xs mt-0.5">
                    Invited by {inv.invitedBy?.name ?? "—"} ·
                    expires {new Date(inv.expiresAt).toLocaleDateString("en-NG", {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRevoke(inv.id)}
                  disabled={pending}
                  className="font-mono-tight text-vermillion hover:underline disabled:opacity-50"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Existing admins */}
      <section className="space-y-4">
        <header className="border-b border-line pb-2">
          <h3 className="font-display text-2xl tracking-tight">Admins</h3>
        </header>
        <ul className="divide-y divide-line border-y border-line">
          {admins.map((a) => {
            const isYou = a.id === currentUserId;
            return (
              <li key={a.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-lg">
                    {a.name}
                    {isYou && (
                      <span className="ml-2 font-mono-tight text-[0.65rem] uppercase tracking-wider bg-ink text-paper px-1.5 py-0.5">
                        you
                      </span>
                    )}
                  </p>
                  <p className="font-mono-tight text-ink/55 text-xs">{a.email}</p>
                </div>
                {!isYou && (
                  <button
                    type="button"
                    onClick={() => onRemove(a.id, a.name)}
                    disabled={pending}
                    aria-label={`Remove ${a.name}`}
                    className="inline-flex items-center gap-1.5 font-mono-tight text-vermillion hover:underline disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-mono-tight text-ink/55 block">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-transparent border-b border-line py-2 outline-none focus:border-ink font-display text-lg"
      />
    </div>
  );
}
