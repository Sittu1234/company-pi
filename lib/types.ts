export type Role = "admin" | "sales" | "accountant";

export type User = {
  id: number;
  name: string;
  email: string;
  employee_id?: string;
  role: Role;
  mobile?: string;
  is_active: boolean;
  last_login?: string | null;
  created_at?: string;
};

export type PartyType = "dealer" | "vendor";

export type Customer = {
  id: number;
  customer_name: string;
  company_name: string;
  party_type?: PartyType;
  gst_no: string;
  contact_person: string;
  mobile: string;
  alternate_number: string;
  email: string;
  billing_address: string;
  shipping_address: string;
  state: string;
  city: string;
  pincode: string;
  notes?: string;
  is_active: boolean;
  assigned_to?: number | null;
  assigned_to_name?: string;
  assigned_to_employee_id?: string;
  created_by?: number | null;
  created_by_name?: string;
  created_at?: string;
};

export type Category = {
  id: number;
  name: string;
  description: string;
  product_count?: number;
};

export type Product = {
  id: number;
  product_name: string;
  product_code: string;
  category: number | null;
  category_name?: string;
  hsn_code: string;
  unit: string;
  gst: string | number;
  price: string | number;
  description: string;
  image?: string | null;
  is_active: boolean;
};

export type CatalogPdf = {
  id: number;
  title: string;
  category: string;
  file?: string;
  file_url?: string;
  file_name?: string;
  uploaded_by_name?: string;
  is_active: boolean;
  created_at: string;
};

export type InvoiceItem = {
  id?: number;
  product?: number | null;
  product_name: string;
  hsn_code: string;
  unit: string;
  qty: number | string;
  rate: number | string;
  gst: number | string;
  amount?: number | string;
  gst_amount?: number | string;
  total_amount?: number | string;
};

export type Invoice = {
  id: number;
  pi_number: string;
  pi_date: string;
  valid_till: string | null;
  customer: number;
  customer_detail?: Customer;
  status: "draft" | "sent" | "accepted" | "invoiced" | "expired" | "cancelled";
  freight_charges: number | string;
  packing_charges: number | string;
  discount: number | string;
  notes: string;
  terms: string;
  pi_kind?: "battery" | "ev_scooter" | "both" | "";
  subtotal: number | string;
  cgst_amount: number | string;
  sgst_amount: number | string;
  igst_amount: number | string;
  gst_amount: number | string;
  grand_total: number | string;
  is_interstate: boolean;
  created_by?: number | null;
  created_by_name?: string;
  created_by_employee_id?: string;
  created_at?: string;
  last_sent_at?: string | null;
  last_sent_via?: string;
  last_sent_to?: string;
  tax_invoice_number?: string | null;
  tax_invoice_date?: string | null;
  converted_at?: string | null;
  can_convert_tax?: boolean;
  dispatches?: InvoiceDispatch[];
  items: InvoiceItem[];
};

export type InvoiceDispatch = {
  id: number;
  channel: "email" | "whatsapp";
  recipient: string;
  sent_by?: number | null;
  sent_by_name?: string;
  sent_at: string;
  notes?: string;
};

export type CompanyEventKind = "event" | "birthday" | "festival" | "holiday";

export type CompanyEvent = {
  id: number;
  title: string;
  kind: CompanyEventKind;
  kind_label?: string;
  date: string;
  end_date?: string | null;
  description: string;
  is_public: boolean;
  is_active: boolean;
};

export type PublicHighlight = {
  title: string;
  body: string;
  image: string;
};

export type PublicPageContent = {
  id?: number;
  hero_kicker: string;
  hero_title: string;
  hero_body: string;
  cta_primary: string;
  cta_secondary: string;
  hero_image: string;
  about_kicker: string;
  about_title: string;
  about_body: string;
  products_kicker: string;
  products_title: string;
  highlight_1_title: string;
  highlight_1_body: string;
  highlight_1_image: string;
  highlight_2_title: string;
  highlight_2_body: string;
  highlight_2_image: string;
  highlight_3_title: string;
  highlight_3_body: string;
  highlight_3_image: string;
  careers_kicker: string;
  careers_title: string;
  careers_body: string;
  careers_email: string;
  highlights?: PublicHighlight[];
};

export type CareerOpening = {
  id: number;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  apply_email: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
};

export type PublicCompany = {
  company_name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  gst_number: string;
  page?: PublicPageContent;
  careers?: CareerOpening[];
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type CompanySettings = {
  id: number;
  company_name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst_number: string;
  pan_number: string;
  phone: string;
  email: string;
  website: string;
  logo: string | null;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_ifsc: string;
  bank_branch: string;
  default_gst: number | string;
  pi_prefix: string;
  default_terms: string;
  email_template: string;
  whatsapp_template: string;
};

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
];

export const UNITS = ["PCS", "KG", "G", "LTR", "MTR", "BOX", "SET", "NOS", "PKT", "TON"];
