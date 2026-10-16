export type Role = "admin" | "sales" | "accountant" | "hr" | "manager" | "technician" | "dealer";

export type Lead = {
  id: number;
  lead_number: string;
  company_name: string;
  contact_person: string;
  mobile: string;
  email: string;
  state: string;
  city: string;
  source: string;
  status: string;
  assigned_to?: number | null;
  assigned_to_name?: string;
  product_interest: string;
  notes: string;
  next_follow_up?: string | null;
  priority_score: number;
  converted_dealer?: number | null;
  converted_dealer_name?: string;
  lost_reason?: string;
  followup_suggestion?: string;
  email_draft?: string;
  whatsapp_draft?: string;
  whatsapp_url?: string;
  mailto?: string;
  call_notes?: { id: number; body: string; author_name?: string; created_at: string }[];
  followups?: { id: number; due_at: string; notes: string; is_done: boolean }[];
  created_at?: string;
};

export type Warehouse = { id: number; name: string; code: string; city: string; address: string; is_active: boolean };

export type StockRow = {
  id: number;
  warehouse: number;
  warehouse_name?: string;
  warehouse_code?: string;
  product: number;
  product_name?: string;
  product_code?: string;
  sku?: string;
  qty: string | number;
  min_stock?: string | number;
};

export type PaymentRow = {
  id: number;
  receipt_number: string;
  customer: number;
  customer_name?: string;
  invoice?: number | null;
  invoice_number?: string;
  amount: string | number;
  mode: string;
  kind: string;
  received_on: string;
  reference: string;
  notes: string;
};

export type PurchaseOrder = {
  id: number;
  po_number: string;
  vendor: number;
  vendor_name?: string;
  status: string;
  po_date: string;
  expected_date?: string | null;
  notes: string;
  grand_total: string | number;
  items: { id?: number; product: number; product_name?: string; qty: number; rate: number; gst: number }[];
};

export type EmployeeProfile = {
  id: number;
  user: number;
  user_name?: string;
  employee_id?: string;
  department?: number | null;
  department_name?: string;
  designation: string;
  joining_date?: string | null;
  salary: string | number;
  aadhaar_number: string;
  pan_number: string;
};

export type LeaveRequest = {
  id: number;
  request_number: string;
  user: number;
  user_name?: string;
  kind: string;
  start_date: string;
  end_date: string;
  days: string | number;
  reason: string;
  status: string;
};

export type WorkTask = {
  id: number;
  task_number: string;
  title: string;
  description: string;
  assigned_to: number;
  assigned_to_name?: string;
  due_date: string;
  priority: string;
  status: string;
  is_overdue?: boolean;
};

export type ServiceTicket = {
  id: number;
  ticket_number: string;
  dealer?: number | null;
  dealer_name?: string;
  customer_name: string;
  customer_mobile: string;
  complaint: string;
  status: string;
  priority: string;
  technician?: number | null;
  technician_name?: string;
  serial: string;
};

export type WarrantyClaim = {
  id: number;
  claim_number: string;
  registration: number;
  serial?: string;
  dealer_name?: string;
  product_name?: string;
  customer_name?: string;
  status: string;
  issue: string;
  resolution: string;
};

export type NotificationRow = {
  id: number;
  kind: string;
  title: string;
  body: string;
  link: string;
  is_read: boolean;
  created_at: string;
};

export const LEAD_SOURCES = [
  ["website", "Website"],
  ["indiamart", "IndiaMART"],
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["linkedin", "LinkedIn"],
  ["justdial", "Justdial"],
  ["referral", "Referral"],
  ["direct", "Direct Call"],
];

export const LEAD_STATUSES = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["follow_up", "Follow Up"],
  ["interested", "Interested"],
  ["negotiation", "Negotiation"],
  ["won", "Won"],
  ["lost", "Lost"],
];
