import { useState } from "react";
import { toast } from "sonner";

import type { CalendarEvent } from "@/server/types";

import { useCalendarMutations, useProjects, useTaskMutations } from "./queries";

/**
 * Shared "create a todo from a calendar meeting" flow used by both the Calendar
 * view and the Planning view. Creates a task in the inbox project and links it
 * to the event, which pins the todo's due date to the meeting start.
 */
export function useAddTodoFromEvent() {
	const { data: projects = [] } = useProjects();
	const { createTask } = useTaskMutations();
	const { linkTaskToEvent } = useCalendarMutations();
	const [addingUid, setAddingUid] = useState<string | null>(null);

	const onAddTodo = async (event: CalendarEvent) => {
		const projectId =
			projects.find((p) => p.isInbox)?.id ?? projects[0]?.id ?? null;
		if (projectId === null) {
			toast.error("No project available to add the todo to.");
			return;
		}
		setAddingUid(event.uid);
		try {
			const task = await createTask.mutateAsync({
				projectId,
				title: event.summary,
			});
			// Linking pins the todo's due date to the meeting start, so the todo
			// depends on ("finish before") this calendar item.
			await linkTaskToEvent.mutateAsync({
				taskId: task.id,
				eventUid: event.uid,
			});
			toast.success(`Added todo for “${event.summary}”`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to add todo");
		} finally {
			setAddingUid(null);
		}
	};

	return { onAddTodo, addingUid };
}
