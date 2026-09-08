"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, Printer, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { api } from "@/lib/api";
import { canWriteInvoices, getStoredUser } from "@/lib/auth";
import { formatDate, formatINR } from "@/lib/utils";
import type { Product } from "@/lib/types";

type Group = {
  category: string;
  description: string;
  items: Product[];
};

type PriceList = {
  date: string;
  title: string;
  note: string;
  groups: Group[];
};

const tones: Record<string, "blue" | "green" | "amber"> = {
  "EV Scooter": "blue",
  "Lithium Battery": "green",
  "LED Battery": "amber",
};

export function PriceListBoard({ heading = true }: { heading?: boolean }) {
  const [data, setData] = useState<PriceList | null>(null);
  const canPI = canWriteInvoices(getStoredUser()?.role);

  useEffect(() => {
    api<PriceList>("/api/products/price_list/").then(setData).catch(() => setData(null));
  }, []);

  const shareText = useMemo(() => {
    if (!data) return "";
    const lines = [`Kalpna Traders — Price List (${formatDate(data.date)})`, ""];
    for (const g of data.groups) {
      lines.push(`*${g.category}*`);
      for (const p of g.items) {
        lines.push(`${p.product_name} — ${formatINR(Number(p.price))} + GST ${p.gst}%`);
      }
      lines.push("");
    }
    lines.push(data.note);
    lines.push("Call: 9289975453");
    return lines.join("\n");
  }, [data]);

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  }

  return (
    <div className="space-y-5">
      {heading && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-electric">Kalpna Traders</p>
            <h1 className="text-2xl font-extrabold text-navy">Price List</h1>
            <p className="text-sm text-slate-500">
              EV Scooter · Lithium Battery · LED Battery · {data ? formatDate(data.date) : "Loading…"}
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="success" onClick={shareWhatsApp} disabled={!data}>
              <MessageCircle size={16} /> WhatsApp list
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer size={16} /> Print
            </Button>
          </div>
        </div>
      )}

      {!heading && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-navy">Price List</h2>
          <div className="flex gap-2 print:hidden">
            <Button size="sm" variant="success" onClick={shareWhatsApp} disabled={!data}>
              <MessageCircle size={14} /> WhatsApp
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer size={14} /> Print
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-navy p-4 text-sm text-blue-100">
        {data?.note || "Prices exclusive of GST."}
      </div>

      {(data?.groups || []).map((g) => (
        <div key={g.category} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-navy">{g.category}</h2>
            <Badge tone={tones[g.category] || "blue"}>{g.items.length} items</Badge>
          </div>
          <div className="table-wrap">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">HSN</th>
                  <th className="px-4 py-3">GST</th>
                  <th className="px-4 py-3">Rate</th>
                  {canPI && <th className="px-4 py-3 print:hidden">Action</th>}
                </tr>
              </thead>
              <tbody>
                {g.items.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">{p.product_name}</p>
                      <p className="text-xs text-slate-500">{p.description}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p.product_code}</td>
                    <td className="px-4 py-3">{p.hsn_code}</td>
                    <td className="px-4 py-3">{p.gst}%</td>
                    <td className="px-4 py-3 text-base font-extrabold text-electric">{formatINR(Number(p.price))}</td>
                    {canPI && (
                      <td className="px-4 py-3 print:hidden">
                        <Link href="/invoices/new">
                          <Button size="sm" variant="navy">
                            <Plus size={14} /> PI
                          </Button>
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {!data?.groups?.length && (
        <p className="rounded-2xl bg-white p-8 text-center text-slate-400 shadow-card">Price list loading…</p>
      )}
    </div>
  );
}
