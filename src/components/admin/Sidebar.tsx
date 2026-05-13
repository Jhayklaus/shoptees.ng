"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ScrollText,
  Users,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const nav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ScrollText },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-60 shrink-0 border-r border-line bg-paper-deep flex flex-col">
      <div className="px-5 py-6 border-b border-ink/10">
        <Link href="/admin" className="block">
          <p className="font-mono-tight text-ink/55">Studio</p>
          <h2 className="font-display text-2xl tracking-[-0.02em] leading-none mt-0.5">
            Shop<span className="font-italic-accent text-vermillion">tees</span>
          </h2>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-sm font-mono-tight transition-colors",
                active
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink",
              ].join(" ")}
            >
              <Icon size={15} strokeWidth={1.6} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 font-mono-tight text-ink/55 hover:text-vermillion"
        >
          <ExternalLink size={13} />
          View storefront
        </Link>
      </div>

      <div className="border-t border-ink/10 p-4">
        <p className="font-mono-tight text-ink/55 truncate" title={userEmail}>
          {userEmail}
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-2 inline-flex items-center gap-2 font-mono-tight text-ink hover:text-vermillion transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
