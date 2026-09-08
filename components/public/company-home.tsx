"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Building2,
  Cake,
  CalendarDays,
  Mail,
  MapPin,
  PartyPopper,
  Phone,
  Sparkles,
  Umbrella,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type {
  CareerOpening,
  CompanyEvent,
  CompanyEventKind,
  PublicCompany,
  PublicHighlight,
  PublicPageContent,
} from "@/lib/types";
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

const FALLBACK_PAGE: PublicPageContent = {
  hero_kicker: "National channel partner · SPARS Electric",
  hero_title: "",
  hero_body:
    "EV scooters, lithium packs and LED batteries — quotations, tax invoices and dealer support from one Noida team.",
  cta_primary: "Company calendar",
  cta_secondary: "Contact HR / office",
  hero_image: "/home/hero-showroom.jpg",
  about_kicker: "About the company",
  about_title: "A trading house built on people and products",
  about_body:
    "Kalpna Traders is the commercial face of SPARS Electric in North India. Dealers get GST-ready quotations, a live price list and a team that shows up for launches, birthdays and festivals alike.",
  products_kicker: "Product range",
  products_title: "What we quote every day",
  highlight_1_title: "EV Scooter",
  highlight_1_body: "Models, battery options and RTO-ready quotations from one desk.",
  highlight_1_image: "/home/ev-scooter.jpg",
  highlight_2_title: "Lithium packs",
  highlight_2_body: "Voltage, Ah, BMS and connector as per the signed specification.",
  highlight_2_image: "/home/lithium-battery.jpg",
  highlight_3_title: "LED / inverter",
  highlight_3_body: "Stock range with HSN, GST and dealer price list support.",
  highlight_3_image: "/home/led-battery.jpg",
  careers_kicker: "Careers",
  careers_title: "Build your career with Kalpna Traders",
  careers_body: "Sales, accounts and warehouse roles at our Noida desk. Apply with a short note — we reply from HR.",
  careers_email: "hrbp@kalpanatraders.com",
};

const FALLBACK_JOBS: CareerOpening[] = [
  {
    id: 1,
    title: "Sales Executive",
    department: "Sales",
    location: "Noida",
    employment_type: "Full-time",
    description: "Dealer visits, quotations and follow-ups for EV scooters and battery packs across North India.",
    apply_email: "",
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    title: "Accounts Executive",
    department: "Accounts",
    location: "Noida",
    employment_type: "Full-time",
    description: "GST-ready PIs, tax invoices, payment tracking and dealer ledger support.",
    apply_email: "",
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    title: "Store & Dispatch Associate",
    department: "Warehouse",
    location: "Noida",
    employment_type: "Full-time",
    description: "Packing, stock checks and dispatch for lithium packs, LED batteries and scooter accessories.",
    apply_email: "",
    is_active: true,
    sort_order: 3,
  },
];

const KIND_META: Record<
  CompanyEventKind,
  { label: string; icon: typeof Cake; tone: string; chip: string }
> = {
  event: { label: "Events", icon: Sparkles, tone: "bg-electric-50 text-electric", chip: "border-electric text-electric" },
  birthday: { label: "Birthdays", icon: Cake, tone: "bg-rose-50 text-rose-700", chip: "border-rose-400 text-rose-700" },
  festival: { label: "Festivals", icon: PartyPopper, tone: "bg-amber-50 text-amber-800", chip: "border-amber-400 text-amber-800" },
  holiday: { label: "Holidays", icon: Umbrella, tone: "bg-emerald-50 text-emerald-800", chip: "border-emerald-400 text-emerald-800" },
};

function highlightsFrom(page: PublicPageContent): PublicHighlight[] {
  if (page.highlights?.length) return page.highlights;
  return [
    { title: page.highlight_1_title, body: page.highlight_1_body, image: page.highlight_1_image },
    { title: page.highlight_2_title, body: page.highlight_2_body, image: page.highlight_2_image },
    { title: page.highlight_3_title, body: page.highlight_3_body, image: page.highlight_3_image },
  ].filter((row) => row.title);
}

