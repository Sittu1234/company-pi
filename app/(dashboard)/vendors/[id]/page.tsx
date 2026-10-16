"use client";

import { useParams } from "next/navigation";
import { CustomerForm } from "@/components/customers/customer-form";

export default function EditVendorPage() {
  const { id } = useParams<{ id: string }>();
  return <CustomerForm id={id} kind="vendor" />;
}
