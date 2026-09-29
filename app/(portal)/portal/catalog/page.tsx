"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import type { CatalogPdf, Product } from "@/lib/types";

export default function PortalCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<CatalogPdf[]>([]);
  useEffect(() => {
    api<Product[]>("/api/erp/portal/products/").then(setProducts);
    api<CatalogPdf[]>("/api/erp/portal/catalogs/").then(setCatalogs);
  }, []);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Products & Catalog</h1>
      <div className="flex flex-wrap gap-2">
        {catalogs.map((c) => (
          <a key={c.id} className="rounded-lg bg-electric px-3 py-2 text-sm font-semibold text-white" href={c.file_url || c.file} target="_blank">
            {c.title}
          </a>
        ))}
      </div>
      <div className="table-wrap">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">MRP</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2 font-mono">{p.product_code}</td>
                <td className="px-4 py-2">{p.product_name}</td>
                <td className="px-4 py-2">{formatINR(p.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
