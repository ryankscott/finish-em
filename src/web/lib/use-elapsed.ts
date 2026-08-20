import { useEffect, useState } from "react";

import { formatElapsed } from "./day-plan";

/**
 * Ticking wall-clock time since `startedAt`, formatted.
 *
 * Local state rather than a query on purpose: the app's QueryClient runs with
 * refetchInterval 30s, and a per-second query would refetch the entire cache
 * once a second.
 */
export function useElapsed(startedAt: string | null): string | null {
	const [, setTick] = useState(0);

	useEffect(() => {
		if (!startedAt) return;
		const id = setInterval(() => setTick((n) => n + 1), 1000);
		return () => clearInterval(id);
	}, [startedAt]);

	if (!startedAt) return null;
	return formatElapsed(Date.now() - Date.parse(startedAt));
}
