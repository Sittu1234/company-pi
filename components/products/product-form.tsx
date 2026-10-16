"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { UNITS, type Category, type Product } from "@/lib/types";

export type ProductFormProps = {
  productId?: string | number;
  embedded?: boolean;
  defaultCategory?: string;
  onSaved?: () => void;
  onCancel?: () => void;
};

const emptyForm = {
  product_name: "",
  product_code: "",
  category: "",
  hsn_code: "",
  unit: "PCS",
  gst: "18",
  price: "",
  description: "",
  is_active: true,
};

export function ProductForm({
  productId,
  embedded = false,
  defaultCategory = "",
  onSaved,
  onCancel,
}: ProductFormProps) {
  const id = productId ? String(productId) : "";
  const router = useRouter();
  const [cats, setCats] = useState<Category[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm, category: defaultCategory });

  useEffect(() => {
    api<Category[]>("/api/products/categories/").then(setCats);
  }, []);

  useEffect(() => {
    if (!id) {
      setForm({ ...emptyForm, category: defaultCategory });
      setImage(null);
      setImagePreview(null);
      return;
    }
    api<Product>(`/api/products/${id}/`).then((p) => {
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
      });
      setImage(null);
      setImagePreview(p.image || null);
    });
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (!form.category) fd.delete("category");
    if (image) fd.append("image", image);
    setSaving(true);
    try {
      if (id) await api(`/api/products/${id}/`, { method: "PATCH", body: fd });
      else await api("/api/products/", { method: "POST", body: fd });
      toast.success(id ? "Product updated" : "Product added");
      if (onSaved) onSaved();
      else router.push("/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {!embedded && (
        <h1 className="text-2xl font-extrabold text-navy">{id ? "Customise Product" : "Add Product"}</h1>
      )}
      <div className={embedded ? "grid gap-4 md:grid-cols-2" : "grid gap-4 rounded-2xl bg-white p-6 shadow-card md:grid-cols-2"}>
        <div>
          <Label>Product Name *</Label>
          <Input
            value={form.product_name}
            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            placeholder="e.g. EV Scooter 60V"
            required
          />
        </div>
        <div>
          <Label>Product Code *</Label>
          <Input
            value={form.product_code}
            onChange={(e) => setForm({ ...form, product_code: e.target.value })}
            placeholder="e.g. EV-001"
            required
          />
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
          <Input
            value={form.hsn_code}
            onChange={(e) => setForm({ ...form, hsn_code: e.target.value })}
            placeholder="e.g. 8711"
            maxLength={8}
          />
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
          <Label>GST %</Label>
          <Input type="number" step="0.01" min="0" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} />
        </div>
        <div>
          <Label>Selling Price *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label>Product Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setImage(file);
              setImagePreview(file ? URL.createObjectURL(file) : imagePreview);
            }}
          />
          {imagePreview && (
            <img src={imagePreview} alt="" className="mt-2 h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200" />
          )}
        </div>
        <div className="md:col-span-2">
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional notes for this SKU"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-navy md:col-span-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-electric"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Active (shown when creating a PI)
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : id ? "Save changes" : "Add Product"}
        </Button>
        {embedded && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export default function ProductFormPage() {
  const params = useParams<{ id?: string }>();
  const id = params?.id && params.id !== "new" ? params.id : undefined;
  return <ProductForm productId={id} />;
}
