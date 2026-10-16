"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function PortalSupport() {
  const [complaint, setComplaint] = useState("");
  const [serial, setSerial] = useState("");
  const [issue, setIssue] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [warranty, setWarranty] = useState<any>(null);

  function load() {
    api<any[]>("/api/erp/portal/tickets/").then(setTickets);
    api("/api/erp/portal/warranty/").then(setWarranty);
  }
  useEffect(() => { load(); }, []);

  async function ticket(e: FormEvent) {
    e.preventDefault();
    await api("/api/erp/portal/tickets/create/", { method: "POST", body: JSON.stringify({ complaint }) });
    toast.success("Support ticket raised");
    setComplaint("");
    load();
  }

  async function claim(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/erp/portal/warranty/claim/", { method: "POST", body: JSON.stringify({ serial, issue }) });
      toast.success("Warranty claim submitted");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Claim failed");
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Support & Warranty</h1>
      <form onSubmit={ticket} className="rounded-2xl bg-white p-5 dark:bg-slate-900">
        <Label>Raise support ticket</Label>
        <Textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} required />
        <Button className="mt-3">Submit ticket</Button>
      </form>
      <form onSubmit={claim} className="grid gap-3 rounded-2xl bg-white p-5 dark:bg-slate-900 md:grid-cols-2">
        <div><Label>Serial for warranty claim</Label><Input value={serial} onChange={(e) => setSerial(e.target.value)} required /></div>
        <div className="md:col-span-2"><Label>Issue</Label><Textarea value={issue} onChange={(e) => setIssue(e.target.value)} required /></div>
        <div><Button>Submit claim</Button></div>
      </form>
      <ul className="space-y-2 text-sm">
        {tickets.map((t) => (
          <li key={t.id} className="rounded-xl bg-white p-3 dark:bg-slate-900">{t.ticket_number} · {t.status} · {t.complaint}</li>
        ))}
      </ul>
    </div>
  );
}
