"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Search, Download, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { CatalogPdfs } from "@/components/products/catalog-pdfs";
import { PriceListBoard } from "@/components/products/price-list-board";
import { api, downloadFile } from "@/lib/api";
import { canWriteProducts, getStoredUser } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import type { Category, Paginated, Product } from "@/lib/types";

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [catName, setCatName] = useState("");
  const canWrite = canWriteProducts(getStoredUser()?.role);

  function load() {
    const qs = q ? `?search=${encodeURIComponent(q)}` : "";
    api<Paginated<Product>>(`/api/products/${qs}`).then((d) => setRows(d.results));
    api<Category[]>("/api/products/categories/").then(setCats);
  }

  useEffect(() => {
    if (canWrite) load();
  }, [canWrite]);

  async function addCat() {
    if (!catName.trim()) return;
    await api("/api/products/categories/", { method: "POST", body: JSON.stringify({ name: catName }) });
    setCatName("");
    toast.success("Category added");
    load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this product?")) return;
    await api(`/api/products/${id}/`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  }

  if (!canWrite) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Product Catalog</h1>
          <p className="text-sm text-slate-500">Admin ke PDFs ke saath Price List bhi yahan dikhegi. View only.</p>
        </div>
        <CatalogPdfs canUpload={false} />
        <PriceListBoard heading={false} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Products</h1>
        <p className="text-sm text-slate-500">Sales catalog PDFs alag hain. Neeche PI ke liye product master hai.</p>
      </div>

      <CatalogPdfs canUpload />

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-navy">Product master (PI)</h2>
            <p className="text-sm text-slate-500">HSN, GST and rates used while creating PI</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => downloadFile("/api/products/export/", "products.xlsx")}>
              <Download size={16} /> Export Excel
            </Button>
            <Link href="/products/new">
              <Button>
                <Plus size={16} /> Add Product
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2 rounded-2xl bg-white p-4 shadow-card">
          <div>
            <Label>New category</Label>
            <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category name" />
          </div>
          <Button onClick={addCat}>Add Category</Button>
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <span key={c.id} className="rounded-full bg-electric-50 px-3 py-1 text-xs font-semibold text-electric">
                {c.name} ({c.product_count || 0})
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input className="pl-9" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button variant="navy" onClick={load}>
            Search
          </Button>
        </div>

        <div className="table-wrap">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">HSN</th>
                <th className="px-4 py-3">GST</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold">{p.product_name}</td>
                  <td className="px-4 py-3">{p.product_code}</td>
                  <td className="px-4 py-3">{p.category_name || "—"}</td>
                  <td className="px-4 py-3">{p.hsn_code}</td>
                  <td className="px-4 py-3">{p.gst}%</td>
                  <td className="px-4 py-3">{formatINR(Number(p.price))}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link href={`/products/${p.id}`}>
                        <Button size="icon" variant="ghost">
                          <Pencil size={16} />
                        </Button>
                      </Link>
                      <Button size="icon" variant="ghost" onClick={() => remove(p.id)}>
                        <Trash2 size={16} className="text-rose-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
