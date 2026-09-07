"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Search, Download, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { CatalogPdfs } from "@/components/products/catalog-pdfs";
import { PriceListBoard } from "@/components/products/price-list-board";
import { ProductForm } from "@/components/products/product-form";
import { api, downloadFile } from "@/lib/api";
import { canWriteProducts, getStoredUser } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import type { Category, Paginated, Product } from "@/lib/types";

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [catName, setCatName] = useState("");
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [editor, setEditor] = useState<{ mode: "add" | "edit"; id?: number } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const canWrite = canWriteProducts(getStoredUser()?.role);

  function load() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("search", q.trim());
    if (catFilter) params.set("category", String(catFilter));
    const qs = params.toString() ? `?${params}` : "";
    api<Paginated<Product>>(`/api/products/${qs}`).then((d) => setRows(d.results));
    api<Category[]>("/api/products/categories/").then(setCats);
  }

  useEffect(() => {
    if (canWrite) load();
  }, [canWrite, catFilter]);

  useEffect(() => {
    if (editor) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editor]);

  function openAdd() {
    setEditor({ mode: "add" });
  }

  function openEdit(id: number) {
    setEditor({ mode: "edit", id });
  }

  function closeEditor() {
    setEditor(null);
  }

  function afterSave() {
    closeEditor();
    load();
  }

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
    if (editor?.id === id) closeEditor();
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
        <p className="text-sm text-slate-500">Sales catalog PDFs alag hain. Neeche PI ke liye product master hai — add aur customise yahin se.</p>
      </div>

      <CatalogPdfs canUpload />

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-navy">Product master (PI)</h2>
            <p className="text-sm text-slate-500">Naam, HSN, GST, rate aur photo yahin add / customise karo</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => downloadFile("/api/products/export/", "products.xlsx")}>
              <Download size={16} /> Export Excel
            </Button>
            <Button onClick={openAdd}>
              <Plus size={16} /> Add Product
            </Button>
          </div>
        </div>

        {editor && (
          <div ref={formRef} className="rounded-2xl border border-electric/30 bg-white p-5 shadow-card">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-navy">
                  {editor.mode === "edit" ? "Customise product" : "Add new product"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editor.mode === "edit"
                    ? "Naam, code, category, HSN, GST, price, photo change karo."
                    : "PI create ke time yeh details auto fill hongi."}
                </p>
              </div>
              <Button size="icon" variant="ghost" type="button" onClick={closeEditor} aria-label="Close form">
                <X size={16} />
              </Button>
            </div>
            <ProductForm
              key={editor.mode === "edit" ? editor.id : "add"}
              productId={editor.id}
              embedded
              defaultCategory={catFilter ? String(catFilter) : ""}
              onSaved={afterSave}
              onCancel={closeEditor}
            />
          </div>
        )}

        <div className="flex flex-wrap items-end gap-2 rounded-2xl bg-white p-4 shadow-card">
          <div>
            <Label>New category</Label>
            <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Category name" />
          </div>
          <Button onClick={addCat}>Add Category</Button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCatFilter(null)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                catFilter === null ? "bg-navy text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              All
            </button>
            {cats.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCatFilter(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  catFilter === c.id ? "bg-electric text-white" : "bg-electric-50 text-electric"
                }`}
              >
                {c.name} ({c.product_count || 0})
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input
              className="pl-9"
              placeholder="Search products…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
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
              {rows.length === 0 && !editor && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <p className="font-semibold text-navy">Abhi koi product nahi hai</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add Product se naam, HSN, GST, rate aur photo set karo. Baad mein Customise se edit ho jayega.
                    </p>
                    <Button className="mt-4" onClick={openAdd}>
                      <Plus size={16} /> Add Product
                    </Button>
                  </td>
                </tr>
              )}
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold">
                    {p.product_name}
                    {!p.is_active && <span className="ml-2 text-xs font-medium text-slate-400">Inactive</span>}
                  </td>
                  <td className="px-4 py-3">{p.product_code}</td>
                  <td className="px-4 py-3">{p.category_name || "—"}</td>
                  <td className="px-4 py-3">{p.hsn_code}</td>
                  <td className="px-4 py-3">{p.gst}%</td>
                  <td className="px-4 py-3">{formatINR(Number(p.price))}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(p.id)}>
                        <Pencil size={14} /> Customise
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                        <Trash2 size={14} className="text-rose-600" /> Delete
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
