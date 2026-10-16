"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Paginated } from "@/lib/types";

type Log = {
  id: number;
  user_name: string;
  action: string;
  model_name: string;
  details: string;
  created_at: string;
};

export default function ActivityPage() {
  const [rows, setRows] = useState<Log[]>([]);

  useEffect(() => {
    api<Paginated<Log>>("/api/activity/logs/").then((d) => setRows(d.results));
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-navy">Activity Logs</h1>
      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{formatDate(r.created_at)}</td>
                <td className="px-4 py-2">{r.user_name || "—"}</td>
                <td className="px-4 py-2 capitalize">{r.action}</td>
                <td className="px-4 py-2">{r.model_name}</td>
                <td className="px-4 py-2 text-slate-600">{r.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
