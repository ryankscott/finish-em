import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

const colours = [
	["Slate", "#435c76"],
	["Blue", "#527b9b"],
	["Sage", "#64847c"],
	["Amber", "#ad8259"],
	["Rose", "#ba7376"],
	["Lilac", "#8a7a9e"],
	["Graphite", "#657180"],
	["Ocean", "#397c85"],
	["Olive", "#75834e"],
	["Terracotta", "#ad6a4e"],
	["Berry", "#a85b83"],
	["Violet", "#7566a0"],
] as const;

export function ProjectColourPicker({
	value,
	onChange,
	disabled = false,
}: {
	value: string;
	onChange: (colour: string) => void;
	disabled?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [custom, setCustom] = useState(value);
	const id = useId();
	useEffect(() => setCustom(value), [value]);
	const name =
		colours.find(([, hex]) => hex === value.toLowerCase())?.[0] ?? "Custom";
	const valid = /^#[0-9a-f]{6}$/i.test(custom);
	const select = (colour: string) => {
		onChange(colour);
		setOpen(false);
	};
	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				if (next) setCustom(value);
				setOpen(next);
			}}
		>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					disabled={disabled}
					aria-label={`Project colour: ${name}`}
					className="min-h-11 gap-2 px-2 text-xs"
				>
					<span
						className="size-3.5 rounded-full"
						style={{ backgroundColor: value }}
					/>
					{name}
					<ChevronDown className="size-3.5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-[292px] max-w-[calc(100vw-2rem)] p-3 shadow-none"
			>
				<p className="mb-2 text-xs text-muted">Project colour</p>
				<fieldset className="grid grid-cols-6" aria-label="Project colours">
					{colours.map(([label, hex]) => (
						<button
							type="button"
							key={hex}
							aria-label={label}
							title={label}
							aria-pressed={value.toLowerCase() === hex}
							onClick={() => select(hex)}
							className="flex size-11 items-center justify-center rounded-md hover:bg-surface aria-pressed:ring-1 aria-pressed:ring-accent [@media(pointer:coarse)]:min-h-11"
						>
							<span
								className="flex size-6 items-center justify-center rounded-full text-white"
								style={{ backgroundColor: hex }}
							>
								{value.toLowerCase() === hex && <Check className="size-4" />}
							</span>
						</button>
					))}
				</fieldset>
				<details className="mt-3 border-t border-border pt-2">
					<summary className="min-h-11 content-center text-xs text-muted">
						Custom hex colour
					</summary>
					<label htmlFor={id} className="sr-only">
						Hex colour
					</label>
					<div className="flex items-center gap-2">
						<Input
							id={id}
							value={custom}
							onChange={(e) => setCustom(e.target.value)}
							placeholder="#435c76"
							aria-invalid={!valid}
							className="min-w-0"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									if (valid) select(custom);
								}
							}}
						/>
						<Button
							type="button"
							disabled={!valid}
							onClick={() => select(custom)}
						>
							Apply
						</Button>
					</div>
					{!valid && (
						<p className="mt-2 text-xs text-p1" role="alert">
							Use # followed by six hex digits.
						</p>
					)}
				</details>
			</PopoverContent>
		</Popover>
	);
}
