"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { canManageCompany, canWriteCustomers, getStoredUser } from "@/lib/auth";
import { INDIAN_STATES, type Customer, type PartyType, type User } from "@/lib/types";

const empty = {
  customer_name: "",
  company_name: "",
  gst_no: "",
  contact_person: "",
  mobile: "",
  alternate_number: "",
  email: "",
  billing_address: "",
  shipping_address: "",
  state: "Uttar Pradesh",
  city: "",
  pincode: "",
  notes: "",
  is_active: true,
  assigned_to: "" as number | "",
};

export function CustomerForm({ id, kind = "dealer" }: { id?: string; kind?: PartyType }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [team, setTeam] = useState<User[]>([]);
  const isAdmin = canManageCompany(getStoredUser()?.role);
  const canWrite = canWriteCustomers(getStoredUser()?.role);
  const readOnly = Boolean(id) && !canWrite;
  const label = kind === "dealer" ? "Dealer" : "Vendor";
  const listPath = kind === "dealer" ? "/dealers" : "/vendors";

  useEffect(() => {
    if (!id && !canWrite) {
      router.replace(listPath);
    }
  }, [id, canWrite, listPath, router]);

  useEffect(() => {
    api<User[]>("/api/auth/users/sales_team/").then(setTeam).catch(() => {});
    if (!id) return;
    api<Customer>(`/api/customers/${id}/`).then((c) =>
      setForm({
        customer_name: c.customer_name,
        company_name: c.company_name || "",
        gst_no: c.gst_no || "",
        contact_person: c.contact_person || "",
        mobile: c.mobile,
        alternate_number: c.alternate_number || "",
        email: c.email || "",
        billing_address: c.billing_address,
        shipping_address: c.shipping_address || "",
        state: c.state,
        city: c.city,
        pincode: c.pincode,
        notes: c.notes || "",
        is_active: c.is_active,
        assigned_to: c.assigned_to || "",
      })
    );
  }, [id]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canWrite) return;
    const payload = {
      ...form,
      party_type: kind,
      assigned_to: isAdmin ? form.assigned_to || null : undefined,
    };
    try {
      const saved = id
        ? await api<Customer>(`/api/customers/${id}/`, { method: "PUT", body: JSON.stringify(payload) })
        : await api<Customer>("/api/customers/", { method: "POST", body: JSON.stringify(payload) });
      toast.success(`${label} saved`);
      if (!id && kind === "dealer") {
        router.push(`/invoices/new?dealer=${saved.id}`);
        return;
      }
      router.push(listPath);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">
          {readOnly ? `${label} details` : id ? `Edit ${label}` : `Add ${label}`}
        </h1>
        <p className="text-sm text-slate-500">
          {readOnly ? "View only — GST, address and assigned sales executive" : "Billing, shipping, GST and sales assignment"}
        </p>
      </div>
      <fieldset disabled={readOnly} className="grid gap-4 rounded-2xl bg-white p-6 shadow-card md:grid-cols-2">
        <div>
          <Label>{label} Name *</Label>
          <Input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} required />
        </div>
        <div>
          <Label>Company Name</Label>
          <Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
        </div>
        <div>
          <Label>GST Number</Label>
          <Input value={form.gst_no} onChange={(e) => set("gst_no", e.target.value.toUpperCase())} maxLength={15} />
        </div>
        <div>
          <Label>Contact Person</Label>
          <Input value={form.contact_person} onChange={(e) => set("contact_person", e.target.value)} />
        </div>
        <div>
          <Label>Mobile Number *</Label>
          <Input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} required />
        </div>
        <div>
          <Label>Alternate Number</Label>
          <Input value={form.alternate_number} onChange={(e) => set("alternate_number", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Email Address</Label>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        {kind === "dealer" && (isAdmin || readOnly) && (
          <div className="md:col-span-2">
            <Label>Assigned Sales Executive</Label>
            <Select
              value={form.assigned_to === "" ? "" : String(form.assigned_to)}
              onChange={(e) => set("assigned_to", e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Unassigned</option>
              {team.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.employee_id || t.email})
                </option>
              ))}
            </Select>
          </div>
        )}
        <div>
          <Label>Billing Address *</Label>
          <Textarea value={form.billing_address} onChange={(e) => set("billing_address", e.target.value)} required />
        </div>
        <div>
          <Label>Shipping Address</Label>
          <Textarea value={form.shipping_address} onChange={(e) => set("shipping_address", e.target.value)} />
        </div>
        <div>
          <Label>State *</Label>
          <Select value={form.state} onChange={(e) => set("state", e.target.value)}>
            {INDIAN_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>City *</Label>
          <Input value={form.city} onChange={(e) => set("city", e.target.value)} required />
        </div>
        <div>
          <Label>Pincode *</Label>
          <Input value={form.pincode} onChange={(e) => set("pincode", e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <Label>Notes</Label>
          <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </fieldset>
      <div className="flex gap-2">
        {!readOnly && (
          <Button type="submit">{id ? `Save ${label}` : kind === "dealer" ? "Save & Create PI" : `Save ${label}`}</Button>
        )}
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {readOnly ? "Back" : "Cancel"}
        </Button>
      </div>
    </form>
  );
}
