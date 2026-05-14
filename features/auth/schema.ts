import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().trim().email("Enter a valid email address."),
	password: z.string().min(6, "Password must be at least 6 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type LoginFormState = {
	status: "idle" | "error";
	message?: string;
	fieldErrors?: {
		email?: string[];
		password?: string[];
	};
};

export const initialLoginFormState: LoginFormState = {
	status: "idle",
};
