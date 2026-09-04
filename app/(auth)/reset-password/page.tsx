"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { api } from "@/lib/api";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const token = params.get("token") || "";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/auth/reset-password/", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ token, password }),
      });
      toast.success("Password updated");
      router.replace("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
      <h1 className="text-2xl font-extrabold text-navy">Reset password</h1>
      <div className="mt-6">
        <Label>New password</Label>
        <Input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button className="mt-6 w-full" disabled={!token}>
        Update password
      </Button>
      <Link href="/login" className="mt-4 block text-center text-sm text-electric">
        Back to login
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  );
}
