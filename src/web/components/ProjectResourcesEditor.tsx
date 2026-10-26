import { Plus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectResourceInput } from "@/server/types";
import { resourceError } from "../lib/project-resources";
import { ProjectResourceContent } from "./ProjectResourceContent";

export function ProjectResourcesEditor({
	resources,
	onChange,
}: {
	resources: ProjectResourceInput[];
	onChange: (resources: ProjectResourceInput[]) => void;
}) {
	const id = useId();
	const [editing, setEditing] = useState<{
		index: number;
		original: ProjectResourceInput | null;
	} | null>(null);
	const [error, setError] = useState("");
	const row = editing ? resources[editing.index] : null;
	const labelRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (editing) labelRef.current?.focus();
	}, [editing]);
	const done = () => {
		if (!row) return;
		const message = resourceError(row);
		setError(message ?? "");
		if (!message) setEditing(null);
	};
	const cancel = () => {
		if (!editing) return;
		const original = editing.original;
		onChange(
			original
				? resources.map((r, i) => (i === editing.index ? original : r))
				: resources.filter((_, i) => i !== editing.index),
		);
		setEditing(null);
		setError("");
	};
	return (
		<section className="mt-4" aria-label="Project resources">
			<div className="flex items-center justify-between gap-2">
				<h3 className="text-xs font-medium">
					Resources <span className="ml-1 text-muted">{resources.length}</span>
				</h3>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="min-h-11 px-2 text-xs"
					disabled={editing !== null}
					onClick={() => {
						setEditing({ index: resources.length, original: null });
						setError("");
						onChange([...resources, { label: "", url: "" }]);
					}}
				>
					<Plus />
					Add link
				</Button>
			</div>
			{resources.length === 0 && (
				<p className="py-2 text-xs text-muted">No links yet.</p>
			)}
			{resources.map((resource, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: edits keep the same row order and active editor is closed before removal
					key={index}
					className="flex items-center gap-1 border-b border-border"
				>
					<button
						type="button"
						aria-label={`Edit ${resource.label || "untitled link"}`}
						disabled={editing !== null}
						className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-md py-2 text-left hover:bg-surface disabled:opacity-60"
						onClick={() => {
							setEditing({ index, original: { ...resource } });
							setError("");
						}}
					>
						<ProjectResourceContent {...resource} />
					</button>
					<Button
						type="button"
						variant="ghost"
						aria-label={`Remove ${resource.label || "untitled link"}`}
						disabled={editing !== null}
						className="size-11 shrink-0 px-0 text-muted"
						onClick={() => onChange(resources.filter((_, i) => i !== index))}
					>
						<X />
					</Button>
				</div>
			))}
			{editing && row && (
				<div className="grid gap-2 py-3">
					<label htmlFor={`${id}-label`} className="text-xs text-muted">
						Link name
					</label>
					<Input
						id={`${id}-label`}
						ref={labelRef}
						value={row.label}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
								e.preventDefault();
								done();
							}
						}}
						placeholder="e.g. Project brief"
						onChange={(e) =>
							onChange(
								resources.map((r, i) =>
									i === editing.index ? { ...r, label: e.target.value } : r,
								),
							)
						}
					/>
					<label htmlFor={`${id}-url`} className="mt-1 text-xs text-muted">
						URL
					</label>
					<Input
						id={`${id}-url`}
						value={row.url}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
								e.preventDefault();
								done();
							}
						}}
						placeholder="https://…"
						inputMode="url"
						autoCapitalize="off"
						autoCorrect="off"
						onChange={(e) =>
							onChange(
								resources.map((r, i) =>
									i === editing.index ? { ...r, url: e.target.value } : r,
								),
							)
						}
					/>
					{error && (
						<p role="alert" className="text-xs text-p1">
							{error}
						</p>
					)}
					<div className="flex justify-end gap-2">
						<Button type="button" variant="ghost" onClick={cancel}>
							Cancel
						</Button>
						<Button type="button" onClick={done}>
							Done
						</Button>
					</div>
				</div>
			)}
		</section>
	);
}
