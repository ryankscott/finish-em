import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createTaskFromQuickAdd } from "@/server/services/quick-add";

export const DEFAULT_INBOX_DIR = path.join(
	os.homedir(),
	"Library",
	"Mobile Documents",
	"com~apple~CloudDocs",
	"finish-em",
  "inbox"
);

export type InboxImportResult = {
	imported: number;
	failed: number;
	errors: string[];
};

export async function processInbox(
	inboxDir?: string,
): Promise<InboxImportResult> {
	const dir = inboxDir ?? DEFAULT_INBOX_DIR;

	if (!fs.existsSync(dir)) {
		return { imported: 0, failed: 0, errors: [] };
	}

	let files: string[];
	try {
		files = fs
			.readdirSync(dir)
			.filter((f) => f.endsWith(".txt") && !f.startsWith("."));
	} catch {
		return { imported: 0, failed: 0, errors: [] };
	}

	let imported = 0;
	let failed = 0;
	const errors: string[] = [];

	for (const file of files) {
		const filePath = path.join(dir, file);

		let contents: string;
		try {
			contents = fs.readFileSync(filePath, "utf8").trim();
		} catch (err) {
			failed++;
			errors.push(
				`Read error for ${file}: ${err instanceof Error ? err.message : String(err)}`,
			);
			continue;
		}

		if (!contents) {
			try {
				fs.unlinkSync(filePath);
			} catch {}
			continue;
		}

		try {
			await createTaskFromQuickAdd(contents);
			fs.unlinkSync(filePath);
			imported++;
		} catch (err) {
			failed++;
			const msg = err instanceof Error ? err.message : String(err);
			errors.push(`Import failed for ${file}: ${msg}`);
			moveToFailed(dir, filePath, file);
		}
	}

	return { imported, failed, errors };
}

function moveToFailed(
	inboxDir: string,
	filePath: string,
	filename: string,
): void {
	const failedDir = path.join(inboxDir, "failed");
	try {
		fs.mkdirSync(failedDir, { recursive: true });
		fs.renameSync(filePath, path.join(failedDir, filename));
	} catch {
		// Leave the file in place if the move fails
	}
}
