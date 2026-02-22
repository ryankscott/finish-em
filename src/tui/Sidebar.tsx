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
];

const SETTINGS_ITEM: NavItem = {
  type: "nav",
  key: "settings",
  label: "Settings",
  view: "settings",
};

export const buildSidebarItems = (projects: Project[]): SidebarItem[] => {
  const navItems: SidebarItem[] = [...NAV_ITEMS];
  const projectItems: SidebarItem[] = projects
    .filter((p) => !p.isInbox)
    .map((project) => ({ type: "project", project }));

  return [...navItems, ...projectItems, SETTINGS_ITEM];
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
  const settingsIndex = items.findIndex(
    (item) => item.type === "nav" && item.key === "settings",
  );
  const topItems = items
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => index !== settingsIndex);

  const settingsItem =
    settingsIndex >= 0
      ? { item: items[settingsIndex] as SidebarItem, index: settingsIndex }
      : null;

  const renderItem = (item: SidebarItem, index: number) => {
    const isSelected = index === selectedIndex;
    const isNav = item.type === "nav";
    const label = isNav
      ? item.label
      : `${item.project.emoji ?? "●"} ${item.project.name}`;
    const color =
      isSelected && focused ? "cyan" : isSelected ? "blueBright" : undefined;
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
      </Box>
    );
  };

  return (
    <Box
      flexDirection="column"
      width={width}
      height="100%"
      borderStyle="round"
      borderColor={borderColor}
      paddingX={1}
    >
      <Box flexDirection="column" flexGrow={1}>
        <Box marginBottom={1}>
          <Text bold color="magentaBright">
            Projects
          </Text>
        </Box>

        {topItems.map(({ item, index }) => renderItem(item, index))}

        {items.length === 0 && <Text dimColor>No projects</Text>}
      </Box>

      <Box marginY={0}>
        <Text dimColor>{"─".repeat(Math.max(width - 4, 10))}</Text>
      </Box>
      {settingsItem && renderItem(settingsItem.item, settingsItem.index)}
    </Box>
  );
};