export function CompanyHome() {
  const [company, setCompany] = useState<PublicCompany>(FALLBACK_COMPANY);
  const [page, setPage] = useState<PublicPageContent>(FALLBACK_PAGE);
  const [jobs, setJobs] = useState<CareerOpening[]>(FALLBACK_JOBS);
  const [events, setEvents] = useState<CompanyEvent[]>([]);
  const [filter, setFilter] = useState<"all" | CompanyEventKind>("all");

  useEffect(() => {
    api<PublicCompany>("/api/company/public/", { auth: false })
      .then((data) => {
        setCompany(data);
        if (data.page) setPage({ ...FALLBACK_PAGE, ...data.page });
        if (Array.isArray(data.careers)) setJobs(data.careers);
      })
      .catch(() => {});
    api<CompanyEvent[]>("/api/company/events/?upcoming=1", { auth: false })
      .then((d) => setEvents(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const shown = useMemo(
    () => (filter === "all" ? events : events.filter((e) => e.kind === filter)),
    [events, filter]
  );
  const products = highlightsFrom(page);
  const addr = [company.address, company.city, company.state, company.pincode].filter(Boolean).join(", ");
  const today = new Date().toISOString().slice(0, 10);
  const heroTitle = page.hero_title || company.company_name;
  const heroImage = page.hero_image || "/home/hero-showroom.jpg";
  const hrEmail = page.careers_email || company.email || "hrbp@kalpanatraders.com";

  return (
    <div className="min-h-screen bg-[#F4EFE4] text-navy">
      <SiteHeader />

      <section className="relative min-h-[82vh] overflow-hidden text-white">
        <img src={heroImage} alt="Kalpna Traders showroom" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061526]/95 via-[#0A2540]/80 to-[#0A2540]/30" />
        <div className="absolute -right-10 top-10 h-64 w-64 rounded-full bg-[#C9A227]/25 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-4 rounded-3xl bg-white p-2.5 pr-5 shadow-xl ring-1 ring-[#C9A227]/40">
              <img src="/kalpna-header.png" alt="Kalpna Traders logo" className="h-28 w-28 rounded-2xl object-contain" />
              <div>
                <p className="text-lg font-extrabold tracking-wide text-navy">{company.company_name}</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A8841C]">
                  {company.tagline || "Trust · Quality · Growth"}
                </p>
              </div>
            </div>
            {page.hero_kicker && (
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#E8C547]">{page.hero_kicker}</p>
            )}
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] md:text-6xl">{heroTitle}</h1>
            <p className="mt-4 max-w-xl text-base text-blue-100 md:text-lg">{page.hero_body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#calendar"
                className="inline-flex h-12 items-center rounded-xl bg-[#C9A227] px-6 text-sm font-extrabold text-navy shadow-lg hover:bg-[#E8C547]"
              >
                {page.cta_primary || "Company calendar"}
              </a>
              <a
                href="#contact"
                className="inline-flex h-12 items-center rounded-xl border border-white/40 bg-white/10 px-6 text-sm font-semibold backdrop-blur hover:bg-white/20"
              >
                {page.cta_secondary || "Careers"}
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {products.slice(0, 2).map((p, i) => (
              <img
                key={p.title}
                src={p.image}
                alt={p.title}
                className={`h-44 w-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/20 md:h-56 ${i === 1 ? "mt-8" : ""}`}
              />
            ))}
            {products[2] && (
              <img
                src={products[2].image}
                alt={products[2].title}
                className="col-span-2 h-36 w-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/20 md:h-44"
              />
            )}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 md:px-6">
        <div className="grid gap-3 rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-[#C9A227]/20 md:grid-cols-3">
          <Stat label="GSTIN" value={company.gst_number || "GST ready"} />
          <Stat label="Desk" value={`${company.city || "Noida"} · North India`} />
          <Stat label="Range" value="EV · Lithium · LED" />
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative">
            <img src={heroImage} alt="Dealership floor" className="h-[380px] w-full rounded-[2rem] object-cover shadow-2xl" />
            <div className="absolute -bottom-5 -right-3 rounded-2xl bg-white p-4 shadow-card md:right-6">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Noida desk</p>
              <p className="text-sm font-extrabold text-navy">EV · Lithium · LED</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-electric">{page.about_kicker}</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">{page.about_title}</h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-[#C9A227]" />
            <p className="mt-4 text-slate-600">{page.about_body}</p>
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8C547]">{page.products_kicker}</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">{page.products_title}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {products.map((p) => (
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

      <section id="careers" className="relative overflow-hidden py-20">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-[#F4EFE4]/90" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-electric">{page.careers_kicker}</p>
              <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">{page.careers_title}</h2>
              <div className="mt-3 h-1 w-16 rounded-full bg-[#C9A227]" />
              <p className="mt-4 text-slate-600">{page.careers_body}</p>
            </div>
            <a
              href={`mailto:${hrEmail}`}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-navy px-5 text-sm font-extrabold text-white hover:bg-[#0A2540]"
            >
              <Mail size={16} /> {hrEmail}
            </a>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {jobs.map((job) => {
              const mail = job.apply_email || hrEmail;
              return (
                <article key={job.id} className="flex flex-col rounded-[1.75rem] bg-white p-6 shadow-card ring-1 ring-[#C9A227]/15">
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                    <Briefcase size={12} /> {job.employment_type || "Full-time"}
                  </span>
                  <h3 className="mt-4 text-xl font-extrabold">{job.title}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {[job.department, job.location].filter(Boolean).join(" · ") || "Noida"}
                  </p>
                  {job.description && <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{job.description}</p>}
                  <a
                    href={`mailto:${mail}?subject=${encodeURIComponent("Application: " + job.title)}`}
                    className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#C9A227] text-sm font-extrabold text-navy hover:bg-[#E8C547]"
                  >
                    Apply now
                  </a>
                </article>
              );
            })}
            {!jobs.length && (
              <p className="col-span-full rounded-2xl bg-white p-8 text-center text-slate-500 shadow-card">
                No openings right now. Write to {hrEmail} and we will keep your profile.
              </p>
            )}
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
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
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
            <p>Careers: {hrEmail}</p>
            <p className="mt-2">Staff login: use Login in the header and choose Admin, Sales or Accountant.</p>
            <p className="mt-4 text-xs text-blue-200">
              © {new Date().getFullYear()} {company.company_name}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F4EFE4] px-5 py-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-navy">{value}</p>
    </div>
  );
}
