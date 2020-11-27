import { gql } from '@apollo/client';
import { FieldPolicy, FieldReadFunction, TypePolicies } from '@apollo/client/cache';
export type AreaKeySpecifier = ('key' | 'name' | 'deleted' | 'description' | 'lastUpdatedAt' | 'deletedAt' | 'createdAt' | 'projects' | 'items' | 'sortOrder' | AreaKeySpecifier)[];
export type AreaFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	deleted?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	lastUpdatedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	deletedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	projects?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	sortOrder?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('areas' | 'area' | 'areaOrders' | 'areaOrder' | 'calendars' | 'calendar' | 'getActiveCalendar' | 'components' | 'component' | 'componentsByView' | 'componentOrders' | 'componentOrder' | 'events' | 'event' | 'eventsByCalendar' | 'features' | 'feature' | 'featureByName' | 'items' | 'item' | 'itemsByProject' | 'itemsByArea' | 'itemsByFilter' | 'itemsByParent' | 'itemOrders' | 'itemOrder' | 'labels' | 'label' | 'projects' | 'project' | 'projectsByArea' | 'projectOrders' | 'projectOrder' | 'reminders' | 'reminder' | 'remindersByItem' | 'views' | 'view' | 'viewOrders' | 'viewOrder' | QueryKeySpecifier)[];
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
	viewOrder?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('createArea' | 'migrateArea' | 'deleteArea' | 'renameArea' | 'changeDescriptionArea' | 'setAreaOrder' | 'createAreaOrder' | 'migrateAreaOrder' | 'createCalendar' | 'deleteCalendar' | 'setActiveCalendar' | 'createFilteredItemListComponent' | 'createViewHeaderComponent' | 'setParametersOfFilteredItemListComponent' | 'migrateComponent' | 'deleteComponent' | 'setComponentOrder' | 'createComponentOrder' | 'migrateComponentOrder' | 'createEvent' | 'deleteEvent' | 'createFeature' | 'setFeature' | 'createItem' | 'migrateItem' | 'deleteItem' | 'restoreItem' | 'renameItem' | 'setTypeOfItem' | 'completeItem' | 'unCompleteItem' | 'setRepeatOfItem' | 'cloneItem' | 'setProjectOfItem' | 'setAreaOfItem' | 'setScheduledAtOfItem' | 'setDueAtOfItem' | 'setParentOfItem' | 'permanentDeleteItem' | 'setLabelOfItem' | 'setItemOrder' | 'createItemOrder' | 'migrateItemOrder' | 'createLabel' | 'renameLabel' | 'setColourOfLabel' | 'deleteLabel' | 'createProject' | 'migrateProject' | 'deleteProject' | 'renameProject' | 'changeDescriptionProject' | 'setEndDateOfProject' | 'setStartDateOfProject' | 'setAreaOfProject' | 'setProjectOrder' | 'createProjectOrder' | 'migrateProjectOrder' | 'createReminder' | 'deleteReminder' | 'deleteReminderFromItem' | 'createView' | 'migrateView' | 'deleteView' | 'renameView' | 'setViewOrder' | 'createViewOrder' | 'migrateViewOrder' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	createArea?: FieldPolicy<any> | FieldReadFunction<any>,
	migrateArea?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteArea?: FieldPolicy<any> | FieldReadFunction<any>,
	renameArea?: FieldPolicy<any> | FieldReadFunction<any>,
	changeDescriptionArea?: FieldPolicy<any> | FieldReadFunction<any>,
	setAreaOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	createAreaOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	migrateAreaOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	createCalendar?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteCalendar?: FieldPolicy<any> | FieldReadFunction<any>,
	setActiveCalendar?: FieldPolicy<any> | FieldReadFunction<any>,
	createFilteredItemListComponent?: FieldPolicy<any> | FieldReadFunction<any>,
	createViewHeaderComponent?: FieldPolicy<any> | FieldReadFunction<any>,
	setParametersOfFilteredItemListComponent?: FieldPolicy<any> | FieldReadFunction<any>,
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
	createItemOrder?: FieldPolicy<any> | FieldReadFunction<any>,
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
	migrateViewOrder?: FieldPolicy<any> | FieldReadFunction<any>
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
export type ComponentKeySpecifier = ('key' | 'view' | 'location' | 'type' | 'parameters' | 'sortOrder' | ComponentKeySpecifier)[];
export type ComponentFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	view?: FieldPolicy<any> | FieldReadFunction<any>,
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
export type ItemKeySpecifier = ('key' | 'type' | 'text' | 'deleted' | 'completed' | 'parent' | 'project' | 'dueAt' | 'scheduledAt' | 'lastUpdatedAt' | 'completedAt' | 'createdAt' | 'deletedAt' | 'repeat' | 'label' | 'area' | 'children' | 'sortOrder' | 'reminders' | ItemKeySpecifier)[];
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
	sortOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	reminders?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ItemOrderKeySpecifier = ('itemKey' | 'sortOrder' | ItemOrderKeySpecifier)[];
export type ItemOrderFieldPolicy = {
	itemKey?: FieldPolicy<any> | FieldReadFunction<any>,
	sortOrder?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LabelKeySpecifier = ('key' | 'name' | 'colour' | LabelKeySpecifier)[];
export type LabelFieldPolicy = {
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	colour?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProjectKeySpecifier = ('key' | 'name' | 'deleted' | 'description' | 'lastUpdatedAt' | 'deletedAt' | 'createdAt' | 'startAt' | 'endAt' | 'area' | 'items' | 'sortOrder' | ProjectKeySpecifier)[];
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
export type TypedTypePolicies = TypePolicies & {
	Area?: {
		keyFields?: false | AreaKeySpecifier | (() => undefined | AreaKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: AreaFieldPolicy,
	},
	Query?: {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: QueryFieldPolicy,
	},
	Mutation?: {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: MutationFieldPolicy,
	},
	AreaOrder?: {
		keyFields?: false | AreaOrderKeySpecifier | (() => undefined | AreaOrderKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: AreaOrderFieldPolicy,
	},
	Calendar?: {
		keyFields?: false | CalendarKeySpecifier | (() => undefined | CalendarKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: CalendarFieldPolicy,
	},
	Component?: {
		keyFields?: false | ComponentKeySpecifier | (() => undefined | ComponentKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: ComponentFieldPolicy,
	},
	ComponentOrder?: {
		keyFields?: false | ComponentOrderKeySpecifier | (() => undefined | ComponentOrderKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: ComponentOrderFieldPolicy,
	},
	Event?: {
		keyFields?: false | EventKeySpecifier | (() => undefined | EventKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: EventFieldPolicy,
	},
	Feature?: {
		keyFields?: false | FeatureKeySpecifier | (() => undefined | FeatureKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: FeatureFieldPolicy,
	},
	Item?: {
		keyFields?: false | ItemKeySpecifier | (() => undefined | ItemKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: ItemFieldPolicy,
	},
	ItemOrder?: {
		keyFields?: false | ItemOrderKeySpecifier | (() => undefined | ItemOrderKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: ItemOrderFieldPolicy,
	},
	Label?: {
		keyFields?: false | LabelKeySpecifier | (() => undefined | LabelKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: LabelFieldPolicy,
	},
	Project?: {
		keyFields?: false | ProjectKeySpecifier | (() => undefined | ProjectKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: ProjectFieldPolicy,
	},
	ProjectOrder?: {
		keyFields?: false | ProjectOrderKeySpecifier | (() => undefined | ProjectOrderKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: ProjectOrderFieldPolicy,
	},
	Reminder?: {
		keyFields?: false | ReminderKeySpecifier | (() => undefined | ReminderKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: ReminderFieldPolicy,
	},
	View?: {
		keyFields?: false | ViewKeySpecifier | (() => undefined | ViewKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: ViewFieldPolicy,
	},
	ViewOrder?: {
		keyFields?: false | ViewOrderKeySpecifier | (() => undefined | ViewOrderKeySpecifier),
		queryType?: true,
		mutationType?: true,
		subscriptionType?: true,
		fields?: ViewOrderFieldPolicy,
	}
};