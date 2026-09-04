"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import { getStoredUser, isAccountant, isSales } from "@/lib/auth";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Daily = {
  date: string;
  pi_count: number;
  sales_value: number;
  taxable?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  gst?: number;
  customer_count: number;
  invoices: { pi_number: string; customer: string; grand_total: number }[];
};
type Monthly = {
  year: number;
  month: number;
  pi_count: number;
  sales_value: number;
  taxable?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  gst?: number;
  daily: { date: string; total: number; count: number }[];
  top_customers: { name: string; company: string; total: number; count: number }[];
};
type CustR = { customers: { id: number; name: string; company: string; mobile: string; total: number; count: number }[]; invoices: { pi_number: string; pi_date: string; grand_total: number; status: string }[] };

export default function ReportsPage() {
  const [tab, setTab] = useState<"daily" | "monthly" | "customer">("daily");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [daily, setDaily] = useState<Daily | null>(null);
  const [monthly, setMonthly] = useState<Monthly | null>(null);
  const [cust, setCust] = useState<CustR | null>(null);
  const [cid, setCid] = useState("");
  const salesUser = isSales(getStoredUser()?.role);
  const accountsUser = isAccountant(getStoredUser()?.role);

  useEffect(() => {
    api<Daily>(`/api/reports/daily/?date=${date}`).then(setDaily);
  }, [date]);

  useEffect(() => {
    api<Monthly>(`/api/reports/monthly/?year=${year}&month=${month}`).then(setMonthly);
  }, [year, month]);

  useEffect(() => {
    const q = cid ? `?customer=${cid}` : "";
    api<CustR>(`/api/reports/customers/${q}`).then(setCust);
  }, [cid]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">
          {salesUser ? "My Reports" : accountsUser ? "Accounts Reports" : "Reports"}
        </h1>
        <p className="text-sm text-slate-500">
          {salesUser
            ? "Your PI numbers only — daily, monthly and dealer-wise"
            : accountsUser
              ? "Company-wide PI, GST (CGST / SGST / IGST) and dealer-wise value"
              : "Daily, monthly and customer-wise PI analytics"}
        </p>
      </div>
      <div className="flex gap-2">
        {(["daily", "monthly", "customer"] as const).map((t) => (
          <Button key={t} variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)} className="capitalize">
            {t} report
          </Button>
        ))}
      </div>

      {tab === "daily" && daily && (
        <div className="space-y-4">
          <div className="max-w-xs">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="PI Created" value={daily.pi_count} />
            <Stat label="Sales Value" value={formatINR(daily.sales_value)} />
            <Stat label="Customer Count" value={daily.customer_count} />
          </div>
          {!salesUser && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Taxable" value={formatINR(daily.taxable || 0)} />
              <Stat label="CGST" value={formatINR(daily.cgst || 0)} />
              <Stat label="SGST" value={formatINR(daily.sgst || 0)} />
              <Stat label="IGST" value={formatINR(daily.igst || 0)} />
            </div>
          )}
          <div className="table-wrap">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">PI</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {daily.invoices.map((i) => (
                  <tr key={i.pi_number} className="border-t">
                    <td className="px-4 py-2">{i.pi_number}</td>
                    <td className="px-4 py-2">{i.customer}</td>
                    <td className="px-4 py-2">{formatINR(i.grand_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "monthly" && monthly && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div>
              <Label>Year</Label>
              <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </div>
            <div>
              <Label>Month</Label>
              <Select value={String(month)} onChange={(e) => setMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Monthly PI Count" value={monthly.pi_count} />
            <Stat label="Monthly Sales" value={formatINR(monthly.sales_value)} />
          </div>
          {!salesUser && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Taxable" value={formatINR(monthly.taxable || 0)} />
              <Stat label="CGST" value={formatINR(monthly.cgst || 0)} />
              <Stat label="SGST" value={formatINR(monthly.sgst || 0)} />
              <Stat label="IGST" value={formatINR(monthly.igst || 0)} />
            </div>
          )}
          <div className="stat-card h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#0A2540" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="stat-card">
            <h3 className="mb-3 font-bold">Top Customers</h3>
            {monthly.top_customers.map((c) => (
              <div key={c.name} className="flex justify-between border-b py-2 text-sm">
                <span>
                  {c.name} · {c.company}
                </span>
                <span className="font-semibold">{formatINR(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "customer" && cust && (
        <div className="space-y-4">
          <div className="max-w-sm">
            <Label>Filter customer ID (optional)</Label>
            <Input value={cid} onChange={(e) => setCid(e.target.value)} placeholder="Customer ID" />
          </div>
          <div className="table-wrap">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">PI Count</th>
                  <th className="px-4 py-3">Purchase Value</th>
                </tr>
              </thead>
              <tbody>
                {cust.customers.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-2">
                      <button className="font-semibold text-electric" onClick={() => setCid(String(c.id))}>
                        {c.name}
                      </button>
                    </td>
                    <td className="px-4 py-2">{c.company}</td>
                    <td className="px-4 py-2">{c.count}</td>
                    <td className="px-4 py-2">{formatINR(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!!cust.invoices.length && (
            <div className="table-wrap">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">PI</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cust.invoices.map((i) => (
                    <tr key={i.pi_number} className="border-t">
                      <td className="px-4 py-2">{i.pi_number}</td>
                      <td className="px-4 py-2">{i.pi_date}</td>
                      <td className="px-4 py-2">{formatINR(i.grand_total)}</td>
                      <td className="px-4 py-2">{i.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-card">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-navy">{value}</p>
    </div>
  );
}
