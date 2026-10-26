import type { ProjectResourceInput } from "@/server/types";

export function resourceDomain(url: string): string {
	try {
		const parsed = new URL(url);
		return parsed.hostname.replace(/^www\./, "") || parsed.protocol;
	} catch {
		return url;
	}
}

export function resourceError(resource: ProjectResourceInput): string | null {
	if (!resource.label.trim() || !resource.url.trim())
		return "Each resource needs a label and a URL.";
	try {
		new URL(resource.url.trim());
		return null;
	} catch {
		return "Enter a complete resource URL, including https://.";
	}
}
