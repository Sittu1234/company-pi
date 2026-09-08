"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { canManageCompany, getStoredUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import type { CompanyEvent, CompanyEventKind } from "@/lib/types";

const KINDS: { value: CompanyEventKind; label: string }[] = [
  { value: "event", label: "Company Event" },
  { value: "birthday", label: "Birthday" },
  { value: "festival", label: "Festival" },
  { value: "holiday", label: "Holiday" },
];

export default function CompanyCalendarPage() {
  const [rows, setRows] = useState<CompanyEvent[]>([]);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<CompanyEventKind>("event");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const canAdmin = canManageCompany(getStoredUser()?.role);

  function load() {
    api<CompanyEvent[]>("/api/company/events/").then((d) => setRows(Array.isArray(d) ? d : []));
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) {
      toast.error("Title and date are required");
      return;
    }
    await api("/api/company/events/", {
      method: "POST",
      body: JSON.stringify({ title, kind, date, description, is_public: true, is_active: true }),
    });
    toast.success("Calendar item added");
    setTitle("");
    setDescription("");
    load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this calendar item?")) return;
    await api(`/api/company/events/${id}/`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  }

  if (!canAdmin) {
    return <p className="text-slate-500">Only admin can manage the company calendar.</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Company Calendar</h1>
        <p className="text-sm text-slate-500">Events, birthdays, festivals and holidays appear on the public company page.</p>
      </div>

      <form onSubmit={add} className="grid gap-3 rounded-2xl bg-white p-5 shadow-card md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Diwali / Rahul Birthday / Dealer Meet" />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={kind} onChange={(e) => setKind(e.target.value as CompanyEventKind)}>
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Note</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Office closed / cake at 4 PM / dealer meet agenda" />
        </div>
        <div>
          <Button type="submit">
            <Plus size={16} /> Add to calendar
          </Button>
        </div>
      </form>

      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-semibold">{formatDate(r.date)}</td>
                <td className="px-4 py-3 capitalize">{r.kind}</td>
                <td className="px-4 py-3">{r.title}</td>
                <td className="px-4 py-3 text-slate-500">{r.description || "—"}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                    <Trash2 size={14} className="text-rose-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
