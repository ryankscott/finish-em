import { Alert } from "@inkjs/ui";
import { Box } from "ink";

import type { StatusMessageTone } from "./StatusMessage";

export type ToastMessage = {
	id: number;
	text: string;
	tone: StatusMessageTone;
};

type ToastStackProps = {
	toasts: ToastMessage[];
};

export const ToastStack = ({ toasts }: ToastStackProps) => {
	if (toasts.length === 0) return null;

	return (
		<Box flexDirection="column" paddingX={1}>
			{toasts.map((toast) => (
				<Alert key={toast.id} variant={toast.tone}>
					{toast.text}
				</Alert>
			))}
		</Box>
	);
};
