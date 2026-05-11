import { createMiddlewareSupabaseClient } from "@/services/supabase/middleware";
import type { NextRequest } from "next/server";

export const createClient = (request: NextRequest) => {
  return createMiddlewareSupabaseClient(request);
};
