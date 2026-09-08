"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarDays,
  FileText,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Package,
  PanelTop,
  Settings,
  Store,
  UserCog,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { clearSession, getStoredUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

const NAV: {
  href: string;
  label: string;
  salesLabel?: string;
  accountantLabel?: string;
  icon: LucideIcon;
  roles: string[];
}[] = [
  { href: "/dashboard", label: "Dashboard", salesLabel: "My Dashboard", accountantLabel: "Accounts Dashboard", icon: LayoutDashboard, roles: ["admin", "sales", "accountant"] },
  { href: "/dealers", label: "Dealers", salesLabel: "My Dealers", accountantLabel: "Dealers", icon: Store, roles: ["admin", "sales", "accountant"] },
  { href: "/vendors", label: "Vendors", icon: Building2, roles: ["admin"] },
  { href: "/products", label: "Products", salesLabel: "Product Catalog", accountantLabel: "Product Catalog", icon: Package, roles: ["admin", "sales", "accountant"] },
  { href: "/price-list", label: "Price List", icon: IndianRupee, roles: ["admin", "sales", "accountant"] },
  { href: "/invoices", label: "Proforma Invoices", salesLabel: "My PIs", accountantLabel: "All PIs", icon: FileText, roles: ["admin", "sales", "accountant"] },
  { href: "/team", label: "Team Manage", icon: UserCog, roles: ["admin"] },
  { href: "/attendance", label: "Attendance", salesLabel: "My Attendance", accountantLabel: "My Attendance", icon: CalendarCheck, roles: ["admin", "sales", "accountant"] },
  { href: "/calendar", label: "Company Calendar", icon: CalendarDays, roles: ["admin"] },
  { href: "/public-page", label: "Public page customize", icon: PanelTop, roles: ["admin"] },
  { href: "/reports", label: "Reports", salesLabel: "My Reports", accountantLabel: "Accounts Reports", icon: BarChart3, roles: ["admin", "sales", "accountant"] },
  { href: "/settings", label: "Company Settings", icon: Settings, roles: ["admin"] },
  { href: "/activity", label: "Activity Logs", icon: Activity, roles: ["admin"] },
];

function navLabel(item: (typeof NAV)[number], role: string) {
  if (role === "sales" && item.salesLabel) return item.salesLabel;
  if (role === "accountant" && item.accountantLabel) return item.accountantLabel;
  return item.label;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
  }, [router]);

  const items = useMemo(
    () => NAV.filter((n) => (user ? n.roles.includes(user.role) : false)),
    [user]
  );

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading SPARS ERP…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col erp-gradient text-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <img src="/kalpna-logo.jpg" alt="Kalpna Traders" className="h-12 w-12 rounded-xl bg-white object-contain p-0.5" />
          <div>
            <p className="text-sm font-extrabold tracking-wide">Kalpna Traders</p>
            <p className="text-[11px] text-blue-100">SPARS ERP · PI System</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-white text-navy shadow-sm" : "text-blue-100 hover:bg-white/10"
                )}
              >
                <Icon size={18} />
                {navLabel(item, user.role)}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-xl bg-white/10 p-3">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-[11px] capitalize text-blue-100">
            {user.role.replace("_", " ")}
            {user.employee_id ? ` · ${user.employee_id}` : ""}
          </p>
          <button
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/15 py-2 text-xs font-semibold hover:bg-white/25"
            onClick={() => {
              clearSession();
              router.replace("/");
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
          <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="text-sm font-semibold text-navy">Kalpna Traders</div>
          <div className="ml-auto text-xs text-slate-500">
            {user.role === "sales"
              ? `${user.name} · ${user.employee_id || "Sales"}`
              : user.role === "accountant"
                ? `${user.name} · ${user.employee_id || "Accounts"}`
                : "Trust · Quality · Growth · GST Ready"}
          </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
