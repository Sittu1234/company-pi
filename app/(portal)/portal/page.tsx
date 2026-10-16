"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/utils";

export default function PortalHome() {
  const [d, setD] = useState<any>(null);
  useEffect(() => {
    api("/api/erp/portal/home/").then(setD);
  }, []);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-navy dark:text-white">{d?.dealer?.company || d?.dealer?.name || "Dealer dashboard"}</h1>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat-card"><p className="text-xs uppercase text-slate-500">Orders / PI</p><p className="text-2xl font-extrabold">{d?.orders ?? 0}</p></div>
        <div className="stat-card"><p className="text-xs uppercase text-slate-500">Outstanding</p><p className="text-2xl font-extrabold">{formatINR(d?.outstanding || 0)}</p></div>
        <div className="stat-card"><p className="text-xs uppercase text-slate-500">Open tickets</p><p className="text-2xl font-extrabold">{d?.open_tickets ?? 0}</p></div>
        <div className="stat-card"><p className="text-xs uppercase text-slate-500">Warranty claims</p><p className="text-2xl font-extrabold">{d?.warranty_claims ?? 0}</p></div>
      </div>
    </div>
  );
}
