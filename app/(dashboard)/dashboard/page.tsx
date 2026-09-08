"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileText,
  IndianRupee,
  Plus,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatINR, formatDateTime, formatTime } from "@/lib/utils";
import { canManageCompany, canWriteInvoices, getStoredUser, isAccountant, isSales } from "@/lib/auth";
import { toast } from "sonner";

type Dash = {
  total_invoices: number;
  total_customers: number;
  total_dealers: number;
  total_vendors: number;
  sales_team_count: number;
  present_today: number;
  absent_today: number;
  unmarked_today: number;
  monthly_sales: number;
  pending_quotations: number;
  monthly_taxable?: number;
  monthly_cgst?: number;
  monthly_sgst?: number;
  monthly_igst?: number;
  monthly_gst?: number;
  my_attendance?: { status: string; check_in?: string | null; check_out?: string | null };
  monthly_graph: { month: string; total: number; count: number }[];
  top_customers: { id: number; name: string; company: string; total: number; count: number }[];
  recent_invoices: {
    id: number;
    pi_number: string;
    customer: string;
    pi_date: string;
    grand_total: number;
    status: string;
    created_by?: string;
    created_at?: string;
    last_sent_to?: string;
    last_sent_via?: string;
    last_sent_at?: string | null;
  }[];
};

