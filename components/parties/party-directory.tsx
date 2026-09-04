"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Download, Search, Pencil, Trash2, MessageCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { api, downloadFile } from "@/lib/api";
import { canDeleteParties, canManageCompany, canWriteCustomers, getStoredUser, isCompanyViewer, isSales } from "@/lib/auth";
import type { Customer, Paginated, PartyType, User } from "@/lib/types";

export function PartyDirectory({ kind }: { kind: PartyType }) {
  const isDealer = kind === "dealer";
  const title = isDealer ? "Dealers" : "Vendors";
  const base = isDealer ? "/dealers" : "/vendors";
  const [q, setQ] = useState("");
  const [salesId, setSalesId] = useState("");
  const [rows, setRows] = useState<Customer[]>([]);
  const [count, setCount] = useState(0);
  const [team, setTeam] = useState<User[]>([]);
  const user = getStoredUser();
  const isAdmin = canManageCompany(user?.role);
  const companyViewer = isCompanyViewer(user?.role);
  const salesUser = isSales(user?.role);
  const canWrite = canWriteCustomers(user?.role);
  const canDelete = canDeleteParties(user?.role);

  function load() {
    const p = new URLSearchParams();
    p.set("party_type", kind);
    p.set("page_size", "100");
    if (q) p.set("search", q);
    if (isDealer && salesId) p.set("assigned_to", salesId);
    api<Paginated<Customer>>(`/api/customers/?${p.toString()}`)
      .then((d) => {
        setRows(d.results);
        setCount(d.count);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
    if (companyViewer) {
      api<User[]>("/api/auth/users/sales_team/").then(setTeam).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesId]);

  async function remove(id: number) {
    if (!confirm(`Delete this ${kind}?`)) return;
    await api(`/api/customers/${id}/`, { method: "DELETE" });
    toast.success(`${title.slice(0, -1)} deleted`);
    load();
  }

  const selectedSales = team.find((t) => String(t.id) === salesId);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">{salesUser && isDealer ? "My Dealers" : title}</h1>
          <p className="text-sm text-slate-500">
            {isDealer
              ? salesUser
                ? "Dealers assigned to you — add dealer, then create PI"
                : selectedSales
                ? `Showing dealers assigned to ${selectedSales.name}`
                : companyViewer && !isAdmin
                  ? "All dealers — view GST and sales assignment. Filter by executive."
                  : "Full dealer directory — filter by sales executive"
              : "Supplier and vendor directory"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const p = new URLSearchParams({ party_type: kind });
              if (salesId) p.set("assigned_to", salesId);
              downloadFile(`/api/customers/export/?${p.toString()}`, `${kind}s.xlsx`);
            }}
          >
            <Download size={16} /> Export Excel
          </Button>
          {canWrite && (
            <Link href={`${base}/new`}>
              <Button>
                <Plus size={16} /> Add {isDealer ? "Dealer" : "Vendor"}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-card md:grid-cols-12">
        {isDealer && companyViewer && (
          <div className="md:col-span-4">
            <Select value={salesId} onChange={(e) => setSalesId(e.target.value)}>
              <option value="">All sales team</option>
              {team.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.employee_id || "—"})
                </option>
              ))}
            </Select>
          </div>
        )}
        <div className="relative md:col-span-6">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <Input
            className="pl-9"
            placeholder={`Search ${kind} name, GST, mobile…`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <div className="md:col-span-2">
          <Button variant="navy" className="w-full" onClick={load}>
            Search
          </Button>
        </div>
      </div>

      <div className="flex gap-3 text-sm">
        <span className="rounded-full bg-electric-50 px-3 py-1 font-semibold text-electric">
          Total {title}: {count}
        </span>
        {selectedSales && (
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
            {selectedSales.name} · {count} dealers
          </span>
        )}
      </div>

      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">{isDealer ? "Dealer" : "Vendor"}</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">GST</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">City / State</th>
              {isDealer && <th className="px-4 py-3">Sales Executive</th>}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold">
                  <Link href={`${base}/${c.id}`} className="text-navy hover:text-electric">
                    {c.customer_name}
                  </Link>
                </td>
                <td className="px-4 py-3">{c.company_name}</td>
                <td className="px-4 py-3">{c.gst_no || "—"}</td>
                <td className="px-4 py-3">
                  {c.mobile}
                  {c.mobile && (
                    <a
                      className="ml-2 inline-flex text-emerald-600"
                      href={`https://wa.me/91${c.mobile.replace(/\D/g, "").slice(-10)}`}
                      target="_blank"
                    >
                      <MessageCircle size={14} />
                    </a>
                  )}
                </td>
                <td className="px-4 py-3">
                  {c.city}, {c.state}
                </td>
                {isDealer && (
                  <td className="px-4 py-3">
                    {c.assigned_to_name ? (
                      <span>
                        {c.assigned_to_name}
                        {c.assigned_to_employee_id ? (
                          <span className="ml-1 text-xs text-slate-400">({c.assigned_to_employee_id})</span>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Link href={`${base}/${c.id}`}>
                      <Button size="sm" variant={canWrite ? "ghost" : "outline"}>
                        {canWrite ? <Pencil size={16} /> : "View"}
                      </Button>
                    </Link>
                    {canWrite && (
                      <>
                        {isDealer && (
                          <Link href={`/invoices/new?dealer=${c.id}`}>
                            <Button size="sm" variant="navy">
                              <FileText size={14} /> PI
                            </Button>
                          </Link>
                        )}
                        {canDelete && (
                          <Button size="icon" variant="ghost" onClick={() => remove(c.id)}>
                            <Trash2 size={16} className="text-rose-600" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-400" colSpan={isDealer ? 7 : 6}>
                  No {kind}s found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
