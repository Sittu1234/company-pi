"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BatteryCharging,
  Building2,
  Cake,
  CalendarDays,
  Landmark,
  MapPin,
  PartyPopper,
  Phone,
  Sparkles,
  Umbrella,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { CompanyEvent, CompanyEventKind, PublicCompany } from "@/lib/types";
import { SiteHeader } from "@/components/public/site-header";

const FALLBACK_COMPANY: PublicCompany = {
  company_name: "Kalpna Traders",
  tagline: "TRUST • QUALITY • GROWTH",
  address: "C-77, Sector-63A, Chautpur",
  city: "Noida",
  state: "Uttar Pradesh",
  pincode: "201306",
  phone: "9289975453",
  email: "hrbp@kalpanatraders.com",
  website: "https://www.kalpanatraders.com",
  gst_number: "09BUUPK1450R1ZQ",
};

const KIND_META: Record<
  CompanyEventKind,
  { label: string; icon: typeof Cake; tone: string; chip: string }
> = {
  event: { label: "Events", icon: Sparkles, tone: "bg-electric-50 text-electric", chip: "border-electric text-electric" },
  birthday: { label: "Birthdays", icon: Cake, tone: "bg-rose-50 text-rose-700", chip: "border-rose-400 text-rose-700" },
  festival: { label: "Festivals", icon: PartyPopper, tone: "bg-amber-50 text-amber-800", chip: "border-amber-400 text-amber-800" },
  holiday: { label: "Holidays", icon: Umbrella, tone: "bg-emerald-50 text-emerald-800", chip: "border-emerald-400 text-emerald-800" },
};

export function CompanyHome() {
  const [company, setCompany] = useState<PublicCompany>(FALLBACK_COMPANY);
  const [events, setEvents] = useState<CompanyEvent[]>([]);
  const [filter, setFilter] = useState<"all" | CompanyEventKind>("all");

  useEffect(() => {
    api<PublicCompany>("/api/company/public/", { auth: false }).then(setCompany).catch(() => {});
    api<CompanyEvent[]>("/api/company/events/?upcoming=1", { auth: false })
      .then((d) => setEvents(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const shown = useMemo(
    () => (filter === "all" ? events : events.filter((e) => e.kind === filter)),
    [events, filter]
  );

  const addr = [company.address, company.city, company.state, company.pincode].filter(Boolean).join(", ");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-navy">
      <SiteHeader />

      <section className="erp-gradient relative overflow-hidden text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#C9A227]/20 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">National channel partner · SPARS Electric</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl">{company.company_name}</h1>
            <p className="mt-3 text-lg text-blue-100">{company.tagline || "TRUST • QUALITY • GROWTH"}</p>
            <p className="mt-5 max-w-lg text-blue-100">
              EV scooters, lithium battery packs and LED batteries — quotations, tax invoices and dealer support from one team in Noida.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#calendar" className="inline-flex h-11 items-center rounded-lg bg-[#C9A227] px-5 text-sm font-extrabold text-navy">
                Company calendar
              </a>
              <a href="#contact" className="inline-flex h-11 items-center rounded-lg border border-white/30 px-5 text-sm font-semibold">
                Contact HR / office
              </a>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Zap, title: "EV Scooter", text: "Range, RTO-ready quotes" },
              { icon: BatteryCharging, title: "Lithium Battery", text: "Custom packs & BMS" },
              { icon: Sparkles, title: "LED Battery", text: "Inverter / solar range" },
              { icon: Landmark, title: "GST ready", text: "PI to tax invoice" },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <c.icon className="text-amber-300" size={22} />
                <p className="mt-3 font-extrabold">{c.title}</p>
                <p className="text-sm text-blue-100">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-electric">About the company</p>
            <h2 className="mt-2 text-3xl font-extrabold">Trading desk built around people and products</h2>
            <p className="mt-4 text-slate-600">
              Kalpna Traders is the commercial face of SPARS Electric in North India. The office calendar below is what the team lives by — dealer meets, birthdays, festivals and public holidays.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-card">
            <p className="flex items-start gap-2 text-sm text-slate-600">
              <Building2 size={16} className="mt-0.5 text-electric" /> GSTIN {company.gst_number || "—"}
            </p>
            <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
              <MapPin size={16} className="mt-0.5 text-electric" /> {addr || "Noida"}
            </p>
            <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
              <Phone size={16} className="mt-0.5 text-electric" /> {company.phone}
            </p>
          </div>
        </div>
      </section>

      <section id="products" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-3xl font-extrabold">What we quote every day</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { title: "EV Scooter", body: "Models, battery options and RTO notes on one quotation." },
              { title: "Lithium packs", body: "Voltage, Ah, BMS and connector as per signed spec." },
              { title: "LED / inverter", body: "Stock range with HSN, GST and dealer price list." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border border-slate-100 bg-[#F6F3EC] p-6">
                <p className="text-lg font-extrabold">{p.title}</p>
                <p className="mt-2 text-sm text-slate-600">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="calendar" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-electric">Company life</p>
            <h2 className="mt-2 text-3xl font-extrabold">Events, birthdays, festivals &amp; holidays</h2>
            <p className="mt-2 text-slate-600">Jo office mein chal raha hai — meet, cake, tyohar aur chhutti — yahin dikhega.</p>
          </div>
          <CalendarDays className="text-electric" />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full border px-4 py-1.5 text-xs font-bold ${filter === "all" ? "border-navy bg-navy text-white" : "border-slate-200 bg-white text-slate-600"}`}
          >
            All
          </button>
          {(Object.keys(KIND_META) as CompanyEventKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold ${filter === k ? KIND_META[k].chip + " bg-white" : "border-slate-200 bg-white text-slate-600"}`}
            >
              {KIND_META[k].label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((e) => {
            const meta = KIND_META[e.kind] || KIND_META.event;
            const Icon = meta.icon;
            const isToday = e.date === today;
            return (
              <article key={e.id} className="rounded-2xl bg-white p-5 shadow-card">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.tone}`}>
                    <Icon size={12} /> {meta.label.slice(0, -1)}
                  </span>
                  {isToday && <span className="text-[11px] font-extrabold text-electric">TODAY</span>}
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{formatDate(e.date)}</p>
                <h3 className="mt-1 text-lg font-extrabold">{e.title}</h3>
                {e.description && <p className="mt-2 text-sm text-slate-600">{e.description}</p>}
              </article>
            );
          })}
          {!shown.length && (
            <p className="col-span-full rounded-2xl bg-white p-8 text-center text-slate-500 shadow-card">
              Is filter mein agla item nahi hai. Admin calendar se naya event add kar sakte hain.
            </p>
          )}
        </div>
      </section>

      <footer id="contact" className="erp-gradient text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
          <div>
            <p className="text-lg font-extrabold">{company.company_name}</p>
            <p className="mt-1 text-sm text-amber-300">{company.tagline}</p>
          </div>
          <div className="text-sm text-blue-100">
            <p>{addr}</p>
            <p className="mt-2">{company.phone}</p>
            <p>{company.email}</p>
          </div>
          <div className="text-sm text-blue-100">
            <p>Staff login: header se Admin, Sales ya Accountant choose karo.</p>
            <p className="mt-4 text-xs text-blue-200">© {new Date().getFullYear()} {company.company_name}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
