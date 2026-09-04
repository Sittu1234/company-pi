"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { UNITS, type Category, type Product } from "@/lib/types";

export default function ProductFormPage() {
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const router = useRouter();
  const [cats, setCats] = useState<Category[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [form, setForm] = useState({
    product_name: "",
    product_code: "",
    category: "",
    hsn_code: "",
    unit: "PCS",
    gst: "18",
    price: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    api<Category[]>("/api/products/categories/").then(setCats);
    if (id) {
      api<Product>(`/api/products/${id}/`).then((p) =>
        setForm({
          product_name: p.product_name,
          product_code: p.product_code,
          category: p.category ? String(p.category) : "",
          hsn_code: p.hsn_code || "",
          unit: p.unit,
          gst: String(p.gst),
          price: String(p.price),
          description: p.description || "",
          is_active: p.is_active,
        })
      );
    }
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (!form.category) fd.delete("category");
    if (image) fd.append("image", image);
    try {
      if (id) await api(`/api/products/${id}/`, { method: "PATCH", body: fd });
      else await api("/api/products/", { method: "POST", body: fd });
      toast.success("Product saved");
      router.push("/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <h1 className="text-2xl font-extrabold text-navy">{id ? "Update Product" : "Add Product"}</h1>
      <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-card md:grid-cols-2">
        <div>
          <Label>Product Name *</Label>
          <Input value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} required />
        </div>
        <div>
          <Label>Product Code *</Label>
          <Input value={form.product_code} onChange={(e) => setForm({ ...form, product_code: e.target.value })} required />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">None</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>HSN Code</Label>
          <Input value={form.hsn_code} onChange={(e) => setForm({ ...form, hsn_code: e.target.value })} />
        </div>
        <div>
          <Label>Unit</Label>
          <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            {UNITS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>GST Percentage</Label>
          <Input type="number" step="0.01" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} />
        </div>
        <div>
          <Label>Selling Price *</Label>
          <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        </div>
        <div>
          <Label>Product Image</Label>
          <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        </div>
        <div className="md:col-span-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>
      <Button type="submit">Save Product</Button>
    </form>
  );
}
