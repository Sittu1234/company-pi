"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, Mail, MessageCircle, Pencil, Printer, Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ApiError, api, downloadFile, openPdf } from "@/lib/api";
import { canManageUsers, canWriteInvoices, getStoredUser } from "@/lib/auth";
import { formatDate, formatDateTime, formatINR } from "@/lib/utils";
import type { Invoice } from "@/lib/types";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [message, setMessage] = useState("");
  const role = getStoredUser()?.role;
  const canWrite = canWriteInvoices(role);

  function load() {
    api<Invoice>(`/api/invoices/${id}/`).then((d) => {
      setInv(d);
      setEmailTo(d.customer_detail?.email || "");
    });
  }

  useEffect(() => {
    load();
  }, [id]);

  if (!inv) return <p className="text-slate-500">Loading PI…</p>;
  const c = inv.customer_detail;

  async function sendEmail() {
    await api(`/api/invoices/${id}/email/`, {
      method: "POST",
      body: JSON.stringify({ to: emailTo, message }),
    });
    toast.success("Email sent");
    load();
  }

  async function sendWhatsApp() {
    const data = await api<{ url: string }>(`/api/invoices/${id}/whatsapp/`);
    window.open(data.url, "_blank");
    load();
  }

  async function remove() {
    if (!confirm("Delete this PI?")) return;
    await api(`/api/invoices/${id}/`, { method: "DELETE" });
    toast.success("Deleted");
    router.push("/invoices");
  }

  async function convertTax() {
    if (!confirm("Is PI ready? Convert to Tax Invoice? Number 004 se start hoga.")) return;
    try {
      const saved = await api<Invoice>(`/api/invoices/${id}/convert_tax/`, { method: "POST" });
      toast.success(`Tax Invoice ${saved.tax_invoice_number} ban gaya`);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Convert failed");
    }
  }

  const hasTax = Boolean(inv.tax_invoice_number);
  const canConvert =
    inv.can_convert_tax ??
    (!hasTax &&
      inv.items.length > 0 &&
      inv.status !== "cancelled" &&
      inv.status !== "expired");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-electric">
            {hasTax ? "Proforma Invoice · Tax Invoice" : "Proforma Invoice"}
          </p>
          <h1 className="text-2xl font-extrabold text-navy">{inv.pi_number}</h1>
          {hasTax && (
            <p className="text-lg font-extrabold text-electric">{inv.tax_invoice_number}</p>
          )}
          <p className="text-sm text-slate-500">
            {formatDate(inv.pi_date)} · Valid till {formatDate(inv.valid_till)}
            {hasTax && inv.tax_invoice_date ? ` · Tax invoice ${formatDate(inv.tax_invoice_date)}` : ""}
          </p>
          {!canWrite && (
            <p className="mt-1 text-xs font-semibold text-amber-700">
              Accounts view — print, PDF, WhatsApp or email. Cannot edit this PI.
            </p>
          )}
          <p className="mt-1 text-sm text-slate-600">
            Created by <span className="font-semibold">{inv.created_by_name || "—"}</span>
            {inv.created_by_employee_id ? ` (${inv.created_by_employee_id})` : ""} · {formatDateTime(inv.created_at)}
            {inv.pi_kind ? (
              <span className="ml-2 rounded-full bg-electric-50 px-2 py-0.5 text-xs font-semibold capitalize text-electric">
                {inv.pi_kind === "ev_scooter" ? "EV Scooter" : inv.pi_kind === "both" ? "Battery + EV Scooter" : "Battery"}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canWrite && canConvert && (
            <Button onClick={convertTax}>
              <Receipt size={16} /> Convert to Tax Invoice
            </Button>
          )}
          {hasTax && (
            <>
              <Button
                variant="navy"
                onClick={() => downloadFile(`/api/invoices/${id}/pdf/?kind=tax`, `${inv.tax_invoice_number}.pdf`)}
              >
                <Download size={16} /> Tax Invoice PDF
              </Button>
              <Button variant="outline" onClick={() => openPdf(`/api/invoices/${id}/pdf/?kind=tax&inline=1`)}>
                <Printer size={16} /> Print Tax Invoice
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => downloadFile(`/api/invoices/${id}/pdf/`, `${inv.pi_number}.pdf`)}>
            <Download size={16} /> Download PDF
          </Button>
          <Button variant="outline" onClick={() => openPdf(`/api/invoices/${id}/pdf/?inline=1`)}>
            <Printer size={16} /> Print PDF
          </Button>
          <Button variant="success" onClick={sendWhatsApp}>
            <MessageCircle size={16} /> WhatsApp
          </Button>
          {canWrite && (
            <Link href={`/invoices/${id}/edit`}>
              <Button variant="navy">
                <Pencil size={16} /> Edit
              </Button>
            </Link>
          )}
          {canManageUsers(role) && (
            <Button variant="danger" onClick={remove}>
              <Trash2 size={16} /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Dealer</h2>
            <Badge tone={inv.status === "invoiced" ? "green" : undefined}>{inv.status}</Badge>
          </div>
          <p className="mt-2 font-semibold">{c?.customer_name}</p>
          <p className="text-sm text-slate-600">{c?.company_name}</p>
          <p className="text-sm">{c?.billing_address}</p>
          <p className="text-sm">
            {c?.city}, {c?.state} – {c?.pincode}
          </p>
          <p className="text-sm">GSTIN: {c?.gst_no || "—"} · {c?.mobile}</p>
          {c?.mobile && (
            <a
              className="mt-2 inline-flex text-sm font-semibold text-emerald-600"
              href={`https://wa.me/91${c.mobile.replace(/\D/g, "").slice(-10)}`}
              target="_blank"
            >
              Customer WhatsApp
            </a>
          )}
        </div>
        <div className="rounded-2xl bg-navy p-5 text-white shadow-card">
          <p className="text-sm text-blue-100">Grand Total</p>
          <p className="text-3xl font-extrabold">{formatINR(Number(inv.grand_total))}</p>
          <p className="mt-2 text-xs text-blue-200">{inv.is_interstate ? "IGST applied" : "CGST + SGST applied"}</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3">Sr</th>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">HSN</th>
              <th className="px-3 py-3">Qty</th>
              <th className="px-3 py-3">Rate</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">GST</th>
              <th className="px-3 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it, i) => (
              <tr key={i} className="border-t">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{it.product_name}</td>
                <td className="px-3 py-2">{it.hsn_code}</td>
                <td className="px-3 py-2">
                  {it.qty} {it.unit}
                </td>
                <td className="px-3 py-2">{formatINR(Number(it.rate))}</td>
                <td className="px-3 py-2">{formatINR(Number(it.amount))}</td>
                <td className="px-3 py-2">{it.gst}%</td>
                <td className="px-3 py-2 font-semibold">{formatINR(Number(it.total_amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <h3 className="mb-3 font-bold">Send Email</h3>
          <Label>To</Label>
          <Input value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
          <Label className="mt-3">Message / template</Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Leave blank to use company email template" />
          <Button className="mt-3" onClick={sendEmail}>
            <Mail size={16} /> Send PI PDF
          </Button>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card text-sm">
          <h3 className="mb-3 font-bold">Tax Summary</h3>
          <p>Sub Total: {formatINR(Number(inv.subtotal))}</p>
          <p>Freight: {formatINR(Number(inv.freight_charges))}</p>
          <p>Packing: {formatINR(Number(inv.packing_charges))}</p>
          <p>Discount: {formatINR(Number(inv.discount))}</p>
          <p>CGST: {formatINR(Number(inv.cgst_amount))}</p>
          <p>SGST: {formatINR(Number(inv.sgst_amount))}</p>
          <p>IGST: {formatINR(Number(inv.igst_amount))}</p>
          {inv.notes && <p className="mt-3 text-slate-500">Notes: {inv.notes}</p>}
        </div>
      </div>

      {inv.terms && (
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <h3 className="mb-3 font-bold text-navy">Terms and Conditions</h3>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">{inv.terms}</pre>
        </div>
      )}

      <div className="table-wrap">
        <div className="px-5 py-4">
          <h3 className="font-bold text-navy">Send history</h3>
          <p className="text-xs text-slate-500">Who sent this PI, to whom, and when</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Channel</th>
              <th className="px-5 py-3">Sent to</th>
              <th className="px-5 py-3">Sent by</th>
            </tr>
          </thead>
          <tbody>
            {(inv.dispatches || []).map((d) => (
              <tr key={d.id} className="border-t">
                <td className="px-5 py-2">{formatDateTime(d.sent_at)}</td>
                <td className="px-5 py-2 capitalize">{d.channel}</td>
                <td className="px-5 py-2">{d.recipient || "—"}</td>
                <td className="px-5 py-2">{d.sent_by_name || "—"}</td>
              </tr>
            ))}
            {!inv.dispatches?.length && (
              <tr>
                <td className="px-5 py-4 text-slate-400" colSpan={4}>
                  Not sent yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
