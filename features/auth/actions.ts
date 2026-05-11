"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/services/supabase/server";
import {
  loginSchema,
  type LoginFormState,
} from "@/features/auth/schema";

const normalizeRedirectPath = (value: string) => {
  if (!value.startsWith("/")) {
    return "/dashboard";
  }

  return value;
};

export async function loginWithPassword(
  redirectTo: string,
  _previousState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const parsedInput = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedInput.success) {
    return {
      status: "error",
      message: "Fix the highlighted fields and try again.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsedInput.data);

  if (error) {
    return {
      status: "error",
      message: "Unable to sign in with those credentials.",
    };
  }

  redirect(normalizeRedirectPath(redirectTo));
}

export async function logout() {
  const supabase = createServerSupabaseClient();

  await supabase.auth.signOut();
  redirect("/login");
}
