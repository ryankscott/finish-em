import { useCallback, useRef } from "react";

import { executeUndo, type UndoRecord } from "../../shared/undo";
import type { ApiClient } from "../api-client";

const MAX_UNDO_STACK = 50;

type UseUndoParams = {
	api: ApiClient;
	loadData: () => Promise<void>;
	setStatusText: (text: string) => void;
	setErrorText: (text: string | null) => void;
};

export type UseUndoResult = {
	recordUndo: (record: UndoRecord) => void;
	undoLast: () => Promise<void>;
};

/**
 * In-memory undo stack for the TUI session. Records are reversed through the
 * existing API client; nothing is persisted to the database.
 */
export function useUndo({
	api,
	loadData,
	setStatusText,
	setErrorText,
}: UseUndoParams): UseUndoResult {
	const stackRef = useRef<UndoRecord[]>([]);

	const recordUndo = useCallback((record: UndoRecord) => {
		stackRef.current.push(record);
		if (stackRef.current.length > MAX_UNDO_STACK) stackRef.current.shift();
	}, []);

	const undoLast = useCallback(async () => {
		const record = stackRef.current.pop();
		if (!record) {
			setStatusText("Nothing to undo");
			return;
		}
		setErrorText(null);
		try {
			const message = await executeUndo(api, record);
			await loadData();
			setStatusText(message);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
		}
	}, [api, loadData, setErrorText, setStatusText]);

	return { recordUndo, undoLast };
}
