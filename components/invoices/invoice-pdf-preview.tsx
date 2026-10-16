"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Eye, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ApiError, api, downloadFile, fetchPdfBlob } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import type { Invoice } from "@/lib/types";

type Kind = "pi" | "tax";

function itemsPayload(invoice: Invoice, remarks: string[]) {
  return invoice.items.map((it, i) => ({
    product: it.product || null,
    product_name: it.product_name,
    remark: (remarks[i] || "").trim(),
    hsn_code: it.hsn_code,
    unit: it.unit,
    qty: it.qty,
    rate: it.rate,
    gst: it.gst,
  }));
}

export function InvoicePdfPreview({
  invoice,
  kind,
  canCustomize,
  onClose,
  onUpdated,
}: {
  invoice: Invoice;
  kind: Kind;
  canCustomize: boolean;
  onClose: () => void;
  onUpdated: (inv: Invoice) => void;
}) {
  const isTax = kind === "tax";
  const [discountPercent, setDiscountPercent] = useState(String(invoice.discount_percent ?? "0"));
  const [notes, setNotes] = useState(invoice.notes || "");
  const [includeProposal, setIncludeProposal] = useState(Boolean(invoice.include_proposal));
  const [proposalNote, setProposalNote] = useState(invoice.proposal_note || "");
  const [remarks, setRemarks] = useState(invoice.items.map((it) => it.remark || ""));
  const [taxNo, setTaxNo] = useState(invoice.tax_invoice_number || "");
  const [taxDate, setTaxDate] = useState(invoice.tax_invoice_date || "");
  const [advance, setAdvance] = useState(String(invoice.advance_received ?? "0"));
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [saving, setSaving] = useState(false);

  const invoiceAmount = Number(invoice.grand_total || 0);
  const remaining = Math.max(0, invoiceAmount - Number(advance || 0));
  const discountBase =
    Number(invoice.subtotal || 0) + Number(invoice.freight_charges || 0) + Number(invoice.packing_charges || 0);
  const discountAmt = Math.max(0, (discountBase * Number(discountPercent || 0)) / 100);
  const pdfPath = (() => {
    const p = new URLSearchParams({ inline: "1" });
    if (isTax) p.set("kind", "tax");
    if (!isTax && includeProposal) p.set("proposal", "1");
    return `/api/invoices/${invoice.id}/pdf/?${p.toString()}`;
  })();
  const downloadPath = (() => {
    const p = new URLSearchParams();
    if (isTax) p.set("kind", "tax");
    if (!isTax && includeProposal) p.set("proposal", "1");
    const q = p.toString();
    return `/api/invoices/${invoice.id}/pdf/${q ? `?${q}` : ""}`;
  })();
  const filename = isTax ? `${invoice.tax_invoice_number || "tax-invoice"}.pdf` : `${invoice.pi_number}.pdf`;

  const loadPdf = useCallback(async () => {
    setLoadingPdf(true);
    try {
      const blob = await fetchPdfBlob(pdfPath);
      const url = URL.createObjectURL(blob);
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not load PDF preview");
    } finally {
      setLoadingPdf(false);
    }
  }, [pdfPath]);

  useEffect(() => {
    loadPdf();
    return () => {
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [loadPdf]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dirtyHint = useMemo(
    () => "Save first to refresh the preview, then download.",
    []
  );

  async function saveCustomise() {
    if (!canCustomize) return true;
    if (Number(discountPercent || 0) < 0 || Number(discountPercent || 0) > 100) {
      toast.error("Discount must be between 0 and 100%");
      return false;
    }
    if (isTax && Number(advance || 0) > invoiceAmount) {
      toast.error("Advance cannot be more than the invoice amount");
      return false;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        discount_percent: Number(discountPercent || 0),
        discount: Number(discountPercent || 0),
        notes,
        include_proposal: includeProposal,
        proposal_note: proposalNote,
        items_data: itemsPayload(invoice, remarks),
      };
      if (isTax) {
        payload.tax_invoice_number = taxNo.trim() || null;
        payload.tax_invoice_date = taxDate || null;
        payload.advance_received = Number(advance || 0);
      }
      const saved = await api<Invoice>(`/api/invoices/${invoice.id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      onUpdated(saved);
      toast.success("PDF details saved");
      await loadPdf();
      return true;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveAndDownload() {
    if (canCustomize) {
      const ok = await saveCustomise();
      if (!ok) return;
    }
    await downloadFile(downloadPath, filename);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch bg-black/60 p-2 sm:p-4">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row">
        <aside className="flex max-h-[46%] w-full shrink-0 flex-col border-b border-slate-200 bg-slate-50 md:max-h-none md:w-[380px] md:border-b-0 md:border-r">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-electric">
                {isTax ? "Tax Invoice" : "Quotation"} preview
              </p>
              <h2 className="text-lg font-extrabold text-navy">
                {isTax ? invoice.tax_invoice_number : invoice.pi_number}
              </h2>
              <p className="mt-1 text-xs text-slate-500">{dirtyHint}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {canCustomize ? (
              <>
                <div>
                  <Label>Discount percent (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="font-semibold"
                    />
                    <span className="text-sm font-bold text-navy">%</span>
                  </div>
                  <div className="mt-2 rounded-xl bg-navy px-3 py-2 text-white">
                    <p className="text-xs text-blue-100">Discount {Number(discountPercent || 0)}%</p>
                    <p className="text-lg font-extrabold">− {formatINR(discountAmt)}</p>
                  </div>
                </div>
                <div>
                  <Label>Extra note on PDF</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Battery included, charger free, special offer…"
                  />
                </div>
                {!isTax && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={includeProposal}
                        onChange={(e) => setIncludeProposal(e.target.checked)}
                      />
                      <span>
                        <span className="block text-sm font-semibold text-navy">Include business proposal</span>
                        <span className="text-xs text-slate-500">Adds a proposal page in this quotation PDF.</span>
                      </span>
                    </label>
                    {includeProposal && (
                      <div className="mt-3">
                        <Label>Extra proposal note</Label>
                        <Textarea
                          value={proposalNote}
                          onChange={(e) => setProposalNote(e.target.value)}
                          placeholder="Optional note for this dealer…"
                        />
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <Label>Item extra text</Label>
                  <p className="mb-2 text-xs text-slate-500">Printed under the product name, e.g. Charger free.</p>
                  <div className="space-y-2">
                    {invoice.items.map((it, i) => (
                      <div key={it.id || i} className="rounded-xl border border-slate-200 bg-white p-2.5">
                        <p className="mb-1 truncate text-xs font-semibold text-navy">{it.product_name}</p>
                        <Input
                          value={remarks[i] || ""}
                          onChange={(e) =>
                            setRemarks((rows) => rows.map((r, n) => (n === i ? e.target.value : r)))
                          }
                          placeholder="Charger free / Battery included"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {isTax && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label>Tax Invoice Number</Label>
                      <Input value={taxNo} onChange={(e) => setTaxNo(e.target.value)} />
                    </div>
                    <div>
                      <Label>Invoice Date</Label>
                      <Input type="date" value={taxDate} onChange={(e) => setTaxDate(e.target.value)} />
                    </div>
                    <div>
                      <Label>Advance Received</Label>
                      <Input type="number" min={0} step="0.01" value={advance} onChange={(e) => setAdvance(e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <Label>Remaining</Label>
                      <Input value={formatINR(remaining)} readOnly className="bg-white font-semibold" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-600">Preview the PDF, then download or print.</p>
            )}
          </div>
          <div className="space-y-2 border-t border-slate-200 bg-white px-5 py-4">
            {canCustomize && (
              <Button type="button" className="w-full" onClick={saveCustomise} disabled={saving}>
                <RefreshCw size={16} /> {saving ? "Saving…" : "Save & refresh preview"}
              </Button>
            )}
            <Button type="button" variant="navy" className="w-full" onClick={saveAndDownload} disabled={saving}>
              <Download size={16} /> Download PDF
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </aside>
        <div className="relative min-h-0 min-w-0 flex-1 bg-slate-800">
          {loadingPdf && (
            <p className="absolute inset-0 z-10 flex items-center justify-center text-sm text-white/80">Loading preview…</p>
          )}
          {pdfUrl ? (
            <iframe title="Invoice PDF preview" src={pdfUrl} className="h-full w-full border-0 bg-white" />
          ) : (
            <div className="flex h-full items-center justify-center text-white/70">
              <Eye size={20} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
