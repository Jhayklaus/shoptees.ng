import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const user = await requireAdmin();
  if (user) redirect("/admin");

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper">
      {/* Left: editorial type */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-paper p-10">
        <div>
          <p className="font-mono-tight text-paper/55">Shoptees</p>
          <p className="font-mono-tight text-paper/55">Studio · Admin</p>
        </div>
        <h1 className="font-display text-7xl xl:text-8xl leading-[0.9] tracking-[-0.03em]">
          Plain
          <br />
          <span className="font-italic-accent text-vermillion">cloth,</span>
          <br />
          back office.
        </h1>
        <p className="font-mono-tight text-paper/55 max-w-sm">
          Restricted. Each session is good for fourteen days.
        </p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <p className="font-mono-tight text-ink/55">Sign in</p>
          <h2 className="font-display text-5xl tracking-[-0.02em] leading-tight mt-1">
            Studio <span className="font-italic-accent text-vermillion">access.</span>
          </h2>
          <p className="font-italic-accent text-ink-soft mt-3">
            For Shoptees admins only.
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
