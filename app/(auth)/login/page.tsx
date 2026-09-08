"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";
import type { Role, User } from "@/lib/types";

const ROLE_OPTIONS: { value: Role; label: string; id: string; password: string }[] = [
  { value: "admin", label: "Admin", id: "KT001", password: "Admin@123" },
  { value: "sales", label: "Sales", id: "KT002", password: "Sales@123" },
  { value: "accountant", label: "Accountant", id: "KT003", password: "Accounts@123" },
];

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = (sp.get("role") || "admin") as Role;
  const [role, setRole] = useState<Role>(ROLE_OPTIONS.some((r) => r.value === initial) ? initial : "admin");
  const preset = useMemo(() => ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[0], [role]);
  const [email, setEmail] = useState(preset.id);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function changeRole(next: Role) {
    setRole(next);
    const p = ROLE_OPTIONS.find((r) => r.value === next);
    if (p) setEmail(p.id);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api<{ access: string; refresh: string; user: User }>("/api/auth/login/", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password, role }),
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
        <Link href="/" className="flex items-center gap-4">
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
        </Link>
        <div>
          <h1 className="max-w-md text-4xl font-extrabold leading-tight">
            {preset.label} login
          </h1>
          <p className="mt-4 max-w-md text-blue-100">
            Select Admin, Sales or Accountant, then sign in with your Employee ID.
          </p>
        </div>
        <p className="text-xs text-blue-200">© {new Date().getFullYear()} Kalpna Traders</p>
      </div>
      <div className="flex items-center justify-center bg-slate-50 p-6">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-electric">Staff login</p>
          <h2 className="mt-1 text-2xl font-extrabold text-navy">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Choose who is signing in, then enter your Employee ID or email.</p>
          <div className="mt-6">
            <Label>Login as</Label>
            <Select value={role} onChange={(e) => changeRole(e.target.value as Role)}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="mt-4">
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
            {loading ? "Signing in…" : `Sign in as ${preset.label}`}
          </Button>
          <Link href="/" className="mt-4 block text-center text-xs font-semibold text-slate-500 hover:text-navy">
            ← Back to company page
          </Link>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-500">Loading login…</p>}>
      <LoginInner />
    </Suspense>
  );
}
