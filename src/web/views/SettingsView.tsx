import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
	useCalendarMutations,
	useSettings,
	useSettingsMutations,
} from "../lib/queries";
import { ViewTitle } from "./SimpleViews";

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-2 py-4">
			<div className="text-[11px] font-semibold tracking-wide text-muted uppercase">
				{title}
			</div>
			{children}
			<Separator />
		</div>
	);
}

function relative(iso: string | null): string {
	if (!iso) return "never";
	try {
		return format(parseISO(iso), "MMM d, h:mm a");
	} catch {
		return iso;
	}
}

export function SettingsView() {
	const { data: settings } = useSettings();
	const { updateSettings } = useSettingsMutations();
	const { refreshCalendar } = useCalendarMutations();

	const [timezone, setTimezone] = useState("");
	const [icsUrl, setIcsUrl] = useState("");
	useEffect(() => {
		if (settings) {
			setTimezone(settings.timezone);
			setIcsUrl(settings.calendarIcsUrl ?? "");
		}
	}, [settings]);

	const saveTimezone = () => {
		const tz = timezone.trim();
		if (!tz) return;
		updateSettings.mutate(
			{ timezone: tz },
			{
				onSuccess: () => toast.success("Timezone saved"),
				onError: (err) => toast.error(err.message),
			},
		);
	};

	const saveIcsUrl = () => {
		const url = icsUrl.trim();
		updateSettings.mutate(
			{ calendarIcsUrl: url || null },
			{
				onSuccess: () => {
					toast.success(url ? "Calendar URL saved" : "Calendar disconnected");
					if (url) {
						refreshCalendar.mutate(undefined, {
							onSuccess: (r) =>
								toast.success(`Calendar refreshed (${r.count} events)`),
							onError: (err) => toast.error(err.message),
						});
					}
				},
				onError: (err) => toast.error(err.message),
			},
		);
	};

	return (
		<>
			<ViewTitle title="Settings" />
			<div className="max-w-xl px-4">
				<Section title="General">
					<div className="flex flex-col gap-1">
						<Label>Timezone</Label>
						<div className="flex items-center gap-2">
							<Input
								value={timezone}
								onChange={(e) => setTimezone(e.target.value)}
								placeholder="Pacific/Auckland"
								className="flex-1"
							/>
							<button
								type="button"
								onClick={saveTimezone}
								className="rounded-md border border-border px-3 py-2 text-foreground hover:bg-surface"
							>
								Save
							</button>
						</div>
					</div>
					{settings ? (
						<span className="text-xs text-muted">
							Updated {relative(settings.updatedAt)}
						</span>
					) : null}
				</Section>

				<Section title="Outlook Calendar">
					<div className="flex flex-col gap-1">
						<Label>Published ICS URL</Label>
						<div className="flex items-center gap-2">
							<Input
								value={icsUrl}
								onChange={(e) => setIcsUrl(e.target.value)}
								placeholder="https://outlook.office365.com/owa/calendar/.../calendar.ics"
								className="flex-1"
							/>
							<button
								type="button"
								onClick={saveIcsUrl}
								disabled={refreshCalendar.isPending}
								className="rounded-md border border-border px-3 py-2 text-foreground hover:bg-surface disabled:opacity-50"
							>
								{refreshCalendar.isPending ? "Syncing…" : "Save"}
							</button>
						</div>
						<span className="text-xs text-muted">
							In Outlook web: Settings → Calendar → Shared calendars → Publish a
							calendar, then paste the ICS link here. Read-only; refreshed every
							15 minutes.
						</span>
						{settings?.calendarLastSyncedAt ? (
							<span className="text-xs text-muted">
								Last synced {relative(settings.calendarLastSyncedAt)}
							</span>
						) : null}
					</div>
				</Section>
			</div>
		</>
	);
}
