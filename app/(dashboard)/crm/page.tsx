"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api, downloadFile } from "@/lib/api";
import { INDIAN_STATES, type Paginated, type User } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { LEAD_SOURCES, LEAD_STATUSES, type Lead } from "@/lib/enterprise";

const empty = {
  company_name: "",
  contact_person: "",
  mobile: "",
  email: "",
  state: "Uttar Pradesh",
  city: "",
  source: "direct",
  product_interest: "",
  notes: "",
};

export default function CrmPage() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [q, setQ] = useState("");
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState<Lead | null>(null);
  const [note, setNote] = useState("");
  const [followAt, setFollowAt] = useState("");
  const [pipeline, setPipeline] = useState<{ pipeline: { status: string; label: string; count: number }[]; followups_due: number; hot: number } | null>(null);
  const [team, setTeam] = useState<User[]>([]);

  function load() {
    const p = new URLSearchParams();
    if (q) p.set("search", q);
    if (status) p.set("status", status);
    if (source) p.set("source", source);
    api<Paginated<Lead>>(`/api/erp/leads/?${p}`).then((d) => setRows(d.results));
    api<typeof pipeline>("/api/erp/leads/pipeline/").then(setPipeline).catch(() => {});
  }

  useEffect(() => {
    load();
    api<User[]>("/api/auth/users/sales_team/").then(setTeam).catch(() => {});
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/erp/leads/", { method: "POST", body: JSON.stringify(form) });
      toast.success("Lead created");
      setForm(empty);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save lead");
    }
  }

  async function saveLead(patch: Partial<Lead>) {
    if (!open) return;
    const updated = await api<Lead>(`/api/erp/leads/${open.id}/`, { method: "PATCH", body: JSON.stringify(patch) });
    setOpen(updated);
    load();
  }

  async function addNote(e: FormEvent) {
    e.preventDefault();
    if (!open) return;
    const updated = await api<Lead>(`/api/erp/leads/${open.id}/notes/`, { method: "POST", body: JSON.stringify({ body: note }) });
    setNote("");
    setOpen(updated);
    load();
  }

  async function addFollow(e: FormEvent) {
    e.preventDefault();
    if (!open) return;
    const updated = await api<Lead>(`/api/erp/leads/${open.id}/followups/`, {
      method: "POST",
      body: JSON.stringify({ due_at: followAt }),
    });
    setFollowAt("");
    setOpen(updated);
    toast.success("Follow-up saved");
    load();
  }

  async function convert() {
    if (!open) return;
    try {
      const res = await api<{ dealer_id: number; lead: Lead }>(`/api/erp/leads/${open.id}/convert_dealer/`, { method: "POST", body: "{}" });
      toast.success(`Dealer created #${res.dealer_id}`);
      setOpen(res.lead);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Convert failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy dark:text-white">CRM & Lead Management</h1>
          <p className="text-sm text-slate-500">IndiaMART to dealer conversion, follow-ups and call notes</p>
        </div>
        <Button variant="outline" onClick={() => downloadFile("/api/erp/leads/export/", "leads.xlsx")}>Export Excel</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(pipeline?.pipeline || []).slice(0, 4).map((b) => (
          <div key={b.status} className="stat-card">
            <p className="text-xs uppercase text-slate-500">{b.label}</p>
            <p className="text-2xl font-extrabold">{b.count}</p>
          </div>
        ))}
      </div>

      <form onSubmit={create} className="grid gap-3 rounded-2xl bg-white p-5 shadow-card dark:bg-slate-900 md:grid-cols-4">
        <div><Label>Company</Label><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required /></div>
        <div><Label>Contact</Label><Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} required /></div>
        <div><Label>Mobile</Label><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required /></div>
        <div>
          <Label>Source</Label>
          <Select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
            {LEAD_SOURCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </div>
        <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
        <div>
          <Label>State</Label>
          <Select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
            {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
        <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><Label>Product interest</Label><Input value={form.product_interest} onChange={(e) => setForm({ ...form, product_interest: e.target.value })} /></div>
        <div className="md:col-span-4"><Button type="submit">Add lead</Button></div>
      </form>

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="">All status</option>
          {LEAD_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        <Select value={source} onChange={(e) => setSource(e.target.value)} className="w-40">
          <option value="">All sources</option>
          {LEAD_SOURCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        <Button type="button" variant="outline" onClick={load}>Filter</Button>
      </div>

      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Assigned</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="cursor-pointer border-t hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setOpen(l)}>
                <td className="px-4 py-2 font-mono text-electric">{l.lead_number}</td>
                <td className="px-4 py-2 font-semibold">{l.company_name}<div className="text-xs text-slate-500">{l.contact_person} · {l.mobile}</div></td>
                <td className="px-4 py-2 capitalize">{l.source}</td>
                <td className="px-4 py-2"><Badge>{l.status.replace("_", " ")}</Badge></td>
                <td className="px-4 py-2 font-bold">{l.priority_score}</td>
                <td className="px-4 py-2">{l.assigned_to_name || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-3xl rounded-2xl bg-white p-6 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-electric">{open.lead_number}</p>
                <h2 className="text-xl font-extrabold">{open.company_name}</h2>
                <p className="text-sm text-slate-500">AI score {open.priority_score} · {open.followup_suggestion}</p>
              </div>
              <Button variant="outline" onClick={() => setOpen(null)}>Close</Button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <Label>Status</Label>
                <Select value={open.status} onChange={(e) => saveLead({ status: e.target.value })}>
                  {LEAD_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
              </div>
              <div>
                <Label>Assign sales</Label>
                <Select value={String(open.assigned_to || "")} onChange={(e) => saveLead({ assigned_to: Number(e.target.value) || null })}>
                  <option value="">Unassigned</option>
                  {team.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </Select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {open.whatsapp_url && <a href={open.whatsapp_url} target="_blank"><Button>WhatsApp</Button></a>}
              {open.mailto && <a href={open.mailto}><Button variant="outline">Email</Button></a>}
              <Button variant="success" onClick={convert}>Convert to dealer</Button>
            </div>
            <form onSubmit={addNote} className="mt-4 space-y-2">
              <Label>Call note</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} required />
              <Button size="sm">Save note</Button>
            </form>
            <form onSubmit={addFollow} className="mt-3 flex flex-wrap items-end gap-2">
              <div>
                <Label>Follow-up</Label>
                <Input type="datetime-local" value={followAt} onChange={(e) => setFollowAt(e.target.value)} required />
              </div>
              <Button size="sm" variant="outline">Set reminder</Button>
            </form>
            <div className="mt-4 space-y-2 text-sm">
              {(open.call_notes || []).map((n) => (
                <div key={n.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-500">{n.author_name} · {formatDateTime(n.created_at)}</p>
                  {n.body}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
