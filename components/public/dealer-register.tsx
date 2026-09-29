"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Label } from "@/components/ui/input";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";
import type { User } from "@/lib/types";

const empty = {
  name: "",
  company_name: "",
  email: "",
  mobile: "",
  password: "",
  city: "",
  state: "",
  pincode: "",
  address: "",
  gst_no: "",
};

export function DealerRegister() {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  function set(key: keyof typeof empty, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api<{ access: string; refresh: string; user: User }>("/api/auth/dealer-register/", {
        method: "POST",
        auth: false,
        body: JSON.stringify(form),
      });
      setSession(data.access, data.refresh, data.user);
      toast.success("Dealer account created. Opening your portal.");
      router.push("/portal");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="dealer-register" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-[#C9A227]/25 md:grid md:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-[#0A2540] p-8 text-white md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E8C547]">Dealer portal</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight">Register and login as a dealer</h2>
          <p className="mt-4 text-sm text-blue-100">
            Create your shop login here. After register you go straight into the dealer portal for products, quotations and support.
          </p>
          <p className="mt-6 text-sm text-blue-100">
            Already registered?{" "}
            <Link href="/dealer-login" className="font-extrabold text-[#E8C547] hover:underline">
              Dealer login
            </Link>
          </p>
        </div>
        <form onSubmit={onSubmit} className="grid gap-3 p-6 sm:grid-cols-2 md:p-8">
          <div>
            <Label>Your name *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div>
            <Label>Shop / company *</Label>
            <Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} required />
          </div>
          <div>
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>
          <div>
            <Label>Mobile *</Label>
            <Input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} inputMode="tel" required />
          </div>
          <div>
            <Label>Password *</Label>
            <Input
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
          </div>
          <div>
            <Label>GSTIN</Label>
            <Input value={form.gst_no} onChange={(e) => set("gst_no", e.target.value.toUpperCase())} maxLength={15} />
          </div>
          <div>
            <Label>City *</Label>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} required />
          </div>
          <div>
            <Label>State *</Label>
            <Input value={form.state} onChange={(e) => set("state", e.target.value)} required />
          </div>
          <div>
            <Label>Pincode</Label>
            <Input value={form.pincode} onChange={(e) => set("pincode", e.target.value)} maxLength={10} />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#C9A227] text-sm font-extrabold text-navy hover:bg-[#E8C547] disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Register and enter portal"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
