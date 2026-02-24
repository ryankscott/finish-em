import { Box } from "ink";

import { StatusMessage, type StatusMessageTone } from "./StatusMessage";

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
				<StatusMessage key={toast.id} tone={toast.tone} message={toast.text} />
			))}
		</Box>
	);
};
