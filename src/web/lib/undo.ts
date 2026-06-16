import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import { executeUndo, type UndoRecord } from "@/shared/undo";

import { api } from "./api";

const MAX_UNDO_STACK = 50;

// Session-scoped, in-memory undo stack. Shared across the web app; nothing is
// persisted to the database and there is no dedicated undo endpoint.
const stack: UndoRecord[] = [];

export function recordUndo(record: UndoRecord): void {
	stack.push(record);
	if (stack.length > MAX_UNDO_STACK) stack.shift();
}

export function clearUndo(): void {
	stack.length = 0;
}

export function useUndo() {
	const queryClient = useQueryClient();

	const undoLast = useCallback(async () => {
		const record = stack.pop();
		if (!record) {
			toast.info("Nothing to undo");
			return;
		}
		try {
			const message = await executeUndo(api, record);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["tasks"] }),
				queryClient.invalidateQueries({ queryKey: ["projects"] }),
				queryClient.invalidateQueries({ queryKey: ["goals"] }),
				queryClient.invalidateQueries({ queryKey: ["reminders"] }),
			]);
			toast.success(message);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : String(error));
		}
	}, [queryClient]);

	return { undoLast };
}