const statusTone: Record<string, "slate" | "blue" | "green" | "amber" | "rose"> = {
  draft: "slate",
  sent: "blue",
  accepted: "green",
  invoiced: "green",
  expired: "amber",
  cancelled: "rose",
};

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);
  const user = getStoredUser();
  const role = user?.role;
  const salesUser = isSales(role);
  const accountsUser = isAccountant(role);
  const isAdmin = canManageCompany(role);

  function load() {
    api<Dash>("/api/reports/dashboard/").then(setData).catch(() => setData(null));
  }

  useEffect(() => {
    load();
  }, []);

  async function checkIn() {
    try {
      await api("/api/attendance/check_in/", { method: "POST" });
      toast.success("Checked in");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
    }
  }

  async function checkOut() {
    try {
      await api("/api/attendance/check_out/", { method: "POST" });
      toast.success("Checked out");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-out failed");
    }
  }

  const att = data?.my_attendance;
  const stats = [
    { label: salesUser ? "My PIs" : "Total Proforma Invoices", value: data?.total_invoices ?? "-", icon: FileText, color: "bg-electric-50 text-electric" },
    { label: salesUser ? "My Dealers" : "Total Dealers", value: data?.total_dealers ?? data?.total_customers ?? "-", icon: Users, color: "bg-sky-50 text-sky-700" },
    { label: salesUser ? "My Monthly Sales" : "Monthly Sales Value", value: data ? formatINR(data.monthly_sales) : "-", icon: IndianRupee, color: "bg-emerald-50 text-emerald-700" },
    { label: "Pending Quotations", value: data?.pending_quotations ?? "-", icon: Clock, color: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">
            {salesUser || accountsUser ? `Hello, ${user?.name}` : "Dashboard"}
          </h1>
          <p className="text-sm text-slate-500">
            {salesUser
              ? "Your dealers → Create PI → Send to dealer. Check in for attendance."
              : accountsUser
                ? "All company PIs, GST, print/PDF and send. Check in for attendance."
                : "SPARS ERP overview for today"}
          </p>
        </div>
        <div className="flex gap-2">
          {canWriteInvoices(role) && (
            <Link href="/invoices/new">
              <Button>
                <Plus size={16} /> New PI
              </Button>
            </Link>
          )}
          {accountsUser && (
            <Link href="/invoices">
              <Button>All PIs</Button>
            </Link>
          )}
          <Link href="/dealers">
            <Button variant="outline">Dealers</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div className={`mb-3 inline-flex rounded-xl p-2 ${s.color}`}>
                <Icon size={18} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-navy">{s.value}</p>
            </div>
          );
        })}
      </div>

      {(salesUser || accountsUser) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-card">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today&apos;s attendance</p>
            <p className="mt-1 font-semibold text-navy">
              {att?.check_in ? `In ${formatTime(att.check_in)}` : "Not checked in"}
              {att?.check_out ? ` · Out ${formatTime(att.check_out)}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="success" onClick={checkIn} disabled={Boolean(att?.check_in)}>
              Check in
            </Button>
            <Button variant="navy" onClick={checkOut} disabled={!att?.check_in || Boolean(att?.check_out)}>
              Check out
            </Button>
            <Link href="/attendance">
              <Button variant="outline">Attendance</Button>
            </Link>
          </div>
        </div>
      )}

      {(accountsUser || isAdmin) && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="stat-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">This month taxable</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{data ? formatINR(data.monthly_taxable || 0) : "—"}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">CGST</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{data ? formatINR(data.monthly_cgst || 0) : "—"}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SGST</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{data ? formatINR(data.monthly_sgst || 0) : "—"}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">IGST</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{data ? formatINR(data.monthly_igst || 0) : "—"}</p>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link href="/team" className="stat-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sales team</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{data?.sales_team_count ?? "—"}</p>
          </Link>
          <Link href="/vendors" className="stat-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total vendors</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{data?.total_vendors ?? "—"}</p>
          </Link>
          <Link href="/attendance" className="stat-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Present today</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{data?.present_today ?? "—"}</p>
          </Link>
          <Link href="/attendance" className="stat-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Not marked today</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{data?.unmarked_today ?? "—"}</p>
          </Link>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="stat-card xl:col-span-2">
          <h2 className="mb-4 font-bold text-navy">Monthly Sales</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthly_graph || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatINR(Number(v))} />
                <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="stat-card">
          <h2 className="mb-4 font-bold text-navy">{salesUser ? "My Top Dealers" : "Top Dealers"}</h2>
          <div className="space-y-3">
            {(data?.top_customers || []).map((c, i) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold">
                    {i + 1}. {c.name}
                  </p>
                  <p className="text-xs text-slate-500">{c.company} · {c.count} PI</p>
                </div>
                <p className="text-sm font-bold text-electric">{formatINR(c.total)}</p>
              </div>
            ))}
            {!data?.top_customers?.length && <p className="text-sm text-slate-400">No sales yet</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="table-wrap lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="font-bold text-navy">{salesUser ? "My Recent PIs" : "Recent PI List"}</h2>
            <Link href="/invoices" className="text-sm font-semibold text-electric">
              View all <ArrowRight className="inline" size={14} />
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">PI No</th>
                <th className="px-5 py-3">Dealer</th>
                <th className="px-5 py-3">Created by</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recent_invoices || []).map((inv) => (
                <tr key={inv.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-semibold">
                    <Link href={`/invoices/${inv.id}`} className="text-electric">
                      {inv.pi_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{inv.customer}</td>
                  <td className="px-5 py-3">
                    {inv.created_by || "—"}
                    <span className="block text-xs text-slate-400">{formatDateTime(inv.created_at)}</span>
                  </td>
                  <td className="px-5 py-3">{formatINR(inv.grand_total)}</td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone[inv.status] || "slate"}>{inv.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="stat-card">
          <h2 className="mb-4 font-bold text-navy">Quick Actions</h2>
          <div className="grid gap-2">
            {canWriteInvoices(role) && (
              <Link href="/invoices/new">
                <Button className="w-full justify-start" variant="navy">
                  Create Proforma Invoice
                </Button>
              </Link>
            )}
            {accountsUser && (
              <Link href="/invoices">
                <Button className="w-full justify-start" variant="navy">
                  View all PIs
                </Button>
              </Link>
            )}
            {canWriteInvoices(role) && (
              <Link href="/dealers/new">
                <Button className="w-full justify-start" variant="outline">
                  Add Dealer
                </Button>
              </Link>
            )}
            <Link href="/price-list">
              <Button className="w-full justify-start" variant="outline">
                Price List
              </Button>
            </Link>
            {(salesUser || accountsUser) && (
              <Link href="/attendance">
                <Button className="w-full justify-start" variant="outline">
                  Mark Attendance
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link href="/products">
                <Button className="w-full justify-start" variant="outline">
                  Manage Products
                </Button>
              </Link>
            )}
            {(accountsUser || salesUser) && (
              <Link href="/products">
                <Button className="w-full justify-start" variant="outline">
                  Product Catalog
                </Button>
              </Link>
            )}
            <Link href="/reports">
              <Button className="w-full justify-start" variant="outline">
                {salesUser ? "My Reports" : accountsUser ? "Accounts Reports" : "Open Reports"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
