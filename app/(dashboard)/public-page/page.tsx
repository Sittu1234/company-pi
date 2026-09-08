"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { canManageCompany, getStoredUser } from "@/lib/auth";
import type { CareerOpening, PublicPageContent } from "@/lib/types";

const EMPTY_PAGE: PublicPageContent = {
  hero_kicker: "",
  hero_title: "",
  hero_body: "",
  cta_primary: "",
  cta_secondary: "",
  hero_image: "",
  about_kicker: "",
  about_title: "",
  about_body: "",
  products_kicker: "",
  products_title: "",
  highlight_1_title: "",
  highlight_1_body: "",
  highlight_1_image: "",
  highlight_2_title: "",
  highlight_2_body: "",
  highlight_2_image: "",
  highlight_3_title: "",
  highlight_3_body: "",
  highlight_3_image: "",
  careers_kicker: "",
  careers_title: "",
  careers_body: "",
  careers_email: "",
};

export default function PublicPageCustomize() {
  const canAdmin = canManageCompany(getStoredUser()?.role);
  const [form, setForm] = useState<PublicPageContent>(EMPTY_PAGE);
  const [saving, setSaving] = useState(false);
  const [jobs, setJobs] = useState<CareerOpening[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDept, setJobDept] = useState("Sales");
  const [jobLocation, setJobLocation] = useState("Noida");
  const [jobType, setJobType] = useState("Full-time");
  const [jobBody, setJobBody] = useState("");

  function set<K extends keyof PublicPageContent>(k: K, v: PublicPageContent[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function loadJobs() {
    api<CareerOpening[]>("/api/company/careers/")
      .then((d) => setJobs(Array.isArray(d) ? d : []))
      .catch(() => setJobs([]));
  }

  useEffect(() => {
    if (!canAdmin) return;
    api<PublicPageContent>("/api/company/public-page/")
      .then((d) => setForm({ ...EMPTY_PAGE, ...d }))
      .catch(() => toast.error("Could not load public page. Push the backend if this is a new API."));
    loadJobs();
  }, [canAdmin]);

  async function savePage(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { id: _id, highlights: _h, ...payload } = form as PublicPageContent & { id?: number };
      await api("/api/company/public-page/", { method: "PUT", body: JSON.stringify(payload) });
      toast.success("Public page saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function addJob(e: FormEvent) {
    e.preventDefault();
    if (!jobTitle.trim()) {
      toast.error("Job title is required");
      return;
    }
    await api("/api/company/careers/", {
      method: "POST",
      body: JSON.stringify({
        title: jobTitle,
        department: jobDept,
        location: jobLocation,
        employment_type: jobType,
        description: jobBody,
        is_active: true,
        sort_order: jobs.length + 1,
      }),
    });
    toast.success("Job added to the public Careers section");
    setJobTitle("");
    setJobBody("");
    loadJobs();
  }

  async function removeJob(id: number) {
    if (!confirm("Remove this opening from the public page?")) return;
    await api(`/api/company/careers/${id}/`, { method: "DELETE" });
    toast.success("Job removed");
    loadJobs();
  }

  async function toggleJob(job: CareerOpening) {
    await api(`/api/company/careers/${job.id}/`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !job.is_active }),
    });
    loadJobs();
  }

  if (!canAdmin) {
    return <p className="text-slate-500">Only admin can customize the public page.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Public page customize</h1>
          <p className="text-sm text-slate-500">
            Update hero, about, products and careers. Changes show on the company website.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-navy hover:bg-slate-50"
        >
          <ExternalLink size={15} /> View public page
        </Link>
      </div>

      <form onSubmit={savePage} className="space-y-5">
        <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-card md:grid-cols-2">
          <h2 className="md:col-span-2 font-bold text-navy">Hero</h2>
          <Field label="Small yellow line" value={form.hero_kicker} onChange={(v) => set("hero_kicker", v)} />
          <Field
            label="Main heading (blank = company name)"
            value={form.hero_title}
            onChange={(v) => set("hero_title", v)}
          />
          <div className="md:col-span-2">
            <Label>Intro paragraph</Label>
            <Textarea value={form.hero_body} onChange={(e) => set("hero_body", e.target.value)} />
          </div>
          <Field label="Gold button text" value={form.cta_primary} onChange={(v) => set("cta_primary", v)} />
          <Field label="Second button text" value={form.cta_secondary} onChange={(v) => set("cta_secondary", v)} />
          <div className="md:col-span-2">
            <Field
              label="Hero photo (use /home/hero-showroom.jpg or a full image URL)"
              value={form.hero_image}
              onChange={(v) => set("hero_image", v)}
            />
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-bold text-navy">About</h2>
          <Field label="Small label" value={form.about_kicker} onChange={(v) => set("about_kicker", v)} />
          <Field label="Heading" value={form.about_title} onChange={(v) => set("about_title", v)} />
          <div>
            <Label>About text</Label>
            <Textarea className="min-h-[120px]" value={form.about_body} onChange={(e) => set("about_body", e.target.value)} />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-bold text-navy">Product cards</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Section label" value={form.products_kicker} onChange={(v) => set("products_kicker", v)} />
            <Field label="Section heading" value={form.products_title} onChange={(v) => set("products_title", v)} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <HighlightCard
              n={1}
              title={form.highlight_1_title}
              body={form.highlight_1_body}
              image={form.highlight_1_image}
              onTitle={(v) => set("highlight_1_title", v)}
              onBody={(v) => set("highlight_1_body", v)}
              onImage={(v) => set("highlight_1_image", v)}
            />
            <HighlightCard
              n={2}
              title={form.highlight_2_title}
              body={form.highlight_2_body}
              image={form.highlight_2_image}
              onTitle={(v) => set("highlight_2_title", v)}
              onBody={(v) => set("highlight_2_body", v)}
              onImage={(v) => set("highlight_2_image", v)}
            />
            <HighlightCard
              n={3}
              title={form.highlight_3_title}
              body={form.highlight_3_body}
              image={form.highlight_3_image}
              onTitle={(v) => set("highlight_3_title", v)}
              onBody={(v) => set("highlight_3_body", v)}
              onImage={(v) => set("highlight_3_image", v)}
            />
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-bold text-navy">Careers intro</h2>
          <Field label="Small label" value={form.careers_kicker} onChange={(v) => set("careers_kicker", v)} />
          <Field label="Heading" value={form.careers_title} onChange={(v) => set("careers_title", v)} />
          <div>
            <Label>Careers text</Label>
            <Textarea value={form.careers_body} onChange={(e) => set("careers_body", e.target.value)} />
          </div>
          <Field label="HR email for applications" value={form.careers_email} onChange={(v) => set("careers_email", v)} />
        </section>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save public page"}
        </Button>
      </form>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-navy">Job openings</h2>
          <p className="text-sm text-slate-500">These cards appear in the Careers section on the public page.</p>
        </div>
        <form onSubmit={addJob} className="grid gap-3 rounded-2xl bg-white p-5 shadow-card md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Job title</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Sales Executive" />
          </div>
          <div>
            <Label>Department</Label>
            <Select value={jobDept} onChange={(e) => setJobDept(e.target.value)}>
              <option>Sales</option>
              <option>Accounts</option>
              <option>Warehouse</option>
              <option>HR</option>
              <option>Service</option>
            </Select>
          </div>
          <div>
            <Label>Type</Label>
            <Select value={jobType} onChange={(e) => setJobType(e.target.value)}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Internship</option>
              <option>Contract</option>
            </Select>
          </div>
          <div>
            <Label>Location</Label>
            <Input value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Role note</Label>
            <Textarea value={jobBody} onChange={(e) => setJobBody(e.target.value)} placeholder="What this person will do" />
          </div>
          <div>
            <Button type="submit">
              <Plus size={16} /> Add opening
            </Button>
          </div>
        </form>

        <div className="table-wrap">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Live</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{job.title}</td>
                  <td className="px-4 py-3">{job.department || "—"}</td>
                  <td className="px-4 py-3">{job.location || "—"}</td>
                  <td className="px-4 py-3">{job.employment_type}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleJob(job)}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${job.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {job.is_active ? "On site" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" onClick={() => removeJob(job.id)}>
                      <Trash2 size={14} className="text-rose-600" />
                    </Button>
                  </td>
                </tr>
              ))}
              {!jobs.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No openings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function HighlightCard({
  n,
  title,
  body,
  image,
  onTitle,
  onBody,
  onImage,
}: {
  n: number;
  title: string;
  body: string;
  image: string;
  onTitle: (v: string) => void;
  onBody: (v: string) => void;
  onImage: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Card {n}</p>
      <Field label="Title" value={title} onChange={onTitle} />
      <div className="mt-3">
        <Label>Text</Label>
        <Textarea value={body} onChange={(e) => onBody(e.target.value)} />
      </div>
      <div className="mt-3">
        <Field label="Photo path or URL" value={image} onChange={onImage} />
      </div>
    </div>
  );
}
