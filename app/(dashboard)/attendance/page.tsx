"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/card";
import { api } from "@/lib/api";
import { canManageCompany, getStoredUser } from "@/lib/auth";
import { formatDate, formatTime, todayISO } from "@/lib/utils";

type RosterRow = {
  id: number | null;
  user: number;
  user_name: string;
  employee_id: string | null;
  user_role: string;
  mobile: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string;
};

type Roster = {
  date: string;
  counts: Record<string, number>;
  rows: RosterRow[];
};

type Summary = {
  year: number;
  month: number;
  rows: { user: number; name: string; employee_id: string; present: number; absent: number; leave: number; half_day: number }[];
};

const statusTone: Record<string, "green" | "rose" | "amber" | "slate" | "blue"> = {
  present: "green",
  absent: "rose",
  leave: "amber",
  half_day: "blue",
  holiday: "slate",
  unmarked: "slate",
};

export default function AttendancePage() {
  const router = useRouter();
  const [date, setDate] = useState(todayISO());
  const [roster, setRoster] = useState<Roster | null>(null);
  const [mine, setMine] = useState<{ check_in?: string; check_out?: string; status?: string } | null>(null);
  const [ownRows, setOwnRows] = useState<{ id: number; date: string; check_in: string | null; check_out: string | null; status: string }[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const role = getStoredUser()?.role;
  const isAdmin = canManageCompany(role);
  const canUse = role === "admin" || role === "sales" || role === "accountant";

  function loadToday() {
    api<{ check_in?: string; check_out?: string; status?: string } | null>("/api/attendance/today/")
      .then(setMine)
      .catch(() => setMine(null));
  }

  function loadRoster() {
    if (isAdmin) {
      api<Roster>(`/api/attendance/roster/?date=${date}`).then(setRoster).catch(() => setRoster(null));
    }
    loadToday();
    if (!isAdmin) {
      api<{ results: { id: number; date: string; check_in: string | null; check_out: string | null; status: string }[] }>(
        `/api/attendance/?page_size=40`
      )
        .then((d) => setOwnRows(d.results || []))
        .catch(() => setOwnRows([]));
    }
  }

  useEffect(() => {
    if (role && !canUse) {
      router.replace("/dashboard");
      return;
    }
    loadRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, router, role]);

  useEffect(() => {
    api<Summary>(`/api/attendance/summary/?year=${year}&month=${month}`).then(setSummary).catch(() => {});
  }, [year, month]);

  async function mark(userId: number, status: string) {
    await api("/api/attendance/mark/", {
      method: "POST",
      body: JSON.stringify({ user: userId, date, status }),
    });
    toast.success("Attendance updated");
    loadRoster();
  }

  async function checkIn() {
    try {
      await api("/api/attendance/check_in/", { method: "POST" });
      toast.success("Checked in");
      loadRoster();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
    }
  }

  async function checkOut() {
    try {
      await api("/api/attendance/check_out/", { method: "POST" });
      toast.success("Checked out");
      loadRoster();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-out failed");
    }
  }

  const counts = roster?.counts;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">{isAdmin ? "Attendance" : "My Attendance"}</h1>
          <p className="text-sm text-slate-500">
            {isAdmin ? "Daily roster for sales and accounts team" : "Check in when you start work, check out when you finish"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="success" onClick={checkIn} disabled={Boolean(mine?.check_in)}>
            Check in {mine?.check_in ? `(${formatTime(mine.check_in)})` : ""}
          </Button>
          <Button variant="navy" onClick={checkOut} disabled={!mine?.check_in || Boolean(mine?.check_out)}>
            Check out {mine?.check_out ? `(${formatTime(mine.check_out)})` : ""}
          </Button>
        </div>
      </div>

      {isAdmin && (
        <>
      <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-card">
        <div>
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Present", counts?.present ?? 0, "text-emerald-700 bg-emerald-50"],
          ["Absent", counts?.absent ?? 0, "text-rose-700 bg-rose-50"],
          ["Leave", counts?.leave ?? 0, "text-amber-700 bg-amber-50"],
          ["Half day", counts?.half_day ?? 0, "text-sky-700 bg-sky-50"],
          ["Not marked", counts?.unmarked ?? 0, "text-slate-700 bg-slate-100"],
        ].map(([label, value, cls]) => (
          <div key={String(label)} className={`rounded-2xl p-4 ${cls}`}>
            <p className="text-xs font-semibold uppercase">{label}</p>
            <p className="text-2xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Emp ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Check in</th>
              <th className="px-4 py-3">Check out</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Mark</th>
            </tr>
          </thead>
          <tbody>
            {(roster?.rows || []).map((r) => (
              <tr key={r.user} className="border-t">
                <td className="px-4 py-2 font-mono text-electric">{r.employee_id || "-"}</td>
                <td className="px-4 py-2 font-semibold">{r.user_name}</td>
                <td className="px-4 py-2 capitalize">{r.user_role}</td>
                <td className="px-4 py-2">{formatTime(r.check_in)}</td>
                <td className="px-4 py-2">{formatTime(r.check_out)}</td>
                <td className="px-4 py-2">
                  <Badge tone={statusTone[r.status] || "slate"}>{r.status.replace("_", " ")}</Badge>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="success" onClick={() => mark(r.user, "present")}>
                      Present
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => mark(r.user, "absent")}>
                      Absent
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => mark(r.user, "leave")}>
                      Leave
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </>
      )}

      {!isAdmin && (
        <div className="table-wrap">
          <div className="px-5 py-4">
            <h2 className="font-bold text-navy">My recent days</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Check in</th>
                <th className="px-4 py-3">Check out</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {ownRows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">{formatDate(r.date)}</td>
                  <td className="px-4 py-2">{formatTime(r.check_in)}</td>
                  <td className="px-4 py-2">{formatTime(r.check_out)}</td>
                  <td className="px-4 py-2">
                    <Badge tone={statusTone[r.status] || "slate"}>{r.status.replace("_", " ")}</Badge>
                  </td>
                </tr>
              ))}
              {!ownRows.length && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-400" colSpan={4}>
                    No attendance yet — check in to start today
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="stat-card">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <h2 className="font-bold text-navy">Monthly summary</h2>
          <Select className="w-28" value={String(month)} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i, 1).toLocaleString("en-IN", { month: "short" })}
              </option>
            ))}
          </Select>
          <Select className="w-28" value={String(year)} onChange={(e) => setYear(Number(e.target.value))}>
            {[year - 1, year, year + 1].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </Select>
        </div>
        <div className="table-wrap shadow-none">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Present</th>
                <th className="px-4 py-3">Absent</th>
                <th className="px-4 py-3">Leave</th>
                <th className="px-4 py-3">Half day</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.rows || []).map((r) => (
                <tr key={r.user} className="border-t">
                  <td className="px-4 py-2 font-semibold">
                    {r.name} <span className="text-xs text-slate-400">{r.employee_id}</span>
                  </td>
                  <td className="px-4 py-2">{r.present}</td>
                  <td className="px-4 py-2">{r.absent}</td>
                  <td className="px-4 py-2">{r.leave}</td>
                  <td className="px-4 py-2">{r.half_day}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
