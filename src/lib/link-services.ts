/**
 * Recognises well-known services from a link's hostname so the UI can show a
 * brand mark, and derives a readable label (e.g. "PROJ-123", "owner/repo#42")
 * when the user hasn't written their own [label](url).
 *
 * Detection is hostname-based (exact host or domain suffix), never a substring
 * of the whole URL, so https://evil.com/?q=github.com cannot claim a mark.
 */

import { ensureScheme } from "./task-links";

export type LinkServiceId =
	| "github"
	| "gitlab"
	| "jira"
	| "confluence"
	| "notion"
	| "linear"
	| "slack"
	| "figma"
	| "google-docs"
	| "google-drive"
	| "google-calendar"
	| "youtube"
	| "zoom"
	| "loom";

export type LinkService = { id: LinkServiceId; name: string };

const SERVICE_NAMES: Record<LinkServiceId, string> = {
	github: "GitHub",
	gitlab: "GitLab",
	jira: "Jira",
	confluence: "Confluence",
	notion: "Notion",
	linear: "Linear",
	slack: "Slack",
	figma: "Figma",
	"google-docs": "Google Docs",
	"google-drive": "Google Drive",
	"google-calendar": "Google Calendar",
	youtube: "YouTube",
	zoom: "Zoom",
	loom: "Loom",
};

/** Parses a URL, tolerating a missing scheme. Returns null if unparseable. */
function parseUrl(url: string): URL | null {
	try {
		return new URL(ensureScheme(url));
	} catch {
		return null;
	}
}

/** Normalised hostname: lowercased, without a leading "www.". */
function hostOf(parsed: URL): string {
	return parsed.hostname.toLowerCase().replace(/^www\./, "");
}

/** True when host is exactly domain, or a subdomain of it. */
function isHost(host: string, domain: string): boolean {
	return host === domain || host.endsWith(`.${domain}`);
}

/** Atlassian Cloud serves Jira and Confluence from one host; the path decides. */
function atlassianServiceId(pathname: string): LinkServiceId {
	if (pathname.startsWith("/wiki/")) return "confluence";
	return "jira";
}

function googleServiceId(pathname: string): LinkServiceId | null {
	if (
		pathname.startsWith("/document/") ||
		pathname.startsWith("/spreadsheets/")
	)
		return "google-docs";
	if (pathname.startsWith("/presentation/") || pathname.startsWith("/forms/"))
		return "google-docs";
	if (pathname.startsWith("/drive/") || pathname.startsWith("/file/"))
		return "google-drive";
	return null;
}

/** Identifies the service a URL points at, or null when unrecognised. */
export function identifyLinkService(url: string): LinkService | null {
	const parsed = parseUrl(url);
	if (!parsed) return null;

	const host = hostOf(parsed);
	const path = parsed.pathname;

	let id: LinkServiceId | null = null;

	if (isHost(host, "github.com") || isHost(host, "github.io")) id = "github";
	else if (isHost(host, "gitlab.com")) id = "gitlab";
	else if (isHost(host, "atlassian.net") || isHost(host, "jira.com"))
		id = atlassianServiceId(path);
	else if (isHost(host, "notion.so") || isHost(host, "notion.site"))
		id = "notion";
	else if (isHost(host, "linear.app")) id = "linear";
	else if (isHost(host, "slack.com")) id = "slack";
	else if (isHost(host, "figma.com")) id = "figma";
	else if (isHost(host, "docs.google.com")) id = googleServiceId(path);
	else if (isHost(host, "drive.google.com")) id = "google-drive";
	else if (isHost(host, "calendar.google.com")) id = "google-calendar";
	else if (isHost(host, "meet.google.com")) id = "google-calendar";
	else if (isHost(host, "youtube.com") || isHost(host, "youtu.be"))
		id = "youtube";
	else if (isHost(host, "zoom.us") || isHost(host, "zoom.com")) id = "zoom";
	else if (isHost(host, "loom.com")) id = "loom";

	if (!id) return null;
	return { id, name: SERVICE_NAMES[id] };
}

const ISSUE_KEY_RE = /\b[A-Z][A-Z0-9]+-\d+\b/;

function jiraLabel(parsed: URL): string | null {
	const match = ISSUE_KEY_RE.exec(decodeURIComponent(parsed.pathname));
	return match ? match[0] : null;
}

function githubLabel(parsed: URL): string | null {
	const parts = parsed.pathname.split("/").filter(Boolean);
	if (parts.length < 2) return null;
	const [owner, repo] = parts;
	const repoName = `${owner}/${repo}`;
	if (parts.length >= 4 && (parts[2] === "pull" || parts[2] === "issues")) {
		const number = parts[3];
		if (/^\d+$/.test(number)) return `${repoName}#${number}`;
	}
	if (parts.length === 2) return repoName;
	return null;
}

function linearLabel(parsed: URL): string | null {
	const match = ISSUE_KEY_RE.exec(parsed.pathname.toUpperCase());
	return match ? match[0] : null;
}

const NOTION_SLUG_RE = /^(.*)-[0-9a-f]{32}$/i;

function notionLabel(parsed: URL): string | null {
	const last = parsed.pathname.split("/").filter(Boolean).pop();
	if (!last) return null;
	const match = NOTION_SLUG_RE.exec(last);
	if (!match || !match[1]) return null;
	return decodeURIComponent(match[1]).replace(/-/g, " ");
}

function confluenceLabel(parsed: URL): string | null {
	const parts = parsed.pathname.split("/").filter(Boolean);
	const pagesIndex = parts.indexOf("pages");
	if (pagesIndex === -1) return null;
	const title = parts[pagesIndex + 2];
	if (!title) return null;
	return decodeURIComponent(title.replace(/\+/g, " ")).replace(/-/g, " ");
}

/**
 * Derives a readable label for a recognised service link, or null to fall back
 * to the generic last-path-segment behaviour in getLinkDisplayLabel.
 */
export function getServiceLinkLabel(url: string): string | null {
	const service = identifyLinkService(url);
	if (!service) return null;
	const parsed = parseUrl(url);
	if (!parsed) return null;

	switch (service.id) {
		case "jira":
			return jiraLabel(parsed);
		case "confluence":
			return confluenceLabel(parsed);
		case "github":
			return githubLabel(parsed);
		case "linear":
			return linearLabel(parsed);
		case "notion":
			return notionLabel(parsed);
		default:
			return null;
	}
}
