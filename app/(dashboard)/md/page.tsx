"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/utils";

export default function MdPage() {
  const [d, setD] = useState<any>(null);
  useEffect(() => {
    api("/api/erp/md/").then(setD).catch(() => setD(null));
  }, []);

  const kpis = [
    ["Today sales", formatINR(d?.today_sales || 0)],
    ["Monthly sales", formatINR(d?.monthly_sales || 0)],
    ["Quarterly sales", formatINR(d?.quarterly_sales || 0)],
    ["Collection (month)", formatINR(d?.collection || 0)],
    ["Pending payments", formatINR(d?.pending_payments || 0)],
    ["Active dealers", d?.active_dealers ?? "—"],
    ["New dealers", d?.new_dealers ?? "—"],
    ["Present today", d?.present_today ?? "—"],
    ["Current stock", d?.current_stock ?? "—"],
    ["Low stock SKUs", d?.low_stock ?? "—"],
    ["Open leads", d?.open_leads ?? "—"],
    ["Open tickets", d?.open_tickets ?? "—"],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy dark:text-white">MD Dashboard</h1>
        <p className="text-sm text-slate-500">Company-wide KPIs for Kalpna Traders leadership</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([k, v]) => (
          <div key={k} className="stat-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k}</p>
            <p className="mt-1 text-xl font-extrabold text-navy dark:text-white">{v}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="stat-card h-72">
          <p className="mb-3 text-sm font-bold">Revenue trend</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={d?.revenue_trend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tax_invoice_date__month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="stat-card">
          <p className="mb-3 text-sm font-bold">Product performance</p>
          <ul className="space-y-2 text-sm">
            {(d?.product_performance || []).map((p: any, i: number) => (
              <li key={i} className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
                <span>{p.items__product_name || "Item"}</span>
                <span className="font-semibold">{formatINR(p.total || 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
