/**
 * Scope-stack hotkey system. Scopes register on mount (global → list → modal);
 * a key event is offered to the topmost scope first and stops at the first
 * handler that consumes it. Bindings use the same notation as the TUI help
 * modal: single keys ('x', '?', '['), 'mod+k', 'shift+s', and 'escape'.
 */

import { createContext, useContext, useEffect, useMemo, useRef } from "react";

export type HotkeyHandler = (event: KeyboardEvent) => boolean | void;

export type HotkeyMap = Record<string, HotkeyHandler>;

type Scope = {
	id: number;
	mapRef: { current: HotkeyMap };
	allowInInput: boolean;
};

type Registry = {
	push: (scope: Scope) => void;
	remove: (id: number) => void;
};

const HotkeyContext = createContext<Registry | null>(null);

function eventKey(event: KeyboardEvent): string {
	const parts: string[] = [];
	if (event.metaKey || event.ctrlKey) parts.push("mod");
	if (event.shiftKey && event.key.length > 1) parts.push("shift");
	const key = event.key === " " ? "space" : event.key.toLowerCase();
	parts.push(key);
	return parts.join("+");
}

function isTextInput(target: EventTarget | null): boolean {
	const el = target as HTMLElement | null;
	if (!el) return false;
	const tag = el.tagName?.toLowerCase();
	return (
		tag === "input" ||
		tag === "textarea" ||
		tag === "select" ||
		el.isContentEditable
	);
}

let nextScopeId = 1;

export function HotkeyProvider({ children }: { children: React.ReactNode }) {
	const scopesRef = useRef<Scope[]>([]);

	useEffect(() => {
		// Debug handle for inspecting the scope stack from the console.
		(window as unknown as { __hotkeyScopes?: unknown }).__hotkeyScopes =
			scopesRef;
		const listener = (event: KeyboardEvent) => {
			const key = eventKey(event);
			const inInput = isTextInput(event.target);
			const scopes = scopesRef.current;
			for (let i = scopes.length - 1; i >= 0; i--) {
				const scope = scopes[i];
				if (!scope) continue;
				if (inInput && !scope.allowInInput && key !== "escape") continue;
				const handler = scope.mapRef.current[key];
				if (!handler) continue;
				const consumed = handler(event);
				if (consumed !== false) {
					event.preventDefault();
					event.stopPropagation();
					return;
				}
			}
		};
		window.addEventListener("keydown", listener);
		return () => window.removeEventListener("keydown", listener);
	}, []);

	const registry = useMemo<Registry>(
		() => ({
			push: (scope) => {
				scopesRef.current = [...scopesRef.current, scope];
			},
			remove: (id) => {
				scopesRef.current = scopesRef.current.filter((s) => s.id !== id);
			},
		}),
		[],
	);

	return (
		<HotkeyContext.Provider value={registry}>{children}</HotkeyContext.Provider>
	);
}

export function useHotkeyScope(
	map: HotkeyMap,
	options: { enabled?: boolean; allowInInput?: boolean } = {},
) {
	const registry = useContext(HotkeyContext);
	if (!registry) throw new Error("useHotkeyScope requires HotkeyProvider");

	const { enabled = true, allowInInput = false } = options;
	const mapRef = useRef(map);
	mapRef.current = map;

	useEffect(() => {
		if (!enabled) return;
		const scope: Scope = { id: nextScopeId++, mapRef, allowInInput };
		registry.push(scope);
		return () => registry.remove(scope.id);
	}, [registry, enabled, allowInInput]);
}
