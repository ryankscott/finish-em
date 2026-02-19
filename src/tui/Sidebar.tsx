import { Box, Text } from "ink";

import type { Project } from "../server/types";

type NavItem = {
	type: "nav";
	key: string;
	label: string;
	view: "today" | "inbox" | "upcoming" | "completed" | "settings";
};

type ProjectItem = {
	type: "project";
	project: Project;
};

export type SidebarItem = NavItem | ProjectItem;

const NAV_ITEMS: NavItem[] = [
	{ type: "nav", key: "today", label: "Today", view: "today" },
	{ type: "nav", key: "inbox", label: "Inbox", view: "inbox" },
	{ type: "nav", key: "upcoming", label: "Upcoming", view: "upcoming" },
	{ type: "nav", key: "completed", label: "Completed", view: "completed" },
	{ type: "nav", key: "settings", label: "Settings", view: "settings" },
];

export const buildSidebarItems = (projects: Project[]): SidebarItem[] => {
	const navItems: SidebarItem[] = [...NAV_ITEMS];
	const projectItems: SidebarItem[] = projects
		.filter((p) => !p.isInbox)
		.map((project) => ({ type: "project", project }));

	return [...navItems, ...projectItems];
};

type SidebarProps = {
	items: SidebarItem[];
	selectedIndex: number;
	focused: boolean;
	width: number;
};

export const Sidebar = ({
	items,
	selectedIndex,
	focused,
	width,
}: SidebarProps) => {
	const borderColor = focused ? "magentaBright" : "gray";

	return (
		<Box
			flexDirection="column"
			width={width}
			borderStyle="round"
			borderColor={borderColor}
			paddingX={1}
		>
			<Box marginBottom={1}>
				<Text bold color="magentaBright">
					Projects
				</Text>
			</Box>

			{items.map((item, index) => {
				const isSelected = index === selectedIndex;
				const isNav = item.type === "nav";
				const showSeparator =
					isNav &&
					index === NAV_ITEMS.length - 1 &&
					items.length > NAV_ITEMS.length;

				const label = isNav
					? item.label
					: `${item.project.emoji ?? "●"} ${item.project.name}`;
				const color =
					isSelected && focused
						? "cyan"
						: isSelected
							? "blueBright"
							: undefined;
				const isBold = isSelected && focused;

				return (
					<Box
						key={isNav ? item.key : `p-${item.project.id}`}
						flexDirection="column"
					>
						{!isNav && index === NAV_ITEMS.length && (
							<Box marginY={0}>
								<Text dimColor>{"─".repeat(Math.max(width - 4, 10))}</Text>
							</Box>
						)}
						<Text bold={isBold} color={color}>
							{isSelected ? "❯ " : "  "}
							{label}
						</Text>
						{showSeparator && null}
					</Box>
				);
			})}

			{items.length === 0 && <Text dimColor>No projects</Text>}
		</Box>
	);
};
