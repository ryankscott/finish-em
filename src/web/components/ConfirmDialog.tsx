import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "../lib/use-is-mobile";

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Delete",
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel?: string;
	onConfirm: () => void;
}) {
	const isMobile = useIsMobile();
	// The default Button size is 36px, under the 44px comfortable touch
	// target; this dialog has no mobile-specific layout otherwise, so bump
	// just the buttons rather than reaching for a bottom sheet.
	const buttonClass = isMobile ? "min-h-11 flex-1 text-base" : undefined;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						className={buttonClass}
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						className={`bg-p1 text-background hover:bg-p1/90 ${buttonClass ?? ""}`}
						onClick={() => {
							onOpenChange(false);
							onConfirm();
						}}
					>
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
