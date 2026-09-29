"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api, openPdf } from "@/lib/api";
import { formatINR } from "@/lib/utils";

export default function PortalOrders() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    api<any[]>("/api/erp/portal/invoices/").then(setRows);
  }, []);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Orders & PI</h1>
      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Number</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Due</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2 font-mono">{r.tax_invoice_number || r.pi_number}</td>
                <td className="px-4 py-2">{r.pi_date}</td>
                <td className="px-4 py-2">{r.status}</td>
                <td className="px-4 py-2">{formatINR(r.grand_total)}</td>
                <td className="px-4 py-2">{formatINR(r.balance_due)}</td>
                <td className="px-4 py-2"><Button size="sm" variant="outline" onClick={() => openPdf(`/api/erp/portal/invoices/${r.id}/pdf/`)}>PDF</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
