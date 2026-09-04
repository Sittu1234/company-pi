"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const data = await api<{ detail: string; reset_url?: string }>("/api/auth/forgot-password/", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email }),
      });
      toast.success(data.detail);
      if (data.reset_url) setInfo(data.reset_url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <h1 className="text-2xl font-extrabold text-navy">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-500">We will email a reset link if the account exists.</p>
        <div className="mt-6">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <Button className="mt-6 w-full">Send reset link</Button>
        {info && (
          <p className="mt-4 break-all text-xs text-electric">
            Dev reset URL: <Link href={info}>{info}</Link>
          </p>
        )}
        <Link href="/login" className="mt-4 block text-center text-sm text-electric">
          Back to login
        </Link>
      </form>
    </div>
  );
}
