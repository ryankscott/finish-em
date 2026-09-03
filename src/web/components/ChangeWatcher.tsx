import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { api } from "../lib/api";
import { acknowledgeVersion, isUnseenVersion } from "../lib/change-version";

/**
 * The app's only poller for data freshness. Every 15s it reads a single integer
 * from /api/changes, which the server bumps on every write, and invalidates the
 * cache only when that number moves.
 *
 * This replaces the global `refetchInterval: 30_000` React Query default, which
 * re-read every table behind every mounted query on a timer. Idle cost drops
 * from ~450 D1 rows per 30s to one row per poll, and cross-device propagation
 * gets faster (15s rather than 30s) rather than slower.
 */
export function ChangeWatcher() {
	const queryClient = useQueryClient();
	const observed = useRef(false);

	const { data } = useQuery({
		queryKey: ["changes"],
		queryFn: () => api.getChanges(),
		refetchInterval: 15_000,
		refetchOnWindowFocus: true,
		staleTime: 0,
	});

	const version = data?.version;

	useEffect(() => {
		if (version === undefined) return;
		// The first poll only establishes a baseline. The data queries mounted
		// alongside this one have just fetched, so invalidating here would make
		// every page load fetch everything twice.
		if (!observed.current) {
			observed.current = true;
			acknowledgeVersion(version);
			return;
		}
		// A version this client's own mutation produced, which it has already
		// refetched for.
		if (!isUnseenVersion(version)) return;
		acknowledgeVersion(version);
		// Excluding our own key is required: invalidating ["changes"] here would
		// refetch this query, which re-runs this effect, in a tight loop.
		queryClient.invalidateQueries({
			predicate: (query) => query.queryKey[0] !== "changes",
		});
	}, [version, queryClient]);

	return null;
}
