"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";
import type { User } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("wendy.h@example.net");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api<{ access: string; refresh: string; user: User }>("/api/auth/login/", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      setSession(data.access, data.refresh, data.user);
      toast.success(`Welcome back, ${data.user.name}`);
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="erp-gradient relative hidden flex-col justify-between p-10 text-white lg:flex">
        <div className="flex items-center gap-4">
          <img
            src="/kalpna-logo.jpg"
            alt="Kalpna Traders"
            className="h-24 w-24 rounded-2xl bg-white object-contain p-2 shadow-card"
          />
          <div>
            <p className="text-xl font-extrabold">Kalpna Traders</p>
            <p className="text-sm text-blue-100">SPARS ERP · Proforma Invoice System</p>
            <p className="mt-1 text-xs tracking-wide text-amber-200">TRUST · QUALITY · GROWTH</p>
          </div>
        </div>
        <div>
          <h1 className="max-w-md text-4xl font-extrabold leading-tight">
            Professional PI workflow for manufacturing &amp; trading.
          </h1>
          <p className="mt-4 max-w-md text-blue-100">
            Customers, products, GST-ready quotations, PDF, WhatsApp and email — in one modern ERP
            dashboard.
          </p>
        </div>
        <p className="text-xs text-blue-200">© {new Date().getFullYear()} Kalpna Traders</p>
      </div>
      <div className="flex items-center justify-center bg-slate-50 p-6">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
          <h2 className="text-2xl font-extrabold text-navy">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Login with Employee ID or email</p>
          <div className="mt-6">
            <Label>Employee ID or Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="KT001 or email" />
          </div>
          <div className="mt-4">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-xs font-semibold text-electric hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button className="mt-6 w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <div className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-navy">Demo logins (ID or email)</p>
            <p>Admin — KT001 / Admin@123</p>
            <p>Sales — KT002 / Sales@123</p>
            <p>Accounts — KT003 / Accounts@123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
