"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { api, downloadFile, openPdf } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import type { Paginated } from "@/lib/types";

type Run = { id: number; year: number; month: number; status: string; payslips?: any[] };

export default function PayrollPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [runs, setRuns] = useState<Run[]>([]);

  function load() {
    api<Paginated<Run>>("/api/erp/payroll/").then((d) => setRuns(d.results));
  }
  useEffect(() => { load(); }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    try {
      const run = await api<Run>("/api/erp/payroll/", { method: "POST", body: JSON.stringify({ year, month }) });
      await api(`/api/erp/payroll/${run.id}/process/`, { method: "POST", body: "{}" });
      toast.success("Payroll processed");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payroll failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy dark:text-white">Payroll</h1>
          <p className="text-sm text-slate-500">Salary, incentive, bonus, PF, ESI, TDS · payslip PDF</p>
        </div>
        <Button variant="outline" onClick={() => downloadFile(`/api/erp/payroll/export/?year=${year}&month=${month}`, "salary.xlsx")}>Salary Excel</Button>
      </div>
      <form onSubmit={create} className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-5 dark:bg-slate-900">
        <div><Label>Year</Label><Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} /></div>
        <div><Label>Month</Label><Input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} /></div>
        <Button>Create & process</Button>
      </form>
      {runs.map((r) => (
        <div key={r.id} className="table-wrap">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="font-bold">{r.month}/{r.year} · {r.status}</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
              <tr><th className="px-4 py-2">Employee</th><th className="px-4 py-2">Gross</th><th className="px-4 py-2">PF</th><th className="px-4 py-2">ESI</th><th className="px-4 py-2">TDS</th><th className="px-4 py-2">Net</th><th className="px-4 py-2"></th></tr>
            </thead>
            <tbody>
              {(r.payslips || []).map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">{p.user_name}</td>
                  <td className="px-4 py-2">{formatINR(p.gross)}</td>
                  <td className="px-4 py-2">{formatINR(p.pf)}</td>
                  <td className="px-4 py-2">{formatINR(p.esi)}</td>
                  <td className="px-4 py-2">{formatINR(p.tds)}</td>
                  <td className="px-4 py-2 font-bold">{formatINR(p.net)}</td>
                  <td className="px-4 py-2"><Button size="sm" variant="outline" onClick={() => openPdf(`/api/erp/payslips/${p.id}/pdf/`)}>Payslip</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
