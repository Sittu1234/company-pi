"use client";

import type { User } from "./types";

const ACCESS = "spars_access";
const REFRESH = "spars_refresh";
const USER = "spars_user";

export function getAccess() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS);
}

export function getRefresh() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setSession(access: string, refresh: string, user: User) {
  localStorage.setItem(ACCESS, access);
  localStorage.setItem(REFRESH, refresh);
  localStorage.setItem(USER, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  localStorage.removeItem(USER);
}

export function canWriteCustomers(role?: string) {
  return role === "admin" || role === "sales";
}

export function canWriteProducts(role?: string) {
  return role === "admin";
}

export function canWriteInvoices(role?: string) {
  return role === "admin" || role === "sales";
}

export function canManageUsers(role?: string) {
  return role === "admin";
}

export function canManageCompany(role?: string) {
  return role === "admin";
}

export function isSales(role?: string) {
  return role === "sales";
}

export function isAccountant(role?: string) {
  return role === "accountant";
}

export function isHr(role?: string) {
  return role === "hr";
}

export function isManager(role?: string) {
  return role === "manager";
}

export function isTechnician(role?: string) {
  return role === "technician";
}

export function isDealer(role?: string) {
  return role === "dealer";
}

export function isInternal(role?: string) {
  return !!role && role !== "dealer";
}

export function isCompanyViewer(role?: string) {
  return role === "admin" || role === "accountant";
}

export function canDeleteParties(role?: string) {
  return role === "admin";
}

export function homePath(role?: string) {
  if (role === "dealer") return "/portal";
  return "/dashboard";
}
