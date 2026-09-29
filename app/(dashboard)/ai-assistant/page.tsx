"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Lead } from "@/lib/enterprise";

export default function AiPage() {
  const [data, setData] = useState<{ top_leads: Lead[]; insights: string[] } | null>(null);
  const [picked, setPicked] = useState<any>(null);

  useEffect(() => {
    api<typeof data>("/api/erp/ai/").then(setData);
  }, []);

  async function draft(id: number) {
    const res = await api(`/api/erp/ai/`, { method: "POST", body: JSON.stringify({ lead: id }) });
    setPicked(res);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-navy dark:text-white">AI Sales Assistant</h1>
        <p className="text-sm text-slate-500">Lead priority, follow-up suggestions, email and WhatsApp drafts</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {(data?.insights || []).map((t) => (
          <div key={t} className="stat-card text-sm">{t}</div>
        ))}
      </div>
      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr><th className="px-4 py-3">Lead</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {(data?.top_leads || []).map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-4 py-2 font-mono">{l.lead_number}</td>
                <td className="px-4 py-2">{l.company_name}</td>
                <td className="px-4 py-2 font-bold">{l.priority_score}</td>
                <td className="px-4 py-2"><Badge>{l.status}</Badge></td>
                <td className="px-4 py-2"><Button size="sm" variant="outline" onClick={() => draft(l.id)}>Drafts</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {picked && (
        <div className="space-y-3 rounded-2xl bg-white p-5 dark:bg-slate-900">
          <p className="font-bold">Score {picked.score}</p>
          <p className="text-sm">{picked.suggestion}</p>
          <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800">{picked.email_draft}</pre>
          <pre className="whitespace-pre-wrap rounded-xl bg-emerald-50 p-3 text-xs dark:bg-slate-800">{picked.whatsapp_draft}</pre>
        </div>
      )}
    </div>
  );
}
