"use client";

import { localRepo } from "@/lib/repo/localRepo";
import { supabaseRepo } from "@/lib/repo/supabaseRepo";

export type DataMode = "local" | "supabase";

const resolvedMode: DataMode =
  process.env.NEXT_PUBLIC_DATA_MODE === "supabase" ? "supabase" : "local";

export const portalRepo =
  resolvedMode === "supabase" ? supabaseRepo : localRepo;
