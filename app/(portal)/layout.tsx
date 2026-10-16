"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getStoredUser, isDealer } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (!u || !isDealer(u.role)) {
      router.replace("/dealer-login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return <div className="p-10 text-slate-500">Loading dealer portal…</div>;

  const links = [
    ["/portal", "Dashboard"],
    ["/portal/catalog", "Products & Catalog"],
    ["/portal/orders", "Orders & PI"],
    ["/portal/support", "Support & Warranty"],
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="erp-gradient text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
          <img src="/kalpna-logo.jpg" alt="Kalpna" className="h-10 w-10 rounded-lg bg-white object-contain p-0.5" />
          <div>
            <p className="font-extrabold">Kalpna Traders · Dealer Portal</p>
            <p className="text-xs text-blue-100">Products · Catalog · PI · Support · Warranty</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <button className="rounded-lg bg-white/15 px-3 py-1 text-xs" onClick={() => { clearSession(); router.replace("/"); }}>Sign out</button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 px-4 pb-3">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={`rounded-lg px-3 py-1.5 text-sm ${pathname === href ? "bg-white text-navy" : "bg-white/10"}`}>
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
    </div>
  );
}
