"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { api, downloadFile } from "@/lib/api";
import type { Paginated, Product } from "@/lib/types";
import type { StockRow, Warehouse } from "@/lib/enterprise";

export default function InventoryPage() {
  const [dash, setDash] = useState<any>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<StockRow[]>([]);
  const [form, setForm] = useState({ kind: "in", warehouse: "", to_warehouse: "", product: "", qty: "1", serials: "", batch_no: "", reference: "" });
  const [wh, setWh] = useState({ name: "", code: "", city: "" });

  function load() {
    api<any>("/api/erp/stock/dashboard/").then(setDash);
    api<Warehouse[]>("/api/erp/warehouses/").then(setWarehouses);
    api<Paginated<Product>>("/api/products/?page_size=200").then((d) => setProducts(d.results));
    api<Paginated<StockRow>>("/api/erp/stock/?page_size=100").then((d) => setStock(d.results));
  }
  useEffect(() => { load(); }, []);

  async function addWarehouse(e: FormEvent) {
    e.preventDefault();
    await api("/api/erp/warehouses/", { method: "POST", body: JSON.stringify({ ...wh, is_active: true }) });
    toast.success("Warehouse saved");
    setWh({ name: "", code: "", city: "" });
    load();
  }

  async function move(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/erp/stock-moves/move/", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          warehouse: Number(form.warehouse),
          product: Number(form.product),
          to_warehouse: form.to_warehouse ? Number(form.to_warehouse) : null,
          serials: form.serials,
        }),
      });
      toast.success("Stock updated");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Stock move failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy dark:text-white">Inventory</h1>
          <p className="text-sm text-slate-500">Warehouses, stock in/out/transfer, serials and low-stock alerts</p>
        </div>
        <Button variant="outline" onClick={() => downloadFile("/api/erp/stock/export/", "stock.xlsx")}>Export Excel</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat-card"><p className="text-xs uppercase text-slate-500">SKUs</p><p className="text-2xl font-extrabold">{dash?.total_skus ?? 0}</p></div>
        <div className="stat-card"><p className="text-xs uppercase text-slate-500">Total qty</p><p className="text-2xl font-extrabold">{dash?.total_qty ?? 0}</p></div>
        <div className="stat-card"><p className="text-xs uppercase text-slate-500">Low stock</p><p className="text-2xl font-extrabold text-amber-600">{dash?.low_stock?.length ?? 0}</p></div>
        <div className="stat-card"><p className="text-xs uppercase text-slate-500">Out of stock</p><p className="text-2xl font-extrabold text-rose-600">{dash?.out_of_stock?.length ?? 0}</p></div>
      </div>

      <form onSubmit={addWarehouse} className="flex flex-wrap items-end gap-2 rounded-2xl bg-white p-4 dark:bg-slate-900">
        <div><Label>Warehouse</Label><Input value={wh.name} onChange={(e) => setWh({ ...wh, name: e.target.value })} required /></div>
        <div><Label>Code</Label><Input value={wh.code} onChange={(e) => setWh({ ...wh, code: e.target.value.toUpperCase() })} required /></div>
        <div><Label>City</Label><Input value={wh.city} onChange={(e) => setWh({ ...wh, city: e.target.value })} /></div>
        <Button>Add warehouse</Button>
      </form>

      <form onSubmit={move} className="grid gap-3 rounded-2xl bg-white p-5 dark:bg-slate-900 md:grid-cols-4">
        <div>
          <Label>Type</Label>
          <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
            <option value="transfer">Transfer</option>
          </Select>
        </div>
        <div>
          <Label>Warehouse</Label>
          <Select value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })} required>
            <option value="">Select</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.code} · {w.name}</option>)}
          </Select>
        </div>
        {form.kind === "transfer" && (
          <div>
            <Label>To warehouse</Label>
            <Select value={form.to_warehouse} onChange={(e) => setForm({ ...form, to_warehouse: e.target.value })}>
              <option value="">Select</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.code}</option>)}
            </Select>
          </div>
        )}
        <div>
          <Label>Product</Label>
          <Select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} required>
            <option value="">Select</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.product_code} · {p.product_name}</option>)}
          </Select>
        </div>
        <div><Label>Qty</Label><Input type="number" min="0.01" step="0.01" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} required /></div>
        <div><Label>Batch</Label><Input value={form.batch_no} onChange={(e) => setForm({ ...form, batch_no: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>Serials (comma / new line)</Label><Input value={form.serials} onChange={(e) => setForm({ ...form, serials: e.target.value })} /></div>
        <div className="md:col-span-4"><Button>Post movement</Button></div>
      </form>

      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr><th className="px-4 py-3">Warehouse</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Min</th></tr>
          </thead>
          <tbody>
            {stock.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-2">{s.warehouse_code}</td>
                <td className="px-4 py-2 font-mono">{s.product_code}</td>
                <td className="px-4 py-2">{s.product_name}</td>
                <td className="px-4 py-2 font-bold">{s.qty}</td>
                <td className="px-4 py-2">{s.min_stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
