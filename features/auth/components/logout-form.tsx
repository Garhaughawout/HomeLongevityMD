import { logout } from "@/features/auth/actions";

export function LogoutForm() {
	return (
		<form action={logout}>
			<button
				type="submit"
				className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
			>
				Log out
			</button>
		</form>
	);
}
