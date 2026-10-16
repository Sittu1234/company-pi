"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import type { Paginated } from "@/lib/types";
import type { NotificationRow } from "@/lib/enterprise";

export default function NotificationsPage() {
  const [rows, setRows] = useState<NotificationRow[]>([]);

  function load() {
    api<Paginated<NotificationRow>>("/api/erp/notifications/").then((d) => setRows(d.results));
  }
  useEffect(() => { load(); }, []);

  async function readAll() {
    await api("/api/erp/notifications/read_all/", { method: "POST", body: "{}" });
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy dark:text-white">Notification Center</h1>
          <p className="text-sm text-slate-500">Leads, follow-ups, payments, leave, stock, warranty · in-app + email</p>
        </div>
        <Button variant="outline" onClick={readAll}>Mark all read</Button>
      </div>
      <div className="space-y-2">
        {rows.map((n) => (
          <Link key={n.id} href={n.link || "/dashboard"} className={`block rounded-xl border p-4 ${n.is_read ? "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900" : "border-electric/30 bg-electric-50 dark:bg-slate-800"}`}>
            <p className="text-xs uppercase text-slate-500">{n.kind} · {formatDateTime(n.created_at)}</p>
            <p className="font-bold">{n.title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{n.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
