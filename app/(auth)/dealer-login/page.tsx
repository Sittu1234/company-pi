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

export default function DealerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api<{ access: string; refresh: string; user: User }>("/api/auth/login/", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password, role: "dealer" }),
      });
      setSession(data.access, data.refresh, data.user);
      router.replace("/portal");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-electric">Dealer portal</p>
        <h1 className="mt-1 text-2xl font-extrabold">Kalpna Traders</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in with the email shared by the company.</p>
        <div className="mt-6"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="mt-4"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <Button className="mt-6 w-full" disabled={loading}>{loading ? "Signing in…" : "Enter portal"}</Button>
        <Link href="/#dealer-register" className="mt-4 block text-center text-xs font-semibold text-electric">
          New dealer? Register on the home page
        </Link>
        <Link href="/login" className="mt-2 block text-center text-xs font-semibold text-slate-500">Staff login →</Link>
      </form>
    </div>
  );
}
