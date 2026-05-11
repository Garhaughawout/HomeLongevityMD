"use client";

import { useFormState } from "react-dom";
import { loginWithPassword } from "@/features/auth/actions";
import { LoginSubmitButton } from "@/features/auth/components/login-submit-button";
import { initialLoginFormState } from "@/features/auth/schema";

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction] = useFormState(
    loginWithPassword.bind(null, redirectTo),
    initialLoginFormState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
          placeholder="name@company.com"
          required
        />
        {state.fieldErrors?.email ? (
          <p className="text-sm text-red-700">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
          placeholder="Enter your password"
          required
        />
        {state.fieldErrors?.password ? (
          <p className="text-sm text-red-700">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <LoginSubmitButton />
    </form>
  );
}