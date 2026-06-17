import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { getTaskCreateAutocomplete } from "@/lib/parsing/input-autocomplete";
import { parseTaskCreateInput } from "@/lib/parsing/parse-task-create-input";

import { useHotkeyScope } from "../lib/hotkeys";
import { useProjects, useTaskMutations } from "../lib/queries";
import { useUi } from "../state/ui";
import { QuickAddPills } from "./QuickAddPills";
import { type Segment, tokenizeQuickAdd } from "./quick-add-highlight";

// Pill styling for recognized tokens rendered inline in the editor.
const PILL_CLASS = "mx-[3px] rounded bg-accent/20 px-1.5 py-0.5 text-accent";

/** Character offset of the caret within a contentEditable root, or null. */
function getCaretOffset(root: HTMLElement): number | null {
	const sel = window.getSelection();
	if (!sel || sel.rangeCount === 0) return null;
	const range = sel.getRangeAt(0);
	if (!root.contains(range.endContainer)) return null;
	const pre = range.cloneRange();
	pre.selectNodeContents(root);
	pre.setEnd(range.endContainer, range.endOffset);
	return pre.toString().length;
}

/** Place the caret at a character offset within a contentEditable root. */
function setCaretOffset(root: HTMLElement, offset: number) {
	const sel = window.getSelection();
	if (!sel) return;
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	let remaining = offset;
	let target: Text | null = null;
	let pos = 0;
	let node = walker.nextNode();
	while (node) {
		const len = (node as Text).length;
		if (remaining <= len) {
			target = node as Text;
			pos = remaining;
			break;
		}
		remaining -= len;
		node = walker.nextNode();
	}
	const range = document.createRange();
	if (target) {
		range.setStart(target, pos);
	} else {
		range.selectNodeContents(root);
		range.collapse(false);
	}
	range.collapse(true);
	sel.removeAllRanges();
	sel.addRange(range);
}

/** Rebuild the editor's children from tokenized segments. */
function renderSegments(root: HTMLElement, segments: Segment[]) {
	root.textContent = "";
	for (const seg of segments) {
		if (seg.kind) {
			const span = document.createElement("span");
			span.className = PILL_CLASS;
			span.textContent = seg.text;
			root.appendChild(span);
		} else {
			root.appendChild(document.createTextNode(seg.text));
		}
	}
}

/**
 * Quick-add bar using the same token syntax as the TUI:
 *   Ship docs project:Work p1 due:today scheduled:tomorrow recurs:weekly
 * Tab accepts the autocomplete suggestion; Enter submits; Esc closes.
 *
 * The field is a contentEditable so recognized tokens can render as real,
 * padded/spaced pills inline. Caret position is preserved across re-renders.
 */
export function QuickAdd() {
	const ui = useUi();
	const { data: projects = [] } = useProjects();
	const { createTask } = useTaskMutations();
	const [value, setValue] = useState("");
	const editorRef = useRef<HTMLDivElement>(null);
	// Caret offset to restore after the next segment-driven re-render (typing).
	const pendingCaretRef = useRef<number | null>(null);

	const open = ui.quickAdd !== null;
	const parentTask = ui.quickAdd?.parentTask;

	useEffect(() => {
		if (open) {
			setValue("");
			requestAnimationFrame(() => editorRef.current?.focus());
		}
	}, [open]);

	const parsed = useMemo(
		() => (value.trim() ? parseTaskCreateInput(value, projects) : null),
		[value, projects],
	);

	const suggestion = useMemo(
		() => (value ? getTaskCreateAutocomplete(value, projects) : null),
		[value, projects],
	);

	const segments = useMemo(
		() => tokenizeQuickAdd(value, projects),
		[value, projects],
	);

	// Keep the contentEditable DOM in sync with the tokenized segments, then
	// restore the caret (to the typed position, or the end for external edits).
	useLayoutEffect(() => {
		const root = editorRef.current;
		if (!root) return;
		renderSegments(root, segments);
		if (document.activeElement === root) {
			const caret = pendingCaretRef.current ?? value.length;
			setCaretOffset(root, caret);
		}
		pendingCaretRef.current = null;
	}, [segments, value.length]);

	const setValueFromPills = (next: string) => {
		pendingCaretRef.current = next.length;
		setValue(next);
	};

	const submit = () => {
		if (!parsed || parsed.errors.length > 0) {
			toast.error(parsed?.errors[0] ?? "Task title is required");
			return;
		}
		const inboxId = projects.find((p) => p.isInbox)?.id;
		const projectId =
			parentTask?.projectId ??
			parsed.input.projectId ??
			ui.quickAdd?.projectId ??
			inboxId;
		if (!projectId || !parsed.input.title) {
			toast.error("No project available for this task");
			return;
		}
		createTask.mutate(
			{
				...parsed.input,
				title: parsed.input.title,
				projectId,
				parentTaskId: parentTask?.id ?? null,
			},
			{
				onSuccess: (task) => {
					toast.success(`Added "${task.title}"`);
					ui.closeQuickAdd();
				},
				onError: (err) => toast.error(err.message),
			},
		);
	};

	// Escape stays on the global scope; Enter/Tab are handled on the editor so
	// we can preventDefault before the browser inserts a newline / moves focus.
	useHotkeyScope(
		{
			escape: () => ui.closeQuickAdd(),
		},
		{ enabled: open, allowInInput: true },
	);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			submit();
		} else if (e.key === "Tab") {
			if (suggestion) {
				e.preventDefault();
				setValueFromPills(suggestion.nextValue);
			}
		} else if (e.key === "Escape") {
			e.preventDefault();
			ui.closeQuickAdd();
		}
	};

	const handleInput = () => {
		const root = editorRef.current;
		if (!root) return;
		pendingCaretRef.current = getCaretOffset(root);
		setValue(root.textContent ?? "");
	};

	if (!open) return null;

	return (
		<div className="fixed inset-x-0 top-0 z-50 flex justify-center p-4">
			<div className="w-full max-w-2xl rounded-lg border border-border bg-surface-raised shadow-2xl">
				<div className="px-4 pt-3 text-xs text-muted">
					{parentTask ? `New subtask of "${parentTask.title}"` : "New task"}
				</div>
				{/* biome-ignore lint/a11y/useSemanticElements: a rich token editor needs contentEditable, not a plain input */}
				<div
					ref={editorRef}
					contentEditable
					suppressContentEditableWarning
					role="textbox"
					tabIndex={0}
					aria-label="New task"
					data-placeholder="Ship docs project:Work p1 due:today recurs:weekly"
					onInput={handleInput}
					onKeyDown={handleKeyDown}
					className="w-full whitespace-pre-wrap break-words px-4 py-3 text-base leading-relaxed caret-foreground outline-none empty:before:text-muted/60 empty:before:content-[attr(data-placeholder)]"
				/>
				{value.trim() ? (
					<QuickAddPills
						value={value}
						onChange={setValueFromPills}
						projects={projects}
						parsed={parsed}
					/>
				) : null}
				<div className="flex min-h-8 items-center gap-3 border-t border-border px-4 py-1.5 text-xs">
					{suggestion ? (
						<span className="text-accent">tab → {suggestion.hint}</span>
					) : null}
					{parsed?.warnings.map((warning) => (
						<span key={warning} className="text-p2">
							{warning}
						</span>
					))}
					{parsed?.errors.map((error) => (
						<span key={error} className="text-p1">
							{error}
						</span>
					))}
					<span className="ml-auto text-muted">
						enter to add · esc to close
					</span>
				</div>
			</div>
		</div>
	);
}
