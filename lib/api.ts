"use client";

import { clearSession, getAccess, getRefresh, setSession, getStoredUser } from "./auth";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Options = RequestInit & { auth?: boolean; raw?: boolean };

async function refreshAccess(): Promise<string | null> {
  const refresh = getRefresh();
  if (!refresh) return null;
  const res = await fetch(`${API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    clearSession();
    return null;
  }
  const data = await res.json();
  const user = getStoredUser();
  if (user) setSession(data.access, data.refresh || refresh, user);
  else localStorage.setItem("spars_access", data.access);
  return data.access as string;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export async function api<T = unknown>(path: string, options: Options = {}): Promise<T> {
  const { auth = true, raw, headers, ...rest } = options;
  const h = new Headers(headers);
  if (!(rest.body instanceof FormData) && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }
  let token = auth ? getAccess() : null;
  if (token) h.set("Authorization", `Bearer ${token}`);

  let res = await fetch(`${API_URL}${path}`, { ...rest, headers: h });
  if (res.status === 401 && auth) {
    token = await refreshAccess();
    if (token) {
      h.set("Authorization", `Bearer ${token}`);
      res = await fetch(`${API_URL}${path}`, { ...rest, headers: h });
    } else if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  if (raw) return res as unknown as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail =
      (data && (data.detail || data.message)) ||
      (typeof data === "object" && data ? JSON.stringify(data) : "Request failed");
    throw new ApiError(String(detail), res.status, data);
  }
  return data as T;
}

export async function downloadFile(path: string, filename: string) {
  const res = await api<Response>(path, { raw: true });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function openPdf(path: string) {
  const res = await api<Response>(path, { raw: true });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
