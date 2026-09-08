"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { canWriteInvoices, getStoredUser } from "@/lib/auth";
import { addDaysISO, cn, formatINR, todayISO } from "@/lib/utils";
import type { CompanySettings, Customer, Invoice, Product } from "@/lib/types";

type Line = {
  product: number | "";
  product_name: string;
  hsn_code: string;
  unit: string;
  qty: number;
  rate: number;
  gst: number;
};

const emptyLine = (): Line => ({
  product: "",
  product_name: "",
  hsn_code: "",
  unit: "PCS",
  qty: 1,
  rate: 0,
  gst: 18,
});

type PiKind = "battery" | "ev_scooter" | "both";

const KIND_OPTIONS: { value: PiKind; label: string; hint: string }[] = [
  { value: "battery", label: "Battery", hint: "Lithium / LED battery T&C" },
  { value: "ev_scooter", label: "EV Scooter", hint: "Scooter T&C" },
  { value: "both", label: "Both", hint: "Battery + scooter T&C" },
];

function lineAmount(l: Line) {
  const amt = Number(l.qty || 0) * Number(l.rate || 0);
  const gstAmt = amt * (Number(l.gst || 0) / 100);
  return { amt, gstAmt, total: amt + gstAmt };
}

export function InvoiceForm({ invoiceId, dealerId }: { invoiceId?: string; dealerId?: string }) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [piNumber, setPiNumber] = useState("PI-AUTO");
  const [piDate, setPiDate] = useState(todayISO());
  const [validTill, setValidTill] = useState(addDaysISO(15));
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("draft");
  const [freight, setFreight] = useState(0);
  const [packing, setPacking] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [piKind, setPiKind] = useState<PiKind | "">("");
  const [termTemplates, setTermTemplates] = useState<Record<string, string>>({});
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [taxInvoiceNumber, setTaxInvoiceNumber] = useState("");
  const [taxInvoiceDate, setTaxInvoiceDate] = useState("");

  const customer = customers.find((c) => String(c.id) === customerId);

  useEffect(() => {
    if (!canWriteInvoices(getStoredUser()?.role)) {
      router.replace(invoiceId ? `/invoices/${invoiceId}` : "/invoices");
    }
  }, [invoiceId, router]);

  useEffect(() => {
    api<Customer[]>("/api/customers/lookup/?party_type=dealer").then((rows) => {
      setCustomers(rows);
      if (!invoiceId && dealerId) setCustomerId(dealerId);
    });
    api<{ results?: Product[] } | Product[]>("/api/products/?page_size=200").then((d) =>
      setProducts(Array.isArray(d) ? d : d.results || [])
    );
    api<CompanySettings>("/api/company/settings/").then(setCompany);
    api<{ templates: Record<string, string> }>("/api/company/pi-terms/").then((d) => {
      setTermTemplates(d.templates || {});
    });
    if (!invoiceId) {
      api<{ pi_number: string }>("/api/invoices/next_number/").then((d) => setPiNumber(d.pi_number));
    } else {
      api<Invoice>(`/api/invoices/${invoiceId}/`).then((inv) => {
        setPiNumber(inv.pi_number);
        setPiDate(inv.pi_date);
        setValidTill(inv.valid_till || "");
        setCustomerId(String(inv.customer));
        setStatus(inv.status);
        setFreight(Number(inv.freight_charges));
        setPacking(Number(inv.packing_charges));
        setDiscount(Number(inv.discount));
        setNotes(inv.notes || "");
        setTerms(inv.terms || "");
        setPiKind((inv.pi_kind as PiKind) || "battery");
        setTaxInvoiceNumber(inv.tax_invoice_number || "");
        setTaxInvoiceDate(inv.tax_invoice_date || "");
        setLines(
          inv.items.map((i) => ({
            product: i.product || "",
            product_name: i.product_name,
            hsn_code: i.hsn_code,
            unit: i.unit,
            qty: Number(i.qty),
            rate: Number(i.rate),
            gst: Number(i.gst),
          }))
        );
      });
    }
  }, [invoiceId, dealerId]);

  useEffect(() => {
    if (invoiceId || !piKind || terms) return;
    const next = termTemplates[piKind];
    if (next) setTerms(next);
  }, [termTemplates, piKind, invoiceId, terms]);

  const interstate = useMemo(() => {
    if (!company || !customer) return false;
    return (company.state || "").toLowerCase() !== (customer.state || "").toLowerCase();
  }, [company, customer]);

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + lineAmount(l).amt, 0);
    const itemGst = lines.reduce((s, l) => s + lineAmount(l).gstAmt, 0);
    const extraGst = ((freight + packing) * Number(company?.default_gst || 18)) / 100;
    const gst = itemGst + extraGst;
    const taxable = Math.max(0, subtotal + freight + packing - discount);
    const grand = taxable + gst;
    return { subtotal, gst, grand, extraGst };
  }, [lines, freight, packing, discount, company]);

  function pickProduct(index: number, pid: string) {
    const p = products.find((x) => String(x.id) === pid);
    setLines((rows) =>
      rows.map((r, i) =>
        i === index
          ? {
              product: Number(pid),
              product_name: p?.product_name || r.product_name,
              hsn_code: p?.hsn_code || "",
              unit: p?.unit || "PCS",
              qty: r.qty || 1,
              rate: Number(p?.price || 0),
              gst: Number(p?.gst || 18),
            }
          : r
      )
    );
  }

  function applyKind(kind: PiKind) {
    setPiKind(kind);
    const next = termTemplates[kind];
    if (next) setTerms(next);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!customerId) {
      toast.error("Select a dealer");
      return;
    }
    if (!piKind) {
      toast.error("Select Battery, EV Scooter or Both");
      return;
    }
    const payload = {
      customer: Number(customerId),
      pi_date: piDate,
      valid_till: validTill || null,
      status,
      freight_charges: freight,
      packing_charges: packing,
      discount,
      notes,
      terms,
      pi_kind: piKind,
      tax_invoice_number: taxInvoiceNumber.trim() || null,
      tax_invoice_date: taxInvoiceDate || null,
      items_data: lines
        .filter((l) => l.product_name || l.product)
        .map((l) => ({
          product: l.product || null,
          product_name: l.product_name,
          hsn_code: l.hsn_code,
          unit: l.unit,
          qty: l.qty,
          rate: l.rate,
          gst: l.gst,
        })),
    };
    try {
      const saved = invoiceId
        ? await api<Invoice>(`/api/invoices/${invoiceId}/`, { method: "PUT", body: JSON.stringify(payload) })
        : await api<Invoice>("/api/invoices/", { method: "POST", body: JSON.stringify(payload) });
      toast.success(`Saved ${saved.pi_number}`);
      router.push(`/invoices/${saved.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">
            {invoiceId ? "Edit Proforma Invoice" : "New Proforma Invoice"}
          </h1>
          <p className="text-sm text-slate-500">Auto number · GST split · live totals</p>
        </div>
        <Button type="submit">Save PI</Button>
      </div>

      <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-card md:grid-cols-4">
        <div>
          <Label>PI Number</Label>
          <Input value={piNumber} readOnly className="bg-slate-50 font-semibold" />
        </div>
        <div>
          <Label>PI Date</Label>
          <Input type="date" value={piDate} onChange={(e) => setPiDate(e.target.value)} />
        </div>
        <div>
          <Label>Valid Till</Label>
          <Input type="date" value={validTill} onChange={(e) => setValidTill(e.target.value)} />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="invoiced">Tax Invoice</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
        {invoiceId && (
          <>
            <div>
              <Label>Tax Invoice Number</Label>
              <Input
                value={taxInvoiceNumber}
                onChange={(e) => setTaxInvoiceNumber(e.target.value)}
                placeholder="INV-2026-0004"
                className="font-semibold"
              />
            </div>
            <div>
              <Label>Tax Invoice Date</Label>
              <Input type="date" value={taxInvoiceDate} onChange={(e) => setTaxInvoiceDate(e.target.value)} />
            </div>
          </>
        )}
        <div className="md:col-span-2">
          <Label>Dealer *</Label>
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
            <option value="">Select your dealer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customer_name} {c.company_name ? `– ${c.company_name}` : ""}
              </option>
            ))}
          </Select>
          {!customers.length && (
            <p className="mt-2 text-xs text-slate-500">
              No dealers yet.{" "}
              <Link href="/dealers/new" className="font-semibold text-electric">
                Add a dealer first
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <p className="text-sm font-bold text-navy">This PI is for *</p>
        <p className="mt-1 text-xs text-slate-500">
          Terms and conditions are filled from the official quotation. You can edit them below.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {KIND_OPTIONS.map((opt) => {
            const active = piKind === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => applyKind(opt.value)}
                className={cn(
                  "rounded-2xl border px-4 py-4 text-left transition",
                  active
                    ? "border-electric bg-electric-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-electric/40"
                )}
              >
                <p className={cn("text-base font-extrabold", active ? "text-electric" : "text-navy")}>{opt.label}</p>
                <p className="mt-1 text-xs text-slate-500">{opt.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      {customer && (
        <div className="grid gap-4 rounded-2xl border border-electric-100 bg-electric-50 p-5 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-electric">Auto-fetched details</p>
            <p className="mt-1 font-bold">{customer.company_name || customer.customer_name}</p>
            <p className="text-sm">{customer.billing_address}</p>
          </div>
          <div className="text-sm">
            <p>GSTIN: {customer.gst_no || "—"}</p>
            <p>
              {customer.city}, {customer.state} – {customer.pincode}
            </p>
            <p>Mobile: {customer.mobile}</p>
          </div>
          <div className="text-sm">
            <p>Contact: {customer.contact_person || "—"}</p>
            <p>Email: {customer.email || "—"}</p>
            <p className="font-semibold text-navy">{interstate ? "IGST (Inter-state)" : "CGST + SGST (Intra-state)"}</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-navy text-xs uppercase text-white">
            <tr>
              <th className="px-2 py-3">Sr</th>
              <th className="px-2 py-3 text-left">Product</th>
              <th className="px-2 py-3">HSN</th>
              <th className="px-2 py-3">Qty</th>
              <th className="px-2 py-3">Unit</th>
              <th className="px-2 py-3">Rate</th>
              <th className="px-2 py-3">Amount</th>
              <th className="px-2 py-3">GST %</th>
              <th className="px-2 py-3">GST Amt</th>
              <th className="px-2 py-3">Total</th>
              <th className="px-2 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => {
              const calc = lineAmount(l);
              return (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-2 py-2 text-center">{i + 1}</td>
                  <td className="px-2 py-2">
                    <Select value={String(l.product)} onChange={(e) => pickProduct(i, e.target.value)}>
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.product_name}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-2 py-2">
                    <Input value={l.hsn_code} onChange={(e) => setLines((r) => r.map((x, n) => (n === i ? { ...x, hsn_code: e.target.value } : x)))} />
                  </td>
                  <td className="px-2 py-2 w-24">
                    <Input type="number" step="0.001" value={l.qty} onChange={(e) => setLines((r) => r.map((x, n) => (n === i ? { ...x, qty: Number(e.target.value) } : x)))} />
                  </td>
                  <td className="px-2 py-2 w-20">
                    <Input value={l.unit} onChange={(e) => setLines((r) => r.map((x, n) => (n === i ? { ...x, unit: e.target.value } : x)))} />
                  </td>
                  <td className="px-2 py-2 w-28">
                    <Input type="number" step="0.01" value={l.rate} onChange={(e) => setLines((r) => r.map((x, n) => (n === i ? { ...x, rate: Number(e.target.value) } : x)))} />
                  </td>
                  <td className="px-2 py-2 text-right font-medium">{calc.amt.toFixed(2)}</td>
                  <td className="px-2 py-2 w-20">
                    <Input type="number" value={l.gst} onChange={(e) => setLines((r) => r.map((x, n) => (n === i ? { ...x, gst: Number(e.target.value) } : x)))} />
                  </td>
                  <td className="px-2 py-2 text-right">{calc.gstAmt.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-semibold">{calc.total.toFixed(2)}</td>
                  <td className="px-2 py-2">
                    <Button type="button" size="icon" variant="ghost" onClick={() => setLines((r) => r.filter((_, n) => n !== i || r.length === 1))}>
                      <Trash2 size={16} className="text-rose-600" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="p-3">
          <Button type="button" variant="outline" onClick={() => setLines((r) => [...r, emptyLine()])}>
            <Plus size={16} /> Add line
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl bg-white p-6 shadow-card">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Freight</Label>
              <Input type="number" step="0.01" value={freight} onChange={(e) => setFreight(Number(e.target.value))} />
            </div>
            <div>
              <Label>Packing</Label>
              <Input type="number" step="0.01" value={packing} onChange={(e) => setPacking(Number(e.target.value))} />
            </div>
            <div>
              <Label>Discount</Label>
              <Input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <div className="rounded-2xl bg-navy p-6 text-white shadow-card">
          <h3 className="font-bold">Tax Summary</h3>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Sub Total" value={formatINR(totals.subtotal)} />
            <Row label="Freight + Packing" value={formatINR(freight + packing)} />
            <Row label="Discount" value={`- ${formatINR(discount)}`} />
            {interstate ? (
              <Row label="IGST" value={formatINR(totals.gst)} />
            ) : (
              <>
                <Row label="CGST" value={formatINR(totals.gst / 2)} />
                <Row label="SGST" value={formatINR(totals.gst / 2)} />
              </>
            )}
            <div className="mt-3 flex items-center justify-between rounded-xl bg-electric px-4 py-3 text-lg font-extrabold">
              <span>Grand Total</span>
              <span>{formatINR(totals.grand)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-navy">Terms and Conditions</h2>
            <p className="text-xs text-slate-500">
              {piKind
                ? `This text is printed on PDF page 2 (${KIND_OPTIONS.find((k) => k.value === piKind)?.label}). You can edit it.`
                : "Select Battery, EV Scooter or Both to load the terms."}
            </p>
          </div>
          {piKind && termTemplates[piKind] && (
            <Button type="button" variant="outline" onClick={() => setTerms(termTemplates[piKind])}>
              Reset to default
            </Button>
          )}
        </div>
        <Textarea
          className="mt-3 min-h-[280px] font-mono text-xs leading-5"
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder="Select Battery / EV Scooter / Both to load terms"
        />
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-blue-100">
      <span>{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
