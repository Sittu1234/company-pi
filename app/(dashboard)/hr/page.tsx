"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import type { Paginated, User } from "@/lib/types";
import type { EmployeeProfile, LeaveRequest } from "@/lib/enterprise";

export default function HrPage() {
  const role = getStoredUser()?.role;
  const isHrAdmin = role === "admin" || role === "hr";
  const canReviewMgr = role === "admin" || role === "hr" || role === "manager";
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<EmployeeProfile[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leave, setLeave] = useState({ kind: "casual", start_date: "", end_date: "", days: "1", reason: "" });
  const [profile, setProfile] = useState({ user: "", designation: "", joining_date: "", salary: "", aadhaar_number: "", pan_number: "" });

  function load() {
    api<Paginated<LeaveRequest>>("/api/erp/leaves/").then((d) => setLeaves(d.results));
    if (isHrAdmin) {
      api<Paginated<EmployeeProfile>>("/api/erp/employees/").then((d) => setProfiles(d.results));
      api<Paginated<User>>("/api/auth/users/?page_size=100").then((d) => setUsers(d.results)).catch(() => {});
    }
  }
  useEffect(() => { load(); }, []);

  async function applyLeave(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/erp/leaves/", { method: "POST", body: JSON.stringify(leave) });
      toast.success("Leave submitted · Manager → Admin");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Leave failed");
    }
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    await api("/api/erp/employees/", { method: "POST", body: JSON.stringify({ ...profile, user: Number(profile.user) }) });
    toast.success("Employee profile saved");
    load();
  }

  async function review(id: number, path: string, approve: boolean) {
    await api(`/api/erp/leaves/${id}/${path}/`, { method: "POST", body: JSON.stringify({ approve }) });
    load();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-navy dark:text-white">HR Management</h1>
        <p className="text-sm text-slate-500">Profiles, documents fields, casual/sick/earned leave · Employee → Manager → Admin</p>
      </div>

      <form onSubmit={applyLeave} className="grid gap-3 rounded-2xl bg-white p-5 dark:bg-slate-900 md:grid-cols-5">
        <div>
          <Label>Leave type</Label>
          <Select value={leave.kind} onChange={(e) => setLeave({ ...leave, kind: e.target.value })}>
            <option value="casual">Casual</option>
            <option value="sick">Sick</option>
            <option value="earned">Earned</option>
          </Select>
        </div>
        <div><Label>From</Label><Input type="date" value={leave.start_date} onChange={(e) => setLeave({ ...leave, start_date: e.target.value })} required /></div>
        <div><Label>To</Label><Input type="date" value={leave.end_date} onChange={(e) => setLeave({ ...leave, end_date: e.target.value })} required /></div>
        <div><Label>Days</Label><Input value={leave.days} onChange={(e) => setLeave({ ...leave, days: e.target.value })} /></div>
        <div className="md:col-span-5"><Label>Reason</Label><Textarea value={leave.reason} onChange={(e) => setLeave({ ...leave, reason: e.target.value })} /></div>
        <div><Button>Apply leave</Button></div>
      </form>

      {isHrAdmin && (
        <form onSubmit={saveProfile} className="grid gap-3 rounded-2xl bg-white p-5 dark:bg-slate-900 md:grid-cols-3">
          <div>
            <Label>Employee</Label>
            <Select value={profile.user} onChange={(e) => setProfile({ ...profile, user: e.target.value })} required>
              <option value="">Select</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.employee_id} {u.name}</option>)}
            </Select>
          </div>
          <div><Label>Designation</Label><Input value={profile.designation} onChange={(e) => setProfile({ ...profile, designation: e.target.value })} /></div>
          <div><Label>Joining</Label><Input type="date" value={profile.joining_date} onChange={(e) => setProfile({ ...profile, joining_date: e.target.value })} /></div>
          <div><Label>Salary</Label><Input value={profile.salary} onChange={(e) => setProfile({ ...profile, salary: e.target.value })} /></div>
          <div><Label>Aadhaar</Label><Input value={profile.aadhaar_number} onChange={(e) => setProfile({ ...profile, aadhaar_number: e.target.value })} /></div>
          <div><Label>PAN</Label><Input value={profile.pan_number} onChange={(e) => setProfile({ ...profile, pan_number: e.target.value })} /></div>
          <div><Button>Save profile</Button></div>
        </form>
      )}

      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr><th className="px-4 py-3">Request</th><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-4 py-2 font-mono">{l.request_number}</td>
                <td className="px-4 py-2">{l.user_name}</td>
                <td className="px-4 py-2 capitalize">{l.kind}</td>
                <td className="px-4 py-2">{l.start_date} → {l.end_date}</td>
                <td className="px-4 py-2"><Badge>{l.status.replace("_", " ")}</Badge></td>
                <td className="px-4 py-2">
                  {canReviewMgr && l.status === "pending" && (
                    <Button size="sm" onClick={() => review(l.id, "manager_review", true)}>Manager approve</Button>
                  )}
                  {isHrAdmin && (l.status === "pending" || l.status === "manager_approved") && (
                    <Button size="sm" className="ml-1" variant="success" onClick={() => review(l.id, "admin_review", true)}>Admin approve</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isHrAdmin && (
        <div className="table-wrap">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
              <tr><th className="px-4 py-3">Emp</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Designation</th><th className="px-4 py-3">Salary</th></tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2 font-mono">{p.employee_id}</td>
                  <td className="px-4 py-2">{p.user_name}</td>
                  <td className="px-4 py-2">{p.designation}</td>
                  <td className="px-4 py-2">{p.salary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
