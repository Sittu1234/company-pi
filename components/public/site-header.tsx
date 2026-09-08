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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A2540]/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="/kalpna-logo.jpg" alt="Kalpna Traders" className="h-11 w-11 rounded-xl bg-white object-contain p-0.5" />
          <div className="leading-tight">
            <p className="text-sm font-extrabold tracking-wide">Kalpna Traders</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-amber-300">Trust · Quality · Growth</p>
          </div>
        </Link>
        <nav className="ml-6 hidden items-center gap-6 text-sm font-semibold text-blue-100 md:flex">
          <a href="#about" className="hover:text-white">
            About
          </a>
          <a href="#products" className="hover:text-white">
            Products
          </a>
          <a href="#calendar" className="hover:text-white">
            Calendar
          </a>
          <a href="#contact" className="hover:text-white">
            Contact
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-electric px-4 text-sm font-semibold text-white hover:bg-electric-700"
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          ) : (
            <div ref={box} className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#C9A227] px-4 text-sm font-extrabold text-navy hover:bg-amber-400"
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
                      className="block px-4 py-2.5 hover:bg-slate-50"
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
          <button type="button" className="rounded-lg p-2 md:hidden" onClick={() => setMenu((v) => !v)}>
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {menu && (
        <div className="border-t border-white/10 px-4 py-3 text-sm font-semibold md:hidden">
          <a href="#about" className="block py-2" onClick={() => setMenu(false)}>
            About
          </a>
          <a href="#products" className="block py-2" onClick={() => setMenu(false)}>
            Products
          </a>
          <a href="#calendar" className="block py-2" onClick={() => setMenu(false)}>
            Calendar
          </a>
          <a href="#contact" className="block py-2" onClick={() => setMenu(false)}>
            Contact
          </a>
        </div>
      )}
    </header>
  );
}
