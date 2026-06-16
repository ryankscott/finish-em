import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import type { Goal } from "@/server/types";

import { cn } from "../lib/cn";
import { useGoalMutations, useGoals } from "../lib/queries";

function GoalRow({ goal }: { goal: Goal }) {
	const { updateGoal, deleteGoal } = useGoalMutations();
	const [editing, setEditing] = useState(false);
	const [title, setTitle] = useState(goal.title);

	const toggle = (checked: boolean) =>
		updateGoal.mutate(
			{
				goalId: goal.id,
				input: { done: checked },
				before: { done: goal.done },
				label: goal.title,
			},
			{ onError: (err) => toast.error(err.message) },
		);

	const saveTitle = () => {
		const next = title.trim();
		setEditing(false);
		if (!next || next === goal.title) {
			setTitle(goal.title);
			return;
		}
		updateGoal.mutate(
			{
				goalId: goal.id,
				input: { title: next },
				before: { title: goal.title },
				label: goal.title,
			},
			{ onError: (err) => toast.error(err.message) },
		);
	};

	return (
		<div className="group flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-surface">
			<Checkbox
				checked={goal.done}
				onCheckedChange={toggle}
				aria-label="Toggle goal"
				className="shrink-0"
			/>
			{editing ? (
				<input
					value={title}
					autoFocus
					onChange={(e) => setTitle(e.target.value)}
					onBlur={saveTitle}
					onKeyDown={(e) => {
						if (e.key === "Enter") saveTitle();
						if (e.key === "Escape") {
							setTitle(goal.title);
							setEditing(false);
						}
					}}
					className="min-w-0 flex-1 rounded border border-border bg-surface px-1.5 py-0.5 outline-none focus:border-accent"
				/>
			) : (
				<span
					className={cn(
						"min-w-0 flex-1 truncate",
						goal.done && "text-muted line-through",
					)}
				>
					{goal.title}
				</span>
			)}
			<button
				type="button"
				aria-label="Edit goal"
				onClick={() => {
					setTitle(goal.title);
					setEditing(true);
				}}
				className="hidden text-muted hover:text-foreground group-hover:block"
			>
				<Pencil className="h-3.5 w-3.5" />
			</button>
			<button
				type="button"
				aria-label="Delete goal"
				onClick={() =>
					deleteGoal.mutate(goal, {
						onError: (err) => toast.error(err.message),
					})
				}
				className="hidden text-muted hover:text-p1 group-hover:block"
			>
				<Trash2 className="h-3.5 w-3.5" />
			</button>
		</div>
	);
}

export function GoalsPanel({
	periodType,
	periodStart,
	addSignal = 0,
	className,
}: {
	periodType: "daily" | "weekly";
	periodStart: string;
	/** Increment from the parent (e.g. the `g` shortcut) to start adding a goal. */
	addSignal?: number;
	className?: string;
}) {
	const { data: goals = [] } = useGoals({ periodType, periodStart });
	const { createGoal } = useGoalMutations();
	const [adding, setAdding] = useState(false);
	const [value, setValue] = useState("");

	useEffect(() => {
		if (addSignal > 0) setAdding(true);
	}, [addSignal]);

	const submit = () => {
		const title = value.trim();
		if (!title) {
			setAdding(false);
			return;
		}
		createGoal.mutate(
			{ periodType, periodStart, title },
			{
				onSuccess: () => {
					setValue("");
					setAdding(false);
				},
				onError: (err) => toast.error(err.message),
			},
		);
	};

	return (
		<div className={cn("p-3", className)}>
			<div className="mb-2 flex items-center text-[11px] font-semibold tracking-wide text-muted uppercase">
				<span>{periodType === "daily" ? "Daily goals" : "Weekly goals"}</span>
				<button
					type="button"
					aria-label="Add goal"
					onClick={() => setAdding(true)}
					className="ml-auto text-muted hover:text-foreground"
				>
					<Plus className="h-3.5 w-3.5" />
				</button>
			</div>
			<div className="flex flex-col gap-0.5">
				{goals.map((goal) => (
					<GoalRow key={goal.id} goal={goal} />
				))}
				{goals.length === 0 && !adding ? (
					<p className="px-2 py-1 text-xs text-muted">No goals yet</p>
				) : null}
				{adding ? (
					<div className="flex items-center gap-1 px-2 py-1">
						<input
							value={value}
							autoFocus
							placeholder="New goal"
							onChange={(e) => setValue(e.target.value)}
							onBlur={submit}
							onKeyDown={(e) => {
								if (e.key === "Enter") submit();
								if (e.key === "Escape") {
									setValue("");
									setAdding(false);
								}
							}}
							className="min-w-0 flex-1 rounded border border-border bg-surface px-1.5 py-0.5 text-sm outline-none focus:border-accent"
						/>
						<button
							type="button"
							aria-label="Cancel"
							onClick={() => {
								setValue("");
								setAdding(false);
							}}
							className="text-muted hover:text-foreground"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</div>
				) : null}
			</div>
		</div>
	);
}
