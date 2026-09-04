"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PartyDirectory } from "@/components/parties/party-directory";
import { canManageCompany, getStoredUser } from "@/lib/auth";

export default function VendorsPage() {
  const router = useRouter();
  useEffect(() => {
    if (!canManageCompany(getStoredUser()?.role)) router.replace("/dashboard");
  }, [router]);
  return <PartyDirectory kind="vendor" />;
}
