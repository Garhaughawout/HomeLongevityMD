"use client";

import { RouteError } from "@/components/ui/error-state";

type DashboardErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
	return <RouteError error={error} reset={reset} />;
}
