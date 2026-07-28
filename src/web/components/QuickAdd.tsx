import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { getTaskCreateAutocomplete } from "@/lib/parsing/input-autocomplete";
import { parseTaskCreateInput } from "@/lib/parsing/parse-task-create-input";

import { cn } from "../lib/cn";
import { useHotkeyScope } from "../lib/hotkeys";
import { useProjects, useTaskMutations } from "../lib/queries";
import { useIsMobile } from "../lib/use-is-mobile";
import { useKeyboardInset } from "../lib/use-viewport-inset";
import { useUi } from "../state/ui";
import { ProjectPickerSheet } from "./ProjectPickerSheet";
import {
	insertToken,
	QuickAddPills,
	removeAnyProjectToken,
} from "./QuickAddPills";
import { type Segment, tokenizeQuickAdd } from "./quick-add-highlight";

// Pill styling for recognized tokens rendered inline in the editor.
const PILL_CLASS =
	"mx-[3px] rounded bg-p4/15 px-1.5 py-0.5 font-medium text-p4";

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
	const isMobile = useIsMobile();
	const keyboardInset = useKeyboardInset();
	const { data: projects = [] } = useProjects();
	const { createTask } = useTaskMutations();
	const [value, setValue] = useState("");
	const editorRef = useRef<HTMLDivElement>(null);
	// Caret offset to restore after the next segment-driven re-render (typing).
	const pendingCaretRef = useRef<number | null>(null);

	const open = ui.quickAdd !== null;
	const parentTask = ui.quickAdd?.parentTask;
	const keyboardUp = keyboardInset > 0;
	const [projectPickerOpen, setProjectPickerOpen] = useState(false);

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
		<div
			className={
				isMobile
					? "fixed inset-0 z-50 flex flex-col bg-surface-raised"
					: "fixed inset-x-0 top-0 z-50 flex justify-center p-4"
			}
			// Shrink to the space above the keyboard rather than sitting behind
			// it, so the option pills and Add/Cancel stay reachable while typing.
			style={
				isMobile && keyboardInset > 0
					? { bottom: `${keyboardInset}px` }
					: undefined
			}
		>
			<div
				className={
					isMobile
						? "flex h-full w-full flex-col"
						: "w-full max-w-2xl rounded-lg border border-border bg-surface-raised shadow-2xl"
				}
			>
				<div
					className={
						isMobile
							? "flex items-center px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 text-sm text-muted"
							: "px-4 pt-3 text-xs text-muted"
					}
				>
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
					// autocorrect/autocapitalize off: iOS would "fix" the token syntax,
					// turning project:Work into Project:work and breaking the parse.
					// enterKeyHint makes the iOS return key read "done" rather than a
					// newline affordance the editor does not honour anyway.
					autoCorrect="off"
					autoCapitalize="off"
					spellCheck={false}
					enterKeyHint="done"
					onInput={handleInput}
					onKeyDown={handleKeyDown}
					className={cn(
						"w-full whitespace-pre-wrap break-words px-4 py-3 text-base leading-relaxed caret-foreground outline-none empty:before:text-muted/60 empty:before:content-[attr(data-placeholder)]",
						// With the keyboard down the editor fills the sheet, so tapping
						// anywhere lands in the field. With it up, vertical space is
						// scarce: the editor gives way to a couple of lines and the
						// options below become the scrollable region instead.
						isMobile && !keyboardUp && "flex-1",
						isMobile && keyboardUp && "max-h-32 shrink-0 overflow-y-auto",
					)}
				/>
				{value.trim() ? (
					<div
						className={cn(
							isMobile && keyboardUp && "min-h-0 flex-1 overflow-y-auto",
							isMobile && !keyboardUp && "shrink-0",
						)}
					>
						<QuickAddPills
							value={value}
							onChange={setValueFromPills}
							projects={projects}
							parsed={parsed}
							isMobile={isMobile}
							onPickProject={() => setProjectPickerOpen(true)}
						/>
					</div>
				) : null}
				<div
					className={
						isMobile
							? "flex flex-col gap-3 border-t border-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] text-xs"
							: "flex min-h-8 items-center gap-3 border-t border-border px-4 py-1.5 text-xs"
					}
				>
					<div className={isMobile ? "flex flex-col gap-1" : "contents"}>
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
					</div>
					{isMobile ? (
						// A phone has no Esc key and the sheet has no backdrop to tap, so
						// without these the only way out is a keyboard that may not be
						// showing. Also gives Add a visible target rather than relying on
						// the return key. Stacked full-width: Add is the primary action a
						// thumb should hit without precision, Cancel sits below it.
						<div className="flex flex-col gap-2">
							<button
								type="button"
								onClick={submit}
								className="min-h-[44px] w-full rounded-md bg-accent px-3 font-medium text-background"
							>
								Add
							</button>
							<button
								type="button"
								onClick={() => ui.closeQuickAdd()}
								className="min-h-[44px] w-full px-3 text-muted"
							>
								Cancel
							</button>
						</div>
					) : null}
				</div>
			</div>
			{isMobile ? (
				<ProjectPickerSheet
					open={projectPickerOpen}
					onOpenChange={setProjectPickerOpen}
					projects={projects}
					selectedId={parsed?.input.projectId}
					onSelect={(project) => {
						// Rewrite the token rather than tracking project in separate
						// state -- the text is the single source of truth here, so the
						// pills and the editor can't disagree.
						setValueFromPills(
							insertToken(
								removeAnyProjectToken(value),
								`project:${project.name}`,
							),
						);
					}}
				/>
			) : null}
		</div>
	);
}
