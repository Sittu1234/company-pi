"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Cake, CalendarDays, MapPin, PartyPopper, Phone, Sparkles, Umbrella } from "lucide-react";
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

const PRODUCTS = [
  {
    title: "EV Scooter",
    body: "Models, battery options and RTO-ready quotations from one desk.",
    image: "/home/ev-scooter.jpg",
  },
  {
    title: "Lithium packs",
    body: "Voltage, Ah, BMS and connector as per the signed specification.",
    image: "/home/lithium-battery.jpg",
  },
  {
    title: "LED / inverter",
    body: "Stock range with HSN, GST and dealer price list support.",
    image: "/home/led-battery.jpg",
  },
];

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
    <div className="min-h-screen bg-[#F4EFE4] text-navy">
      <SiteHeader />

      <section className="relative min-h-[78vh] overflow-hidden text-white">
        <img
          src="/home/hero-showroom.jpg"
          alt="Kalpna Traders showroom"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061526]/95 via-[#0A2540]/82 to-[#0A2540]/35" />
        <div className="absolute -right-10 top-10 h-64 w-64 rounded-full bg-[#C9A227]/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-4 rounded-3xl bg-white p-2.5 pr-5 shadow-xl ring-1 ring-[#C9A227]/40">
              <img src="/kalpna-header.png" alt="Kalpna Traders logo" className="h-28 w-28 rounded-2xl object-contain" />
              <div>
                <p className="text-lg font-extrabold tracking-wide text-navy">Kalpna Traders</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A8841C]">
                  Trust · Quality · Growth
                </p>
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#E8C547]">
              National channel partner · SPARS Electric
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] md:text-6xl">{company.company_name}</h1>
            <p className="mt-4 max-w-xl text-base text-blue-100 md:text-lg">
              EV scooters, lithium packs and LED batteries — quotations, tax invoices and dealer support from one Noida team.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#calendar"
                className="inline-flex h-12 items-center rounded-xl bg-[#C9A227] px-6 text-sm font-extrabold text-navy shadow-lg hover:bg-[#E8C547]"
              >
                Company calendar
              </a>
              <a
                href="#contact"
                className="inline-flex h-12 items-center rounded-xl border border-white/40 bg-white/10 px-6 text-sm font-semibold backdrop-blur hover:bg-white/20"
              >
                Contact HR / office
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img
              src="/home/ev-scooter.jpg"
              alt="EV scooter"
              className="h-44 w-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/20 md:h-56"
            />
            <img
              src="/home/lithium-battery.jpg"
              alt="Lithium battery packs"
              className="mt-8 h-44 w-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/20 md:h-56"
            />
            <img
              src="/home/led-battery.jpg"
              alt="LED and inverter batteries"
              className="col-span-2 h-36 w-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/20 md:h-44"
            />
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative">
            <img
              src="/home/hero-showroom.jpg"
              alt="Dealership floor"
              className="h-[380px] w-full rounded-[2rem] object-cover shadow-2xl"
            />
            <div className="absolute -bottom-5 -right-3 rounded-2xl bg-white p-4 shadow-card md:right-6">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Noida desk</p>
              <p className="text-sm font-extrabold text-navy">EV · Lithium · LED</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-electric">About the company</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">A trading house built on people and products</h2>
            <p className="mt-4 text-slate-600">
              Kalpna Traders is the commercial face of SPARS Electric in North India. Dealers get GST-ready quotations, a live price list and a team that shows up for launches, birthdays and festivals alike.
            </p>
            <div className="mt-6 space-y-3 rounded-3xl bg-white p-6 shadow-card">
              <p className="flex items-start gap-2 text-sm text-slate-600">
                <Building2 size={16} className="mt-0.5 text-[#C9A227]" /> GSTIN {company.gst_number || "—"}
              </p>
              <p className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin size={16} className="mt-0.5 text-[#C9A227]" /> {addr || "Noida"}
              </p>
              <p className="flex items-start gap-2 text-sm text-slate-600">
                <Phone size={16} className="mt-0.5 text-[#C9A227]" /> {company.phone}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="bg-[#0A2540] py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8C547]">Product range</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">What we quote every day</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PRODUCTS.map((p) => (
              <article key={p.title} className="group overflow-hidden rounded-[1.75rem] bg-white/5 ring-1 ring-white/10">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-extrabold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-blue-100">{p.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="calendar" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-electric">Company life</p>
            <h2 className="mt-2 text-3xl font-extrabold">Events, birthdays, festivals &amp; holidays</h2>
            <p className="mt-2 text-slate-600">Meetings, celebrations, festivals and holidays — listed for the whole team.</p>
          </div>
          <CalendarDays className="text-[#C9A227]" />
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
              No upcoming items in this filter. Admins can add events from Company Calendar.
            </p>
          )}
        </div>
      </section>

      <footer id="contact" className="relative overflow-hidden bg-[#061526] text-white">
        <img src="/home/hero-showroom.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-[#061526]/80" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3 md:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1">
              <img src="/kalpna-header.png" alt="" className="h-full w-full object-contain" />
            </span>
            <div>
              <p className="text-lg font-extrabold">{company.company_name}</p>
              <p className="mt-1 text-sm text-[#E8C547]">{company.tagline}</p>
            </div>
          </div>
          <div className="text-sm text-blue-100">
            <p>{addr}</p>
            <p className="mt-2">{company.phone}</p>
            <p>{company.email}</p>
          </div>
          <div className="text-sm text-blue-100">
            <p>Staff login: use Login in the header and choose Admin, Sales or Accountant.</p>
            <p className="mt-4 text-xs text-blue-200">
              © {new Date().getFullYear()} {company.company_name}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
