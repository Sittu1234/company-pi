"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { api, downloadFile } from "@/lib/api";
import { INDIAN_STATES, type CompanySettings } from "@/lib/types";

export default function SettingsPage() {
  const [form, setForm] = useState<Partial<CompanySettings>>({});
  const [logo, setLogo] = useState<File | null>(null);

  useEffect(() => {
    api<CompanySettings>("/api/company/settings/").then(setForm);
  }, []);

  function set<K extends keyof CompanySettings>(k: K, v: CompanySettings[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "logo" || v === null || v === undefined) return;
      fd.append(k, String(v));
    });
    if (logo) fd.append("logo", logo);
    await api("/api/company/settings/", { method: "PUT", body: fd });
    toast.success("Company settings saved");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Company Settings</h1>
          <p className="text-sm text-slate-500">Logo, GST, bank details and email/WhatsApp templates</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => downloadFile("/api/company/backup/", "spars-backup.json")}>
            Backup Database
          </Button>
          <Button type="submit">Save Settings</Button>
        </div>
      </div>

      <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-card md:grid-cols-2">
        <h2 className="md:col-span-2 font-bold text-navy">Company profile</h2>
        <Field label="Company Name" value={form.company_name} onChange={(v) => set("company_name", v)} />
        <Field label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
        <div className="md:col-span-2">
          <Label>Address</Label>
          <Textarea value={form.address || ""} onChange={(e) => set("address", e.target.value)} />
        </div>
        <Field label="City" value={form.city} onChange={(v) => set("city", v)} />
        <div>
          <Label>State (used for CGST/SGST vs IGST)</Label>
          <select
            className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            value={form.state || ""}
            onChange={(e) => set("state", e.target.value)}
          >
            {INDIAN_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <Field label="Pincode" value={form.pincode} onChange={(v) => set("pincode", v)} />
        <Field label="GST Number" value={form.gst_number} onChange={(v) => set("gst_number", v)} />
        <Field label="PAN" value={form.pan_number} onChange={(v) => set("pan_number", v)} />
        <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} />
        <Field label="Email" value={form.email} onChange={(v) => set("email", v)} />
        <Field label="Website" value={form.website} onChange={(v) => set("website", v)} />
        <div>
          <Label>Logo upload</Label>
          <Input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-card md:grid-cols-2">
        <h2 className="md:col-span-2 font-bold text-navy">Bank details</h2>
        <Field label="Bank Name" value={form.bank_name} onChange={(v) => set("bank_name", v)} />
        <Field label="Account Name" value={form.bank_account_name} onChange={(v) => set("bank_account_name", v)} />
        <Field label="Account Number" value={form.bank_account_number} onChange={(v) => set("bank_account_number", v)} />
        <Field label="IFSC" value={form.bank_ifsc} onChange={(v) => set("bank_ifsc", v)} />
        <Field label="Branch" value={form.bank_branch} onChange={(v) => set("bank_branch", v)} />
        <Field label="Default GST %" value={String(form.default_gst ?? "")} onChange={(v) => set("default_gst", v)} />
        <Field label="PI Prefix" value={form.pi_prefix} onChange={(v) => set("pi_prefix", v)} />
      </section>

      <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-bold text-navy">Templates</h2>
        <div>
          <Label>Default Terms &amp; Conditions (from official quotation)</Label>
          <Textarea className="min-h-[280px] font-mono text-xs leading-5" value={form.default_terms || ""} onChange={(e) => set("default_terms", e.target.value)} />
        </div>
        <div>
          <Label>Email template ({"{customer_name} {pi_number} {pi_date} {grand_total} {valid_till} {company_name}"})</Label>
          <Textarea className="min-h-[120px]" value={form.email_template || ""} onChange={(e) => set("email_template", e.target.value)} />
        </div>
        <div>
          <Label>WhatsApp template</Label>
          <Textarea value={form.whatsapp_template || ""} onChange={(e) => set("whatsapp_template", e.target.value)} />
        </div>
      </section>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value?: string | number | null; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
