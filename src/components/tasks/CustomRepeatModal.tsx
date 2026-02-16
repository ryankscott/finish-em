import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";

interface CustomRepeatModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (rrule: string) => void;
}

type FrequencyUnit = "day" | "week" | "month" | "year";

export function CustomRepeatModal({
	open,
	onOpenChange,
	onSave,
}: CustomRepeatModalProps) {
	const [basedOn, setBasedOn] = useState<"scheduled" | "completed">(
		"scheduled",
	);
	const [interval, setInterval] = useState<number>(1);
	const [frequency, setFrequency] = useState<FrequencyUnit>("day");
	const [ends, setEnds] = useState<"never" | "on_date">("never");

	const handleSave = () => {
		// Build RRULE from inputs
		const freqMap: Record<FrequencyUnit, string> = {
			day: "DAILY",
			week: "WEEKLY",
			month: "MONTHLY",
			year: "YEARLY",
		};

		const rrule = `FREQ=${freqMap[frequency]};INTERVAL=${interval}`;

		onSave(rrule);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Custom repeat</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Based on */}
					<div className="space-y-3">
						<Label>Based on</Label>
						<RadioGroup value={basedOn} onValueChange={(v) => setBasedOn(v as typeof basedOn)}>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="scheduled" id="scheduled" />
								<Label htmlFor="scheduled" className="font-normal cursor-pointer">
									Scheduled date
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="completed" id="completed" />
								<Label htmlFor="completed" className="font-normal cursor-pointer">
									Completed date
								</Label>
							</div>
						</RadioGroup>
					</div>

					{/* Every */}
					<div className="space-y-3">
						<Label>Every</Label>
						<div className="flex gap-2">
							<Input
								type="number"
								min="1"
								value={interval}
								onChange={(e) => setInterval(Number.parseInt(e.target.value) || 1)}
								className="w-20"
							/>
							<Select value={frequency} onChange={(e) => setFrequency(e.target.value as FrequencyUnit)}>
								<option value="day">Day</option>
								<option value="week">Week</option>
								<option value="month">Month</option>
								<option value="year">Year</option>
							</Select>
						</div>
					</div>

					{/* Ends */}
					<div className="space-y-3">
						<Label>Ends</Label>
						<RadioGroup value={ends} onValueChange={(v) => setEnds(v as typeof ends)}>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="never" id="never" />
								<Label htmlFor="never" className="font-normal cursor-pointer">
									Never
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="on_date" id="on_date" />
								<Label htmlFor="on_date" className="font-normal cursor-pointer">
									On date (inclusive)
								</Label>
							</div>
						</RadioGroup>
					</div>
				</div>

				<DialogFooter>
					<Button variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave}>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
