"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Customer, Paginated, Product } from "@/lib/types";
import type { WarrantyClaim } from "@/lib/enterprise";

const STATUSES = ["submitted", "under_review", "approved", "rejected", "completed"];

export default function WarrantyPage() {
  const [dealers, setDealers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [reg, setReg] = useState({ serial: "", product: "", dealer: "", customer_name: "", customer_mobile: "", purchase_date: "", warranty_start: "", warranty_end: "" });

  function load() {
    api<Paginated<WarrantyClaim>>("/api/erp/warranty-claims/").then((d) => setClaims(d.results));
    api<Customer[]>("/api/customers/lookup/?party_type=dealer").then(setDealers);
    api<Paginated<Product>>("/api/products/?page_size=200").then((d) => setProducts(d.results));
  }
  useEffect(() => { load(); }, []);

  async function register(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/erp/warranties/", { method: "POST", body: JSON.stringify({ ...reg, product: Number(reg.product), dealer: Number(reg.dealer) }) });
      toast.success("Warranty registered");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Register failed");
    }
  }

  async function setStatus(id: number, status: string) {
    await api(`/api/erp/warranty-claims/${id}/set_status/`, { method: "POST", body: JSON.stringify({ status }) });
    load();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-navy dark:text-white">Warranty Management</h1>
        <p className="text-sm text-slate-500">Serial, dealer, customer, battery warranty window and claims</p>
      </div>
      <form onSubmit={register} className="grid gap-3 rounded-2xl bg-white p-5 dark:bg-slate-900 md:grid-cols-4">
        <div><Label>Serial</Label><Input value={reg.serial} onChange={(e) => setReg({ ...reg, serial: e.target.value })} required /></div>
        <div>
          <Label>Product</Label>
          <Select value={reg.product} onChange={(e) => setReg({ ...reg, product: e.target.value })} required>
            <option value="">Select</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.product_code}</option>)}
          </Select>
        </div>
        <div>
          <Label>Dealer</Label>
          <Select value={reg.dealer} onChange={(e) => setReg({ ...reg, dealer: e.target.value })} required>
            <option value="">Select</option>
            {dealers.map((d) => <option key={d.id} value={d.id}>{d.company_name || d.customer_name}</option>)}
          </Select>
        </div>
        <div><Label>Customer</Label><Input value={reg.customer_name} onChange={(e) => setReg({ ...reg, customer_name: e.target.value })} required /></div>
        <div><Label>Mobile</Label><Input value={reg.customer_mobile} onChange={(e) => setReg({ ...reg, customer_mobile: e.target.value })} /></div>
        <div><Label>Purchase</Label><Input type="date" value={reg.purchase_date} onChange={(e) => setReg({ ...reg, purchase_date: e.target.value })} required /></div>
        <div><Label>Start</Label><Input type="date" value={reg.warranty_start} onChange={(e) => setReg({ ...reg, warranty_start: e.target.value })} required /></div>
        <div><Label>End</Label><Input type="date" value={reg.warranty_end} onChange={(e) => setReg({ ...reg, warranty_end: e.target.value })} required /></div>
        <div className="md:col-span-4"><Button>Register warranty</Button></div>
      </form>
      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr><th className="px-4 py-3">Claim</th><th className="px-4 py-3">Serial</th><th className="px-4 py-3">Dealer</th><th className="px-4 py-3">Issue</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2 font-mono">{c.claim_number}</td>
                <td className="px-4 py-2">{c.serial}</td>
                <td className="px-4 py-2">{c.dealer_name}</td>
                <td className="px-4 py-2">{c.issue}</td>
                <td className="px-4 py-2">
                  <Select value={c.status} onChange={(e) => setStatus(c.id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
