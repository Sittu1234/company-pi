"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InvoiceForm } from "@/components/invoices/invoice-form";

function NewInvoiceInner() {
  const sp = useSearchParams();
  return <InvoiceForm dealerId={sp.get("dealer") || undefined} />;
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading PI form…</p>}>
      <NewInvoiceInner />
    </Suspense>
  );
}
