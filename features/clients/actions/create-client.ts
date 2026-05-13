"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/services/auth/session";
import { createClient } from "@/services/clients";

// ── Validation schema ─────────────────────────────────────────────────────────

const createClientSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(200),
  email: z.string().trim().email("Invalid email address").or(z.literal("")).optional(),
  phone: z.string().trim().max(30).or(z.literal("")).optional(),
  date_of_birth: z
    .string()
    .trim()
    .transform((val) => {
      if (!val) return val;
      // Accept MM/DD/YYYY and convert to YYYY-MM-DD
      const mdyMatch = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (mdyMatch) {
        const [, m, d, y] = mdyMatch;
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
      return val;
    })
    .pipe(
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter date as MM/DD/YYYY").or(z.literal("")).optional()
    )
    .optional(),
  address_line1: z.string().trim().max(200).or(z.literal("")).optional(),
  address_line2: z.string().trim().max(200).or(z.literal("")).optional(),
  city: z.string().trim().max(100).or(z.literal("")).optional(),
  state: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/, "Use 2-letter state code")
    .or(z.literal(""))
    .optional(),
  zip: z.string().trim().max(10).or(z.literal("")).optional(),
});

// ── Form state ────────────────────────────────────────────────────────────────

export type CreateClientFormState = {
  errors?: Partial<Record<keyof z.infer<typeof createClientSchema>, string[]>>;
  globalError?: string;
};

// ── Action ────────────────────────────────────────────────────────────────────

export async function createClientAction(
  _prev: CreateClientFormState,
  formData: FormData,
): Promise<CreateClientFormState> {
  const user = await requireAuthenticatedUser();

  const raw = {
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    date_of_birth: formData.get("date_of_birth") as string,
    address_line1: formData.get("address_line1") as string,
    address_line2: formData.get("address_line2") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    zip: formData.get("zip") as string,
  };

  const parsed = createClientSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const d = parsed.data;

  try {
    const client = await createClient({
      full_name: d.full_name,
      email: d.email || null,
      phone: d.phone || null,
      date_of_birth: d.date_of_birth || null,
      address_line1: d.address_line1 || null,
      address_line2: d.address_line2 || null,
      city: d.city || null,
      state: d.state || null,
      zip: d.zip || null,
      created_by: user.id,
    });

    redirect(`/clients/${client.id}`);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    return { globalError: `Failed to create client: ${msg}` };
  }
}
