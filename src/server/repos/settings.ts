import { getDb, nowIso } from "@/server/db/client";
import { mapSettingsRow } from "@/server/repos/mappers";

import type {
	AiProvider,
	AppSettings,
	AppSettingsSecrets,
} from "@/server/types";

function normalizeLmStudioBaseUrl(baseUrl: string | null): string | null {
	if (!baseUrl || baseUrl.trim().length === 0) {
		return null;
	}

	const trimmed = baseUrl.trim();

	try {
		const parsed = new URL(trimmed);
		const normalizedPathname = parsed.pathname.replace(/\/api\/v1\/?$/, "/v1");
		if (normalizedPathname !== parsed.pathname) {
			parsed.pathname = normalizedPathname;
			return parsed.toString().replace(/\/$/, "");
		}
	} catch {
		// If URL parsing fails, fallback to string replacement.
	}

	const replaced = trimmed.replace(/\/api\/v1\/?$/, "/v1");
	return replaced;
}

function normalizeAssistantBaseUrl(
	provider: AiProvider,
	baseUrl: string | null,
): string | null {
	if (provider !== "lmstudio") {
		return baseUrl;
	}
	return normalizeLmStudioBaseUrl(baseUrl);
}

export function getSettings(): AppSettings {
	const db = getDb();
	const row = db.prepare("SELECT * FROM settings WHERE id = 1").get() as Record<
		string,
		unknown
	>;

	const mapped = mapSettingsRow(row);
	const normalizedAiBaseUrl = normalizeAssistantBaseUrl(
		mapped.aiProvider,
		mapped.aiBaseUrl,
	);

	if (normalizedAiBaseUrl !== mapped.aiBaseUrl) {
		const repairedAt = nowIso();
		db.prepare(
			"UPDATE settings SET ai_base_url = ?, updated_at = ? WHERE id = 1",
		).run(normalizedAiBaseUrl, repairedAt);
		return {
			...mapped,
			aiBaseUrl: normalizedAiBaseUrl,
			updatedAt: repairedAt,
		};
	}

	return mapped;
}

export function getSettingsSecrets(): AppSettingsSecrets {
	const db = getDb();
	const row = db
		.prepare("SELECT ai_api_key FROM settings WHERE id = 1")
		.get() as Record<string, unknown> | undefined;

	const aiApiKeyRaw =
		typeof row?.ai_api_key === "string" && row.ai_api_key.trim().length > 0
			? row.ai_api_key.trim()
			: null;

	return { aiApiKey: aiApiKeyRaw };
}

export function updateSettings(
	patch: Partial<{
		timezone: string;
		aiProvider: AiProvider;
		aiBaseUrl: string | null;
		aiModel: string | null;
		aiApiKey: string | null;
		clearAiApiKey: boolean;
	}>,
): AppSettings {
	const current = getSettings();
	const currentSecrets = getSettingsSecrets();
	const timezone = patch.timezone ?? current.timezone;
	const aiProvider = patch.aiProvider ?? current.aiProvider;
	const aiBaseUrlRaw =
		patch.aiBaseUrl === undefined
			? current.aiBaseUrl
			: patch.aiBaseUrl?.trim() || null;
	const aiBaseUrl = normalizeAssistantBaseUrl(aiProvider, aiBaseUrlRaw);
	const aiModel =
		patch.aiModel === undefined
			? current.aiModel
			: patch.aiModel?.trim() || null;
	const isSavingLmStudioProvider =
		(patch.aiProvider !== undefined || patch.aiModel !== undefined) &&
		aiProvider === "lmstudio";

	if (isSavingLmStudioProvider && aiModel === null) {
		throw new Error("LM Studio model is required");
	}
	const aiApiKey = patch.clearAiApiKey
		? null
		: patch.aiApiKey === undefined
			? currentSecrets.aiApiKey
			: patch.aiApiKey?.trim() || null;

	getDb()
		.prepare(
			"UPDATE settings SET timezone = ?, ai_provider = ?, ai_base_url = ?, ai_model = ?, ai_api_key = ?, updated_at = ? WHERE id = 1",
		)
		.run(timezone, aiProvider, aiBaseUrl, aiModel, aiApiKey, nowIso());

	return getSettings();
}
