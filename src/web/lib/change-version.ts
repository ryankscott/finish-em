/**
 * Tracks the highest change version this client has already reflected in its
 * cache, so ChangeWatcher can tell a change it caused from one someone else
 * caused.
 *
 * Without this, every local mutation costs two full refetch rounds: one from
 * the mutation's own invalidation, then an identical one up to 15s later when
 * the poller notices the version the same mutation bumped. Mutations are the
 * dominant remaining read source once polling is gone, so that doubling matters.
 *
 * Safe against missing a concurrent remote change: if a remote write and a
 * local write land between two polls, the local mutation's own invalidation
 * refetches everything anyway, which picks up the remote change too.
 */

let acknowledged = 0;

/** Record a version this client has already accounted for. Monotonic. */
export function acknowledgeVersion(version: number) {
	if (version > acknowledged) acknowledged = version;
}

/** True when `version` is new to this client and its cache needs refreshing. */
export function isUnseenVersion(version: number): boolean {
	return version > acknowledged;
}
