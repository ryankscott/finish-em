import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { checkSession, login, setUnauthorizedHandler } from "../lib/api";

/**
 * Password gate in front of the app.
 *
 * Renders nothing when the API is open (no FINISH_EM_AUTH_SECRET configured),
 * so local development is unaffected. Otherwise it blocks the shell until a
 * successful login, and re-arms whenever any request returns 401 -- which
 * happens when the session cookie is evicted or the secret is rotated.
 */
export function LoginGate({ children }: { children: React.ReactNode }) {
	const queryClient = useQueryClient();
	const [authenticated, setAuthenticated] = useState<boolean | null>(null);
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		checkSession().then(setAuthenticated);
		setUnauthorizedHandler(() => setAuthenticated(false));
		return () => setUnauthorizedHandler(null);
	}, []);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);

		const ok = await login(password);
		setSubmitting(false);

		if (!ok) {
			setError("Incorrect password");
			return;
		}

		setPassword("");
		setAuthenticated(true);
		// Queries that failed while locked out are cached as errors; drop them so
		// the app repopulates instead of showing stale failures.
		queryClient.clear();
	}

	// Unknown yet: render nothing rather than flashing the login form at someone
	// who already has a valid session.
	if (authenticated === null) {
		return null;
	}

	if (authenticated) {
		return <>{children}</>;
	}

	return (
		<div className="flex h-dvh items-center justify-center bg-background p-6">
			<form
				onSubmit={handleSubmit}
				className="flex w-full max-w-xs flex-col gap-4"
			>
				<div className="flex flex-col gap-1">
					<h1 className="font-medium text-lg">finish-em</h1>
					<p className="text-muted text-sm">Enter your password to continue.</p>
				</div>

				<div className="relative">
					<Input
						type={showPassword ? "text" : "password"}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						autoFocus
						// iOS zooms the viewport on focus for anything under 16px.
						className="pr-10 text-base"
						autoComplete="current-password"
						aria-label="Password"
					/>
					<button
						type="button"
						onClick={() => setShowPassword((v) => !v)}
						className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-foreground"
						aria-label={showPassword ? "Hide password" : "Show password"}
						tabIndex={-1}
					>
						{showPassword ? (
							<EyeOff className="size-4" />
						) : (
							<Eye className="size-4" />
						)}
					</button>
				</div>

				{error ? (
					<p className="text-p1 text-sm" role="alert">
						{error}
					</p>
				) : null}

				<Button type="submit" disabled={submitting || password.length === 0}>
					{submitting ? "Signing in…" : "Sign in"}
				</Button>
			</form>
		</div>
	);
}
