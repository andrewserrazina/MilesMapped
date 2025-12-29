"use client";

export type UserRole = "admin" | "agent";

export interface CurrentUser {
  name: string;
  role: UserRole;
}

export function useCurrentUser(): CurrentUser {
  return {
    name: "Admin",
    role: "admin",
  };
}
