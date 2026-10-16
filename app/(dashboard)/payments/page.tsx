"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { api, downloadFile, openPdf } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import type { Customer, Paginated } from "@/lib/types";
import type { PaymentRow } from "@/lib/enterprise";

export default function PaymentsPage() {
  const [dash, setDash] = useState<any>(null);
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [dealers, setDealers] = useState<Customer[]>([]);
  const [form, setForm] = useState({ customer: "", amount: "", mode: "upi", kind: "partial", reference: "", notes: "", invoice: "" });

  function load() {
    api<any>("/api/erp/payments/dashboard/").then(setDash);
    api<Paginated<PaymentRow>>("/api/erp/payments/").then((d) => setRows(d.results));
    api<Customer[]>("/api/customers/lookup/?party_type=dealer").then(setDealers).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/erp/payments/", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          customer: Number(form.customer),
          amount: Number(form.amount),
          invoice: form.invoice.trim() || null,
        }),
      });
      toast.success("Payment recorded");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy dark:text-white">Payments & Collection</h1>
          <p className="text-sm text-slate-500">Advance / partial / full · Cash, UPI, bank, cheque · receipt PDF</p>
        </div>
        <Button variant="outline" onClick={() => downloadFile("/api/erp/payments/export/", "collections.xlsx")}>Export</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="stat-card"><p className="text-xs uppercase text-slate-500">Collected</p><p className="text-2xl font-extrabold">{formatINR(dash?.collected || 0)}</p></div>
        <div className="stat-card"><p className="text-xs uppercase text-slate-500">Pending</p><p className="text-2xl font-extrabold">{formatINR(dash?.pending || 0)}</p></div>
        <div className="stat-card"><p className="text-xs uppercase text-slate-500">Overdue invoices</p><p className="text-2xl font-extrabold text-rose-600">{dash?.overdue_count ?? 0}</p></div>
      </div>

      <form onSubmit={create} className="grid gap-3 rounded-2xl bg-white p-5 dark:bg-slate-900 md:grid-cols-4">
        <div>
          <Label>Dealer</Label>
          <Select value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required>
            <option value="">Select</option>
            {dealers.map((d) => <option key={d.id} value={d.id}>{d.company_name || d.customer_name}</option>)}
          </Select>
        </div>
        <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
        <div>
          <Label>Mode</Label>
          <Select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </Select>
        </div>
        <div>
          <Label>Type</Label>
          <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
            <option value="advance">Advance</option>
            <option value="partial">Partial</option>
            <option value="full">Full</option>
          </Select>
        </div>
        <div>
          <Label>Invoice</Label>
          <Select value={form.invoice} onChange={(e) => setForm({ ...form, invoice: e.target.value })}>
            <option value="">No invoice</option>
            {(dash?.dues || []).map((d: { id: number; number: string; customer: string; due: number }) => (
              <option key={d.id} value={d.number}>{d.number} · {d.customer} · {formatINR(d.due)}</option>
            ))}
          </Select>
        </div>
        <div><Label>Reference</Label><Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div>
        <div className="md:col-span-2"><Button>Record payment</Button></div>
      </form>

      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr><th className="px-4 py-3">Receipt</th><th className="px-4 py-3">Dealer</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Mode</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2 font-mono">{p.receipt_number}</td>
                <td className="px-4 py-2">{p.customer_name}</td>
                <td className="px-4 py-2 font-semibold">{formatINR(p.amount)}</td>
                <td className="px-4 py-2 uppercase">{p.mode}</td>
                <td className="px-4 py-2"><Button size="sm" variant="outline" onClick={() => openPdf(`/api/erp/payments/${p.id}/pdf/`)}>Receipt PDF</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(dash?.dues || []).length > 0 && (
        <div className="table-wrap">
          <table className="w-full text-sm">
            <thead className="bg-amber-50 text-left text-xs uppercase text-amber-800">
              <tr><th className="px-4 py-3">Due invoice</th><th className="px-4 py-3">Dealer</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Days</th></tr>
            </thead>
            <tbody>
              {dash.dues.map((d: any) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-2 font-mono">{d.number}</td>
                  <td className="px-4 py-2">{d.customer}</td>
                  <td className="px-4 py-2">{formatINR(d.due)}</td>
                  <td className="px-4 py-2">{d.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
