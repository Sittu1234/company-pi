"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileText, Trash2, Upload, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { api, openPdf } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import type { CatalogPdf } from "@/lib/types";

const CATS = ["EV Scooter", "Lithium Battery", "LED Battery", "General"];

export function CatalogPdfs({ canUpload }: { canUpload: boolean }) {
  const [rows, setRows] = useState<CatalogPdf[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [file, setFile] = useState<File | null>(null);

  function load() {
    api<CatalogPdf[]>("/api/products/catalog-pdfs/")
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function onUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Select a PDF file");
      return;
    }
    const fd = new FormData();
    fd.append("title", title.trim() || file.name.replace(/\.pdf$/i, ""));
    fd.append("category", category);
    fd.append("file", file);
    try {
      await api("/api/products/catalog-pdfs/", { method: "POST", body: fd });
      toast.success("PDF uploaded for sales catalog");
      setTitle("");
      setFile(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function remove(id: number) {
    if (!confirm("Remove this PDF from sales catalog?")) return;
    await api(`/api/products/catalog-pdfs/${id}/`, { method: "DELETE" });
    toast.success("PDF removed");
    load();
  }

  return (
    <div className="space-y-4">
      {canUpload && (
        <form onSubmit={onUpload} className="grid gap-3 rounded-2xl bg-white p-5 shadow-card md:grid-cols-4">
          <div className="md:col-span-4">
            <p className="font-bold text-navy">Sales catalog PDFs</p>
            <p className="text-xs text-slate-500">Jo PDF yahan upload hoga, wahi sales team ke Product Catalog mein dikhega.</p>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="EV Scooter catalog" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>PDF file *</Label>
            <Input type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex items-end">
            <Button type="submit">
              <Upload size={16} /> Upload PDF
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => (
          <div key={p.id} className="flex flex-col rounded-2xl bg-white p-4 shadow-card">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <FileText size={20} />
            </div>
            <p className="font-bold text-navy">{p.title}</p>
            <p className="text-xs text-slate-500">
              {p.category || "General"} · {p.file_name || "PDF"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {p.uploaded_by_name ? `By ${p.uploaded_by_name} · ` : ""}
              {formatDateTime(p.created_at)}
            </p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="navy" onClick={() => openPdf(`/api/products/catalog-pdfs/${p.id}/view/`)}>
                <Eye size={14} /> Open PDF
              </Button>
              {canUpload && (
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                  <Trash2 size={14} className="text-rose-600" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!rows.length && (
        <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-card">
          {canUpload
            ? "Abhi koi catalog PDF nahi hai. PDF upload karo — sales ko wahi dikhega."
            : "Admin ne abhi koi catalog PDF nahi dala. PDF aane ke baad yahan dikhega."}
        </div>
      )}
    </div>
  );
}
