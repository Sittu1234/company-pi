"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import type { Paginated, User } from "@/lib/types";
import type { WorkTask } from "@/lib/enterprise";

export default function TasksPage() {
  const role = getStoredUser()?.role;
  const canAssign = role === "admin" || role === "manager";
  const [mine, setMine] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ title: "", description: "", assigned_to: "", due_date: "", priority: "medium" });

  function load() {
    api("/api/erp/tasks/mine/").then(setMine);
    api<Paginated<User>>("/api/auth/users/?page_size=100").then((d) => setUsers(d.results)).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/erp/tasks/", { method: "POST", body: JSON.stringify({ ...form, assigned_to: Number(form.assigned_to) }) });
      toast.success("Task assigned");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Assign failed");
    }
  }

  async function setStatus(id: number, status: string) {
    await api(`/api/erp/tasks/${id}/`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  }

  const groups: [string, WorkTask[]][] = [
    ["Overdue", mine?.overdue || []],
    ["Pending", mine?.pending || []],
    ["In progress", mine?.in_progress || []],
    ["Completed", mine?.completed || []],
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-navy dark:text-white">Task Management</h1>
        <p className="text-sm text-slate-500">My tasks, overdue and completed. Admin/Manager can assign.</p>
      </div>
      {canAssign && (
        <form onSubmit={create} className="grid gap-3 rounded-2xl bg-white p-5 dark:bg-slate-900 md:grid-cols-2">
          <div className="md:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div>
            <Label>Assign to</Label>
            <Select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} required>
              <option value="">Select</option>
              {users.filter((u) => u.role !== "dealer").map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
          </div>
          <div><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required /></div>
          <div>
            <Label>Priority</Label>
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Button>Assign task</Button></div>
        </form>
      )}
      {groups.map(([title, list]) => (
        <div key={title}>
          <h2 className="mb-2 font-bold">{title} ({list.length})</h2>
          <div className="space-y-2">
            {list.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <p className="font-semibold">{t.title} <span className="font-mono text-xs text-electric">{t.task_number}</span></p>
                  <p className="text-xs text-slate-500">Due {t.due_date} · {t.priority}</p>
                </div>
                <div className="flex gap-2">
                  <Badge tone={t.is_overdue ? "rose" : "slate"}>{t.status.replace("_", " ")}</Badge>
                  {t.status !== "completed" && <Button size="sm" onClick={() => setStatus(t.id, t.status === "pending" ? "in_progress" : "completed")}>{t.status === "pending" ? "Start" : "Complete"}</Button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
