"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { api, downloadFile } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import type { Customer, Paginated, Product } from "@/lib/types";
import type { PurchaseOrder, Warehouse } from "@/lib/enterprise";
import { getStoredUser } from "@/lib/auth";

export default function PurchasesPage() {
  const [rows, setRows] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [vendor, setVendor] = useState("");
  const [item, setItem] = useState({ product: "", qty: "1", rate: "0", gst: "18" });
  const [items, setItems] = useState<typeof item[]>([]);
  const role = getStoredUser()?.role;
  const canApprove = role === "admin" || role === "accountant";

  function load() {
    api<Paginated<PurchaseOrder>>("/api/erp/purchase-orders/").then((d) => setRows(d.results));
    api<Customer[]>("/api/customers/lookup/?party_type=vendor").then(setVendors).catch(() => {});
    api<Paginated<Product>>("/api/products/?page_size=200").then((d) => setProducts(d.results));
    api<Warehouse[]>("/api/erp/warehouses/").then(setWarehouses).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    if (!items.length) return toast.error("Add at least one item");
    try {
      await api("/api/erp/purchase-orders/", {
        method: "POST",
        body: JSON.stringify({
          vendor: Number(vendor),
          items: items.map((i) => ({ product: Number(i.product), qty: i.qty, rate: i.rate, gst: i.gst })),
        }),
      });
      toast.success("PO created");
      setItems([]);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PO failed");
    }
  }

  async function act(id: number, path: string) {
    await api(`/api/erp/purchase-orders/${id}/${path}/`, { method: "POST", body: "{}" });
    load();
  }

  async function receive(po: PurchaseOrder) {
    const warehouse = warehouses[0]?.id;
    if (!warehouse) return toast.error("Add a warehouse first");
    try {
      await api("/api/erp/grn/", {
        method: "POST",
        body: JSON.stringify({
          purchase_order: po.id,
          warehouse,
          items: po.items.map((i) => ({ product: i.product, qty: i.qty, serials_text: "" })),
        }),
      });
      toast.success("GRN posted — stock updated");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "GRN failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy dark:text-white">Purchase Management</h1>
          <p className="text-sm text-slate-500">Vendor PO → Approve → GRN → stock in</p>
        </div>
        <Button variant="outline" onClick={() => downloadFile("/api/erp/purchase-orders/export/", "purchase_orders.xlsx")}>Export</Button>
      </div>

      <form onSubmit={create} className="space-y-3 rounded-2xl bg-white p-5 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label>Vendor</Label>
            <Select value={vendor} onChange={(e) => setVendor(e.target.value)} required>
              <option value="">Select vendor</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.company_name || v.customer_name}</option>)}
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Select value={item.product} onChange={(e) => setItem({ ...item, product: e.target.value })}>
            <option value="">Product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.product_code}</option>)}
          </Select>
          <Input className="w-24" placeholder="Qty" value={item.qty} onChange={(e) => setItem({ ...item, qty: e.target.value })} />
          <Input className="w-28" placeholder="Rate" value={item.rate} onChange={(e) => setItem({ ...item, rate: e.target.value })} />
          <Button type="button" variant="outline" onClick={() => { if (item.product) { setItems([...items, item]); setItem({ product: "", qty: "1", rate: "0", gst: "18" }); } }}>Add line</Button>
        </div>
        <p className="text-xs text-slate-500">{items.length} line(s)</p>
        <Button>Create PO</Button>
      </form>

      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr><th className="px-4 py-3">PO</th><th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Total</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2 font-mono">{p.po_number}</td>
                <td className="px-4 py-2">{p.vendor_name}</td>
                <td className="px-4 py-2"><Badge>{p.status}</Badge></td>
                <td className="px-4 py-2">{formatINR(p.grand_total)}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {p.status === "draft" && <Button size="sm" variant="outline" onClick={() => act(p.id, "submit")}>Send</Button>}
                    {canApprove && (p.status === "sent" || p.status === "draft") && <Button size="sm" onClick={() => act(p.id, "approve")}>Approve</Button>}
                    {p.status === "approved" && <Button size="sm" variant="success" onClick={() => receive(p)}>GRN / Receive</Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
