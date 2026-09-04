"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/card";
import { api } from "@/lib/api";
import { canManageCompany, getStoredUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import type { Paginated, User } from "@/lib/types";

const emptyForm = { name: "", email: "", employee_id: "", password: "", role: "sales", mobile: "" };

export default function TeamPage() {
  const router = useRouter();
  const [rows, setRows] = useState<User[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [resetFor, setResetFor] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  function load() {
    api<Paginated<User>>("/api/auth/users/?page_size=100").then((d) => setRows(d.results));
  }

  useEffect(() => {
    if (!canManageCompany(getStoredUser()?.role)) {
      router.replace("/dashboard");
      return;
    }
    load();
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/auth/users/", { method: "POST", body: JSON.stringify(form) });
      toast.success("Login created. Share Employee ID and password with the team member.");
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create user");
    }
  }

  async function toggle(u: User) {
    await api(`/api/auth/users/${u.id}/`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !u.is_active }),
    });
    load();
  }

  async function resetPassword(e: FormEvent) {
    e.preventDefault();
    if (!resetFor) return;
    try {
      await api(`/api/auth/users/${resetFor.id}/set_password/`, {
        method: "POST",
        body: JSON.stringify({ password: newPassword }),
      });
      toast.success(`Password updated for ${resetFor.name}`);
      setResetFor(null);
      setNewPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Team Manage</h1>
        <p className="text-sm text-slate-500">
          Create Employee ID and password so sales team can log in. Leave Employee ID blank to auto-generate (KT001…).
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl bg-white p-5 shadow-card md:grid-cols-3 lg:grid-cols-6">
        <div>
          <Label>Name *</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <Label>Email *</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <Label>Employee ID</Label>
          <Input
            placeholder="Auto KT00x"
            value={form.employee_id}
            onChange={(e) => setForm({ ...form, employee_id: e.target.value.toUpperCase() })}
          />
        </div>
        <div>
          <Label>Password *</Label>
          <Input
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Role</Label>
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="sales">Sales Executive</option>
            <option value="accountant">Accountant</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
        <div>
          <Label>Mobile</Label>
          <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        </div>
        <div className="md:col-span-3 lg:col-span-6">
          <Button type="submit">Create login</Button>
        </div>
      </form>

      {resetFor && (
        <form onSubmit={resetPassword} className="flex flex-wrap items-end gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="min-w-[220px] flex-1">
            <Label>New password for {resetFor.name} ({resetFor.employee_id})</Label>
            <Input
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Save password</Button>
          <Button type="button" variant="outline" onClick={() => setResetFor(null)}>
            Cancel
          </Button>
        </form>
      )}

      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Emp ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Last login</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2 font-mono font-semibold text-electric">{u.employee_id || "—"}</td>
                <td className="px-4 py-2 font-semibold">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.mobile || "—"}</td>
                <td className="px-4 py-2 capitalize">{u.role.replace("_", " ")}</td>
                <td className="px-4 py-2 text-slate-600">{formatDateTime(u.last_login)}</td>
                <td className="px-4 py-2">
                  <Badge tone={u.is_active ? "green" : "rose"}>{u.is_active ? "Active" : "Disabled"}</Badge>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => toggle(u)}>
                      {u.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setResetFor(u); setNewPassword(""); }}>
                      <KeyRound size={14} /> Password
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
