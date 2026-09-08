"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { getStoredUser } from "@/lib/auth";

const ROLES = [
  { id: "admin", label: "Admin", hint: "Full company ERP" },
  { id: "sales", label: "Sales", hint: "Dealers & quotations" },
  { id: "accountant", label: "Accountant", hint: "PIs, GST & reports" },
] as const;

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#products", label: "Products" },
  { href: "#careers", label: "Careers" },
  { href: "#calendar", label: "Calendar" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoggedIn(Boolean(getStoredUser()));
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#C9A227]/30 bg-[#0A2540]/95 text-white shadow-lg backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-[0_0_0_1px_rgba(201,162,39,0.55)] md:h-[88px] md:w-[88px]">
            <img src="/kalpna-header.png" alt="Kalpna Traders" className="h-full w-full object-contain" />
          </span>
          <div className="leading-tight">
            <p className="text-base font-extrabold tracking-wide md:text-xl">Kalpna Traders</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#E8C547]">Trust · Quality · Growth</p>
          </div>
        </Link>
        <nav className="ml-2 hidden items-center gap-5 text-sm font-semibold text-blue-100 lg:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-[#E8C547]">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-electric px-4 text-sm font-semibold text-white hover:bg-electric-700"
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          ) : (
            <div ref={box} className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#C9A227] px-5 text-sm font-extrabold text-navy shadow-md hover:bg-[#E8C547]"
              >
                <LogIn size={16} /> Login <ChevronDown size={14} />
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl bg-white py-2 text-navy shadow-card">
                  <p className="px-4 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Login as
                  </p>
                  {ROLES.map((r) => (
                    <Link
                      key={r.id}
                      href={`/login?role=${r.id}`}
                      className="block px-4 py-2.5 hover:bg-amber-50"
                      onClick={() => setOpen(false)}
                    >
                      <p className="text-sm font-extrabold">{r.label}</p>
                      <p className="text-xs text-slate-500">{r.hint}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          <button type="button" className="rounded-lg p-2 lg:hidden" onClick={() => setMenu((v) => !v)}>
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {menu && (
        <div className="border-t border-white/10 px-4 py-3 text-sm font-semibold lg:hidden">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="block py-2" onClick={() => setMenu(false)}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
