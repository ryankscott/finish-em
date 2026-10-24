import { Check, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { Goal } from "@/server/types";
import { cn } from "../lib/cn";
import { useGoalMutations, useGoals } from "../lib/queries";

function GoalRow({ goal }: { goal: Goal }) {
	const checkboxId = useId();
	const { updateGoal, deleteGoal } = useGoalMutations();
	const [editing, setEditing] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
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
	const save = () => {
		const next = title.trim();
		if (!next || updateGoal.isPending) return;
		updateGoal.mutate(
			{
				goalId: goal.id,
				input: { title: next },
				before: { title: goal.title },
				label: goal.title,
			},
			{
				onSuccess: () => setEditing(false),
				onError: (err) => toast.error(err.message),
			},
		);
	};
	return (
		<div className="flex min-h-14 items-start gap-2 border-b border-border py-2">
			{editing ? (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						save();
					}}
					className="flex min-w-0 flex-1 items-center gap-1"
				>
					<input
						aria-label="Goal title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-2 text-base"
						required
					/>
					<button
						type="submit"
						disabled={updateGoal.isPending}
						aria-label="Save goal"
						className="flex size-11 shrink-0 items-center justify-center text-accent"
					>
						<Check className="size-4" />
					</button>
					<button
						type="button"
						aria-label="Cancel goal edit"
						onClick={() => setEditing(false)}
						className="flex size-11 shrink-0 items-center justify-center text-muted"
					>
						<X className="size-4" />
					</button>
				</form>
			) : (
				<>
					<label
						htmlFor={checkboxId}
						className="flex min-h-11 min-w-0 flex-1 items-start gap-3 py-2.5"
					>
						<Checkbox
							id={checkboxId}
							checked={goal.done}
							onCheckedChange={(checked) => toggle(checked === true)}
							aria-label={`Complete ${goal.title}`}
							disabled={updateGoal.isPending}
							className="mt-0.5 shrink-0"
						/>
						<span
							className={cn(
								"min-w-0 break-words text-xs leading-relaxed",
								goal.done && "text-muted line-through",
							)}
						>
							{goal.title}
						</span>
					</label>
					<Popover open={menuOpen} onOpenChange={setMenuOpen}>
						<PopoverTrigger asChild>
							<button
								type="button"
								aria-label={`Actions for goal ${goal.title}`}
								className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface"
							>
								<MoreHorizontal className="size-4" />
							</button>
						</PopoverTrigger>
						<PopoverContent
							align="end"
							className="w-40 rounded-xl bg-surface-raised p-1"
						>
							<button
								type="button"
								onClick={() => {
									setTitle(goal.title);
									setEditing(true);
									setMenuOpen(false);
								}}
								className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-xs hover:bg-surface"
							>
								<Pencil className="size-3.5" />
								Edit goal
							</button>
							<button
								type="button"
								disabled={deleteGoal.isPending}
								onClick={() =>
									deleteGoal.mutate(goal, {
										onSuccess: () => setMenuOpen(false),
										onError: (err) => toast.error(err.message),
									})
								}
								className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-xs text-p1 hover:bg-surface"
							>
								<Trash2 className="size-3.5" />
								Delete goal
							</button>
						</PopoverContent>
					</Popover>
				</>
			)}
		</div>
	);
}

export function GoalsPanel({
	periodType,
	periodStart,
	addSignal = 0,
	className,
	showHeading = true,
}: {
	periodType: "daily" | "weekly";
	periodStart: string;
	addSignal?: number;
	className?: string;
	showHeading?: boolean;
}) {
	const { data: goals = [] } = useGoals({ periodType, periodStart });
	const { createGoal } = useGoalMutations();
	const [value, setValue] = useState("");
	const id = useId();
	useEffect(() => {
		if (addSignal > 0) document.getElementById(id)?.focus();
	}, [addSignal, id]);
	return (
		<fieldset
			className={cn("p-4", className)}
			onKeyDown={(e) => {
				if (e.key !== "Escape") e.stopPropagation();
			}}
			aria-label="Goal checklist"
		>
			{showHeading && (
				<h2 className="mb-2 text-sm font-medium">
					{periodType === "daily" ? "Daily goals" : "Weekly goals"}
				</h2>
			)}
			{goals.map((goal) => (
				<GoalRow key={goal.id} goal={goal} />
			))}
			{goals.length === 0 && (
				<p className="py-3 text-xs text-muted">
					What would make this {periodType === "daily" ? "day" : "week"} a good
					one?
				</p>
			)}
			<form
				className="mt-4 flex items-center gap-2"
				onSubmit={(e) => {
					e.preventDefault();
					const title = value.trim();
					if (!title || createGoal.isPending) return;
					createGoal.mutate(
						{ periodType, periodStart, title },
						{
							onSuccess: () => {
								setValue("");
								document.getElementById(id)?.focus();
							},
							onError: (err) => toast.error(err.message),
						},
					);
				}}
			>
				<input
					id={id}
					aria-label="New goal"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="Add a goal…"
					required
					className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-base"
				/>
				<Button
					type="submit"
					disabled={createGoal.isPending}
					aria-label="Add goal"
					className="size-11 p-0"
				>
					<Plus className="size-4" />
				</Button>
			</form>
		</fieldset>
	);
}
