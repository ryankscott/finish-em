import { useCallback, useEffect, useMemo, useState } from "react";

import type { StatusMessageTone } from "../StatusMessage";
import type { ToastMessage } from "../ToastStack";

export const TOAST_TTL_MS = 5000;
export const MAX_TOASTS = 4;

export type ToastWithExpiry = ToastMessage & { expiresAt: number };

export function addToast(
	state: ToastWithExpiry[],
	text: string,
	tone: StatusMessageTone,
	now: number,
	id: number,
): ToastWithExpiry[] {
	const toast: ToastWithExpiry = {
		id,
		text,
		tone,
		expiresAt: now + TOAST_TTL_MS,
	};
	return [...state, toast].slice(-MAX_TOASTS);
}

export function pruneExpiredToasts(
	state: ToastWithExpiry[],
	now: number,
): ToastWithExpiry[] {
	const next = state.filter((t) => t.expiresAt > now);
	// Preserve reference when nothing expired so React bails out of re-render
	return next.length === state.length ? state : next;
}

export function toastsToVisible(toasts: ToastWithExpiry[]): ToastMessage[] {
	return toasts.map(({ id, text, tone }) => ({ id, text, tone }));
}

type UseToastsResult = {
	visibleToasts: ToastMessage[];
	pushToast: (text: string, tone?: StatusMessageTone) => void;
};

export function useToasts(): UseToastsResult {
	const [toasts, setToasts] = useState<ToastWithExpiry[]>([]);

	const pushToast = useCallback(
		(text: string, tone: StatusMessageTone = "info") => {
			const now = Date.now();
			const id = now + Math.floor(Math.random() * 1000);
			setToasts((current) => addToast(current, text, tone, now, id));
		},
		[],
	);

	// Only run the prune interval while toasts are present. With no toasts
	// there is nothing to prune and ticking would trigger needless re-renders.
	const hasToasts = toasts.length > 0;
	useEffect(() => {
		if (!hasToasts) return;
		const timer = setInterval(() => {
			setToasts((current) => pruneExpiredToasts(current, Date.now()));
		}, 400);
		return () => clearInterval(timer);
	}, [hasToasts]);

	const visibleToasts = useMemo(() => toastsToVisible(toasts), [toasts]);

	return { visibleToasts, pushToast };
}
