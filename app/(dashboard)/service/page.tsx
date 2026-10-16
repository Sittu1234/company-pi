"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Paginated, User } from "@/lib/types";
import type { ServiceTicket } from "@/lib/enterprise";

export default function ServicePage() {
  const [rows, setRows] = useState<ServiceTicket[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [form, setForm] = useState({ customer_name: "", customer_mobile: "", complaint: "", serial: "", priority: "medium" });
  const [note, setNote] = useState("");
  const [open, setOpen] = useState<ServiceTicket | null>(null);

  function load() {
    api<Paginated<ServiceTicket>>("/api/erp/service-tickets/").then((d) => setRows(d.results));
    api<User[]>("/api/auth/users/lookup/?role=technician").then(setTeam).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    await api("/api/erp/service-tickets/", { method: "POST", body: JSON.stringify(form) });
    toast.success("Ticket opened");
    load();
  }

  async function assign(id: number, technician: string) {
    await api(`/api/erp/service-tickets/${id}/assign/`, { method: "POST", body: JSON.stringify({ technician: Number(technician) }) });
    load();
  }

  async function addUpdate(e: FormEvent) {
    e.preventDefault();
    if (!open) return;
    const updated = await api<ServiceTicket>(`/api/erp/service-tickets/${open.id}/updates/`, {
      method: "POST",
      body: JSON.stringify({ body: note, status: "in_progress" }),
    });
    setOpen(updated);
    setNote("");
    load();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-navy dark:text-white">Service Center</h1>
        <p className="text-sm text-slate-500">Complaints, technician assignment, repair tracking</p>
      </div>
      <form onSubmit={create} className="grid gap-3 rounded-2xl bg-white p-5 dark:bg-slate-900 md:grid-cols-2">
        <div><Label>Customer</Label><Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required /></div>
        <div><Label>Mobile</Label><Input value={form.customer_mobile} onChange={(e) => setForm({ ...form, customer_mobile: e.target.value })} /></div>
        <div><Label>Serial</Label><Input value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} /></div>
        <div>
          <Label>Priority</Label>
          <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
        <div className="md:col-span-2"><Label>Complaint</Label><Textarea value={form.complaint} onChange={(e) => setForm({ ...form, complaint: e.target.value })} required /></div>
        <div><Button>Register complaint</Button></div>
      </form>
      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr><th className="px-4 py-3">Ticket</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Technician</th></tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2 font-mono cursor-pointer text-electric" onClick={() => setOpen(t)}>{t.ticket_number}</td>
                <td className="px-4 py-2">{t.customer_name}<div className="text-xs text-slate-500">{t.complaint.slice(0, 80)}</div></td>
                <td className="px-4 py-2"><Badge>{t.status.replace("_", " ")}</Badge></td>
                <td className="px-4 py-2">
                  <Select value={String(t.technician || "")} onChange={(e) => assign(t.id, e.target.value)}>
                    <option value="">Assign</option>
                    {team.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <form onSubmit={addUpdate} className="rounded-2xl bg-white p-5 dark:bg-slate-900">
          <p className="font-bold">{open.ticket_number} history</p>
          <Textarea className="mt-2" value={note} onChange={(e) => setNote(e.target.value)} required />
          <Button className="mt-2" size="sm">Add update</Button>
        </form>
      )}
    </div>
  );
}
