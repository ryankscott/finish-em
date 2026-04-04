import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type { Changeset, SyncBackend } from "@/server/sync/types";

/**
 * iCloud Drive sync backend.
 *
 * Changesets are written as individual JSON files under:
 *   <syncDir>/<deviceId>/<timestamp>-<random>.json
 *
 * Each file is a single Changeset object. Pull reads all files from other
 * device subdirectories that are newer than `since`.
 *
 * iCloud Drive syncs the individual files, not the SQLite binary, so partial
 * writes and WAL corruption cannot occur.
 */
export class ICloudSyncBackend implements SyncBackend {
	private readonly syncDir: string;

	constructor(syncDir?: string) {
		this.syncDir =
			syncDir ??
			path.join(
				os.homedir(),
				"Library",
				"Mobile Documents",
				"com~apple~CloudDocs",
				"finish-em-sync",
			);
	}

	getSyncDir(): string {
		return this.syncDir;
	}

	async push(deviceId: string, changeset: Changeset): Promise<void> {
		const deviceDir = path.join(this.syncDir, deviceId);
		fs.mkdirSync(deviceDir, { recursive: true });

		const filename = `${changeset.timestamp.replace(/[:.]/g, "-")}-${crypto.randomUUID().slice(0, 8)}.json`;
		const filePath = path.join(deviceDir, filename);
		fs.writeFileSync(filePath, JSON.stringify(changeset, null, 2), "utf8");
	}

	async pull(deviceId: string, since: string | null): Promise<Changeset[]> {
		if (!fs.existsSync(this.syncDir)) return [];

		const sinceMs = since ? new Date(since).getTime() : 0;
		const changesets: Changeset[] = [];

		let entries: string[];
		try {
			entries = fs.readdirSync(this.syncDir);
		} catch {
			return [];
		}

		for (const entry of entries) {
			// Skip our own device directory
			if (entry === deviceId) continue;

			const deviceDir = path.join(this.syncDir, entry);
			let stat: fs.Stats;
			try {
				stat = fs.statSync(deviceDir);
			} catch {
				continue;
			}
			if (!stat.isDirectory()) continue;

			let files: string[];
			try {
				files = fs.readdirSync(deviceDir);
			} catch {
				continue;
			}

			for (const file of files) {
				if (!file.endsWith(".json")) continue;

				const filePath = path.join(deviceDir, file);
				let fileStat: fs.Stats;
				try {
					fileStat = fs.statSync(filePath);
				} catch {
					continue;
				}

				// Skip files older than `since` (using mtime as a fast pre-filter)
				if (fileStat.mtimeMs < sinceMs) continue;

				let content: string;
				try {
					content = fs.readFileSync(filePath, "utf8");
				} catch {
					continue;
				}

				let cs: Changeset;
				try {
					cs = JSON.parse(content) as Changeset;
				} catch {
					continue;
				}

				// Final check: use the changeset's own timestamp for accurate filtering
				if (since && cs.timestamp <= since) continue;

				changesets.push(cs);
			}
		}

		// Oldest first so merges apply in causal order
		changesets.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
		return changesets;
	}

	async listDevices(): Promise<string[]> {
		if (!fs.existsSync(this.syncDir)) return [];
		try {
			return fs
				.readdirSync(this.syncDir)
				.filter((entry) =>
					fs.statSync(path.join(this.syncDir, entry)).isDirectory(),
				);
		} catch {
			return [];
		}
	}
}
