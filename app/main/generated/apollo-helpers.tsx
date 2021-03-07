import { gql } from '@apollo/client';
import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type AreaKeySpecifier = ('key' | 'name' | 'deleted' | 'description' | 'lastUpdatedAt' | 'deletedAt' | 'createdAt' | 'emoji' | 'projects' | 'items' | 'sortOrder' | AreaKeySpecifier)[];
export type AreaFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	deleted?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	lastUpdatedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	deletedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	emoji?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	sortOrder?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('areas' | 'area' | 'areaOrders' | 'areaOrder' | 'calendars' | 'calendar' | 'getActiveCalendar' | 'components' | 'component' | 'componentsByView' | 'componentOrders' | 'componentOrder' | 'events' | 'event' | 'eventsByCalendar' | 'eventsForActiveCalendar' | 'features' | 'feature' | 'featureByName' | 'items' | 'item' | 'itemsByProject' | 'itemsByArea' | 'itemsByFilter' | 'itemsByParent' | 'itemOrders' | 'itemOrder' | 'itemOrdersByComponent' | 'itemOrdersByItem' | 'labels' | 'label' | 'projects' | 'project' | 'projectsByArea' | 'projectOrders' | 'projectOrder' | 'reminders' | 'reminder' | 'remindersByItem' | 'views' | 'view' | 'viewOrders' | 'viewOrder' | 'weeklyGoals' | 'weeklyGoal' | 'weeklyGoalByName' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	areas?: FieldPolicy<any> | FieldReadFunction<any>,
	area?: FieldPolicy<any> | FieldReadFunction<any>,
	areaOrders?: FieldPolicy<any> | FieldReadFunction<any>,
	areaOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	calendars?: FieldPolicy<any> | FieldReadFunction<any>,
	calendar?: FieldPolicy<any> | FieldReadFunction<any>,
	getActiveCalendar?: FieldPolicy<any> | FieldReadFunction<any>,
	components?: FieldPolicy<any> | FieldReadFunction<any>,
	component?: FieldPolicy<any> | FieldReadFunction<any>,
	componentsByView?: FieldPolicy<any> | FieldReadFunction<any>,
	componentOrders?: FieldPolicy<any> | FieldReadFunction<any>,
	componentOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>,
	event?: FieldPolicy<any> | FieldReadFunction<any>,
	eventsByCalendar?: FieldPolicy<any> | FieldReadFunction<any>,
	eventsForActiveCalendar?: FieldPolicy<any> | FieldReadFunction<any>,
	features?: FieldPolicy<any> | FieldReadFunction<any>,
	feature?: FieldPolicy<any> | FieldReadFunction<any>,
	featureByName?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	item?: FieldPolicy<any> | FieldReadFunction<any>,
	itemsByProject?: FieldPolicy<any> | FieldReadFunction<any>,
	itemsByArea?: FieldPolicy<any> | FieldReadFunction<any>,
	itemsByFilter?: FieldPolicy<any> | FieldReadFunction<any>,
	itemsByParent?: FieldPolicy<any> | FieldReadFunction<any>,
	itemOrders?: FieldPolicy<any> | FieldReadFunction<any>,
	itemOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	itemOrdersByComponent?: FieldPolicy<any> | FieldReadFunction<any>,
	itemOrdersByItem?: FieldPolicy<any> | FieldReadFunction<any>,
	labels?: FieldPolicy<any> | FieldReadFunction<any>,
	label?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	project?: FieldPolicy<any> | FieldReadFunction<any>,
	projectsByArea?: FieldPolicy<any> | FieldReadFunction<any>,
	projectOrders?: FieldPolicy<any> | FieldReadFunction<any>,
	projectOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	reminders?: FieldPolicy<any> | FieldReadFunction<any>,
	reminder?: FieldPolicy<any> | FieldReadFunction<any>,
	remindersByItem?: FieldPolicy<any> | FieldReadFunction<any>,
	views?: FieldPolicy<any> | FieldReadFunction<any>,
	view?: FieldPolicy<any> | FieldReadFunction<any>,
	viewOrders?: FieldPolicy<any> | FieldReadFunction<any>,
	viewOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	weeklyGoals?: FieldPolicy<any> | FieldReadFunction<any>,
	weeklyGoal?: FieldPolicy<any> | FieldReadFunction<any>,
	weeklyGoalByName?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('createArea' | 'migrateArea' | 'deleteArea' | 'renameArea' | 'changeDescriptionArea' | 'setEmojiOfArea' | 'setAreaOrder' | 'createAreaOrder' | 'migrateAreaOrder' | 'createCalendar' | 'deleteCalendar' | 'setActiveCalendar' | 'createComponent' | 'cloneComponent' | 'setParametersOfComponent' | 'migrateComponent' | 'deleteComponent' | 'setComponentOrder' | 'createComponentOrder' | 'migrateComponentOrder' | 'createEvent' | 'deleteEvent' | 'createFeature' | 'setFeature' | 'createItem' | 'migrateItem' | 'deleteItem' | 'restoreItem' | 'renameItem' | 'setTypeOfItem' | 'completeItem' | 'unCompleteItem' | 'setRepeatOfItem' | 'cloneItem' | 'setProjectOfItem' | 'setAreaOfItem' | 'setScheduledAtOfItem' | 'setDueAtOfItem' | 'setParentOfItem' | 'permanentDeleteItem' | 'setLabelOfItem' | 'setItemOrder' | 'deleteItemOrdersByComponent' | 'createItemOrder' | 'bulkCreateItemOrders' | 'migrateItemOrder' | 'createLabel' | 'renameLabel' | 'setColourOfLabel' | 'deleteLabel' | 'createProject' | 'migrateProject' | 'deleteProject' | 'renameProject' | 'changeDescriptionProject' | 'setEndDateOfProject' | 'setStartDateOfProject' | 'setEmojiOfProject' | 'setAreaOfProject' | 'setProjectOrder' | 'createProjectOrder' | 'migrateProjectOrder' | 'createReminder' | 'deleteReminder' | 'deleteReminderFromItem' | 'createView' | 'migrateView' | 'deleteView' | 'renameView' | 'setViewOrder' | 'createViewOrder' | 'migrateViewOrder' | 'createWeeklyGoal' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	createArea?: FieldPolicy<any> | FieldReadFunction<any>,
	migrateArea?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteArea?: FieldPolicy<any> | FieldReadFunction<any>,
	renameArea?: FieldPolicy<any> | FieldReadFunction<any>,
	changeDescriptionArea?: FieldPolicy<any> | FieldReadFunction<any>,
	setEmojiOfArea?: FieldPolicy<any> | FieldReadFunction<any>,
	setAreaOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	createAreaOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	migrateAreaOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	createCalendar?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteCalendar?: FieldPolicy<any> | FieldReadFunction<any>,
	setActiveCalendar?: FieldPolicy<any> | FieldReadFunction<any>,
	createComponent?: FieldPolicy<any> | FieldReadFunction<any>,
	cloneComponent?: FieldPolicy<any> | FieldReadFunction<any>,
	setParametersOfComponent?: FieldPolicy<any> | FieldReadFunction<any>,
	migrateComponent?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteComponent?: FieldPolicy<any> | FieldReadFunction<any>,
	setComponentOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	createComponentOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	migrateComponentOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	createEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteEvent?: FieldPolicy<any> | FieldReadFunction<any>,
	createFeature?: FieldPolicy<any> | FieldReadFunction<any>,
	setFeature?: FieldPolicy<any> | FieldReadFunction<any>,
	createItem?: FieldPolicy<any> | FieldReadFunction<any>,
	migrateItem?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteItem?: FieldPolicy<any> | FieldReadFunction<any>,
	restoreItem?: FieldPolicy<any> | FieldReadFunction<any>,
	renameItem?: FieldPolicy<any> | FieldReadFunction<any>,
	setTypeOfItem?: FieldPolicy<any> | FieldReadFunction<any>,
	completeItem?: FieldPolicy<any> | FieldReadFunction<any>,
	unCompleteItem?: FieldPolicy<any> | FieldReadFunction<any>,
	setRepeatOfItem?: FieldPolicy<any> | FieldReadFunction<any>,
	cloneItem?: FieldPolicy<any> | FieldReadFunction<any>,
	setProjectOfItem?: FieldPolicy<any> | FieldReadFunction<any>,
	setAreaOfItem?: FieldPolicy<any> | FieldReadFunction<any>,
	setScheduledAtOfItem?: FieldPolicy<any> | FieldReadFunction<any>,
	setDueAtOfItem?: FieldPolicy<any> | FieldReadFunction<any>,
	setParentOfItem?: FieldPolicy<any> | FieldReadFunction<any>,
	permanentDeleteItem?: FieldPolicy<any> | FieldReadFunction<any>,
	setLabelOfItem?: FieldPolicy<any> | FieldReadFunction<any>,
	setItemOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteItemOrdersByComponent?: FieldPolicy<any> | FieldReadFunction<any>,
	createItemOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	bulkCreateItemOrders?: FieldPolicy<any> | FieldReadFunction<any>,
	migrateItemOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	createLabel?: FieldPolicy<any> | FieldReadFunction<any>,
	renameLabel?: FieldPolicy<any> | FieldReadFunction<any>,
	setColourOfLabel?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteLabel?: FieldPolicy<any> | FieldReadFunction<any>,
	createProject?: FieldPolicy<any> | FieldReadFunction<any>,
	migrateProject?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteProject?: FieldPolicy<any> | FieldReadFunction<any>,
	renameProject?: FieldPolicy<any> | FieldReadFunction<any>,
	changeDescriptionProject?: FieldPolicy<any> | FieldReadFunction<any>,
	setEndDateOfProject?: FieldPolicy<any> | FieldReadFunction<any>,
	setStartDateOfProject?: FieldPolicy<any> | FieldReadFunction<any>,
	setEmojiOfProject?: FieldPolicy<any> | FieldReadFunction<any>,
	setAreaOfProject?: FieldPolicy<any> | FieldReadFunction<any>,
	setProjectOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	createProjectOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	migrateProjectOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	createReminder?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteReminder?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteReminderFromItem?: FieldPolicy<any> | FieldReadFunction<any>,
	createView?: FieldPolicy<any> | FieldReadFunction<any>,
	migrateView?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteView?: FieldPolicy<any> | FieldReadFunction<any>,
	renameView?: FieldPolicy<any> | FieldReadFunction<any>,
	setViewOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	createViewOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	migrateViewOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	createWeeklyGoal?: FieldPolicy<any> | FieldReadFunction<any>
};
export type AreaOrderKeySpecifier = ('areaKey' | 'sortOrder' | AreaOrderKeySpecifier)[];
export type AreaOrderFieldPolicy = {
	areaKey?: FieldPolicy<any> | FieldReadFunction<any>,
	sortOrder?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CalendarKeySpecifier = ('key' | 'name' | 'active' | 'deleted' | 'lastUpdatedAt' | 'deletedAt' | 'createdAt' | 'events' | CalendarKeySpecifier)[];
export type CalendarFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	active?: FieldPolicy<any> | FieldReadFunction<any>,
	deleted?: FieldPolicy<any> | FieldReadFunction<any>,
	lastUpdatedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	deletedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	events?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ComponentKeySpecifier = ('key' | 'viewKey' | 'location' | 'type' | 'parameters' | 'sortOrder' | ComponentKeySpecifier)[];
export type ComponentFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	viewKey?: FieldPolicy<any> | FieldReadFunction<any>,
	location?: FieldPolicy<any> | FieldReadFunction<any>,
	type?: FieldPolicy<any> | FieldReadFunction<any>,
	parameters?: FieldPolicy<any> | FieldReadFunction<any>,
	sortOrder?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ComponentOrderKeySpecifier = ('componentKey' | 'sortOrder' | ComponentOrderKeySpecifier)[];
export type ComponentOrderFieldPolicy = {
	componentKey?: FieldPolicy<any> | FieldReadFunction<any>,
	sortOrder?: FieldPolicy<any> | FieldReadFunction<any>
};
export type EventKeySpecifier = ('key' | 'title' | 'startAt' | 'endAt' | 'createdAt' | 'description' | 'allDay' | 'calendar' | EventKeySpecifier)[];
export type EventFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	title?: FieldPolicy<any> | FieldReadFunction<any>,
	startAt?: FieldPolicy<any> | FieldReadFunction<any>,
	endAt?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	allDay?: FieldPolicy<any> | FieldReadFunction<any>,
	calendar?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FeatureKeySpecifier = ('key' | 'name' | 'enabled' | FeatureKeySpecifier)[];
export type FeatureFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	enabled?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ItemKeySpecifier = ('key' | 'type' | 'text' | 'deleted' | 'completed' | 'parent' | 'project' | 'dueAt' | 'scheduledAt' | 'lastUpdatedAt' | 'completedAt' | 'createdAt' | 'deletedAt' | 'repeat' | 'label' | 'area' | 'children' | 'sortOrders' | 'reminders' | ItemKeySpecifier)[];
export type ItemFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	type?: FieldPolicy<any> | FieldReadFunction<any>,
	text?: FieldPolicy<any> | FieldReadFunction<any>,
	deleted?: FieldPolicy<any> | FieldReadFunction<any>,
	completed?: FieldPolicy<any> | FieldReadFunction<any>,
	parent?: FieldPolicy<any> | FieldReadFunction<any>,
	project?: FieldPolicy<any> | FieldReadFunction<any>,
	dueAt?: FieldPolicy<any> | FieldReadFunction<any>,
	scheduledAt?: FieldPolicy<any> | FieldReadFunction<any>,
	lastUpdatedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	completedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	deletedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	repeat?: FieldPolicy<any> | FieldReadFunction<any>,
	label?: FieldPolicy<any> | FieldReadFunction<any>,
	area?: FieldPolicy<any> | FieldReadFunction<any>,
	children?: FieldPolicy<any> | FieldReadFunction<any>,
	sortOrders?: FieldPolicy<any> | FieldReadFunction<any>,
	reminders?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ItemOrderKeySpecifier = ('item' | 'componentKey' | 'sortOrder' | ItemOrderKeySpecifier)[];
export type ItemOrderFieldPolicy = {
	item?: FieldPolicy<any> | FieldReadFunction<any>,
	componentKey?: FieldPolicy<any> | FieldReadFunction<any>,
	sortOrder?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LabelKeySpecifier = ('key' | 'name' | 'colour' | LabelKeySpecifier)[];
export type LabelFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	colour?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProjectKeySpecifier = ('key' | 'name' | 'deleted' | 'description' | 'lastUpdatedAt' | 'deletedAt' | 'createdAt' | 'startAt' | 'endAt' | 'area' | 'emoji' | 'items' | 'sortOrder' | ProjectKeySpecifier)[];
export type ProjectFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	deleted?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	lastUpdatedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	deletedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	startAt?: FieldPolicy<any> | FieldReadFunction<any>,
	endAt?: FieldPolicy<any> | FieldReadFunction<any>,
	area?: FieldPolicy<any> | FieldReadFunction<any>,
	emoji?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	sortOrder?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProjectOrderKeySpecifier = ('projectKey' | 'sortOrder' | ProjectOrderKeySpecifier)[];
export type ProjectOrderFieldPolicy = {
	projectKey?: FieldPolicy<any> | FieldReadFunction<any>,
	sortOrder?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ReminderKeySpecifier = ('key' | 'text' | 'deleted' | 'remindAt' | 'item' | 'lastUpdatedAt' | 'deletedAt' | 'createdAt' | ReminderKeySpecifier)[];
export type ReminderFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	text?: FieldPolicy<any> | FieldReadFunction<any>,
	deleted?: FieldPolicy<any> | FieldReadFunction<any>,
	remindAt?: FieldPolicy<any> | FieldReadFunction<any>,
	item?: FieldPolicy<any> | FieldReadFunction<any>,
	lastUpdatedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	deletedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ViewKeySpecifier = ('key' | 'name' | 'icon' | 'type' | 'deleted' | 'deletedAt' | 'createdAt' | 'sortOrder' | ViewKeySpecifier)[];
export type ViewFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	icon?: FieldPolicy<any> | FieldReadFunction<any>,
	type?: FieldPolicy<any> | FieldReadFunction<any>,
	deleted?: FieldPolicy<any> | FieldReadFunction<any>,
	deletedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	sortOrder?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ViewOrderKeySpecifier = ('viewKey' | 'sortOrder' | ViewOrderKeySpecifier)[];
export type ViewOrderFieldPolicy = {
	viewKey?: FieldPolicy<any> | FieldReadFunction<any>,
	sortOrder?: FieldPolicy<any> | FieldReadFunction<any>
};
export type WeeklyGoalKeySpecifier = ('key' | 'week' | 'goal' | WeeklyGoalKeySpecifier)[];
export type WeeklyGoalFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	week?: FieldPolicy<any> | FieldReadFunction<any>,
	goal?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TypedTypePolicies = TypePolicies & {
	Area?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AreaKeySpecifier | (() => undefined | AreaKeySpecifier),
		fields?: AreaFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	},
	AreaOrder?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AreaOrderKeySpecifier | (() => undefined | AreaOrderKeySpecifier),
		fields?: AreaOrderFieldPolicy,
	},
	Calendar?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CalendarKeySpecifier | (() => undefined | CalendarKeySpecifier),
		fields?: CalendarFieldPolicy,
	},
	Component?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ComponentKeySpecifier | (() => undefined | ComponentKeySpecifier),
		fields?: ComponentFieldPolicy,
	},
	ComponentOrder?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ComponentOrderKeySpecifier | (() => undefined | ComponentOrderKeySpecifier),
		fields?: ComponentOrderFieldPolicy,
	},
	Event?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | EventKeySpecifier | (() => undefined | EventKeySpecifier),
		fields?: EventFieldPolicy,
	},
	Feature?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FeatureKeySpecifier | (() => undefined | FeatureKeySpecifier),
		fields?: FeatureFieldPolicy,
	},
	Item?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ItemKeySpecifier | (() => undefined | ItemKeySpecifier),
		fields?: ItemFieldPolicy,
	},
	ItemOrder?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ItemOrderKeySpecifier | (() => undefined | ItemOrderKeySpecifier),
		fields?: ItemOrderFieldPolicy,
	},
	Label?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LabelKeySpecifier | (() => undefined | LabelKeySpecifier),
		fields?: LabelFieldPolicy,
	},
	Project?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ProjectKeySpecifier | (() => undefined | ProjectKeySpecifier),
		fields?: ProjectFieldPolicy,
	},
	ProjectOrder?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ProjectOrderKeySpecifier | (() => undefined | ProjectOrderKeySpecifier),
		fields?: ProjectOrderFieldPolicy,
	},
	Reminder?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ReminderKeySpecifier | (() => undefined | ReminderKeySpecifier),
		fields?: ReminderFieldPolicy,
	},
	View?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ViewKeySpecifier | (() => undefined | ViewKeySpecifier),
		fields?: ViewFieldPolicy,
	},
	ViewOrder?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ViewOrderKeySpecifier | (() => undefined | ViewOrderKeySpecifier),
		fields?: ViewOrderFieldPolicy,
	},
	WeeklyGoal?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | WeeklyGoalKeySpecifier | (() => undefined | WeeklyGoalKeySpecifier),
		fields?: WeeklyGoalFieldPolicy,
	}
};