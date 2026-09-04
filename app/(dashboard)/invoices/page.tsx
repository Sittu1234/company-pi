"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { canManageCompany, canWriteInvoices, getStoredUser, isAccountant, isCompanyViewer } from "@/lib/auth";
import { formatDateTime, formatINR } from "@/lib/utils";
import type { Invoice, Paginated, User } from "@/lib/types";

const tones: Record<string, "slate" | "blue" | "green" | "amber" | "rose"> = {
  draft: "slate",
  sent: "blue",
  accepted: "green",
  expired: "amber",
  cancelled: "rose",
};

export default function InvoicesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [salesId, setSalesId] = useState("");
  const [team, setTeam] = useState<User[]>([]);
  const [rows, setRows] = useState<Invoice[]>([]);
  const role = getStoredUser()?.role;
  const canWrite = canWriteInvoices(role);
  const isAdmin = canManageCompany(role);
  const accountsUser = isAccountant(role);
  const companyViewer = isCompanyViewer(role);

  function load() {
    const p = new URLSearchParams();
    if (q) p.set("search", q);
    if (status) p.set("status", status);
    if (salesId) p.set("created_by", salesId);
    api<Paginated<Invoice>>(`/api/invoices/?${p.toString()}`).then((d) => setRows(d.results));
  }

  useEffect(() => {
    load();
    if (companyViewer) api<User[]>("/api/auth/users/sales_team/").then(setTeam).catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">
            {accountsUser ? "All Proforma Invoices" : isAdmin ? "Proforma Invoices" : "My Proforma Invoices"}
          </h1>
          <p className="text-sm text-slate-500">
            {accountsUser
              ? "Company PIs — print, PDF, WhatsApp or email. Cannot create or edit."
              : isAdmin
                ? "Who created the PI, when, and to whom it was sent"
                : "Create PI for your dealer, then email or WhatsApp it"}
          </p>
        </div>
        {canWrite && (
          <Link href="/invoices/new">
            <Button>
              <Plus size={16} /> New PI
            </Button>
          </Link>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <Input className="pl-9" placeholder="Search PI no or customer…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        {companyViewer && (
          <Select value={salesId} onChange={(e) => setSalesId(e.target.value)} className="w-52">
            <option value="">All sales team</option>
            {team.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.employee_id})
              </option>
            ))}
          </Select>
        )}
        <Button variant="navy" onClick={load}>
          Filter
        </Button>
      </div>
      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">PI Number</th>
              <th className="px-4 py-3">Dealer</th>
              <th className="px-4 py-3">Created by</th>
              <th className="px-4 py-3">Created at</th>
              <th className="px-4 py-3">Sent to</th>
              <th className="px-4 py-3">Grand Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((inv) => (
              <tr key={inv.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold">
                  <Link className="text-electric" href={`/invoices/${inv.id}`}>
                    {inv.pi_number}
                  </Link>
                </td>
                <td className="px-4 py-3">{inv.customer_detail?.customer_name}</td>
                <td className="px-4 py-3">
                  {inv.created_by_name || "—"}
                  {inv.created_by_employee_id ? (
                    <span className="ml-1 text-xs text-slate-400">({inv.created_by_employee_id})</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">{formatDateTime(inv.created_at)}</td>
                <td className="px-4 py-3">
                  {inv.last_sent_to ? (
                    <span>
                      {inv.last_sent_to}
                      <span className="ml-1 block text-xs capitalize text-slate-400">
                        {inv.last_sent_via} · {formatDateTime(inv.last_sent_at)}
                      </span>
                    </span>
                  ) : (
                    "Not sent"
                  )}
                </td>
                <td className="px-4 py-3 font-semibold">{formatINR(Number(inv.grand_total))}</td>
                <td className="px-4 py-3">
                  <Badge tone={tones[inv.status]}>{inv.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
