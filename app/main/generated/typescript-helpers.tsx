import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any;
};


export type Area = {
  __typename?: 'Area';
  key: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  deleted?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  projects?: Maybe<Array<Maybe<Project>>>;
  items?: Maybe<Array<Maybe<Item>>>;
  sortOrder?: Maybe<AreaOrder>;
};

export type MigrateAreaInput = {
  key: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  deleted?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type CreateAreaInput = {
  key: Scalars['String'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
};

export type DeleteAreaInput = {
  key: Scalars['String'];
};

export type RenameAreaInput = {
  key: Scalars['String'];
  name: Scalars['String'];
};

export type ChangeDescriptionAreaInput = {
  key: Scalars['String'];
  description: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  areas?: Maybe<Array<Maybe<Area>>>;
  area?: Maybe<Area>;
  areaOrders?: Maybe<Array<Maybe<AreaOrder>>>;
  areaOrder?: Maybe<AreaOrder>;
  calendars?: Maybe<Array<Maybe<Calendar>>>;
  calendar?: Maybe<Calendar>;
  getActiveCalendar?: Maybe<Calendar>;
  components?: Maybe<Array<Maybe<Component>>>;
  component?: Maybe<Component>;
  componentsByView?: Maybe<Array<Maybe<Component>>>;
  componentOrders?: Maybe<Array<Maybe<ComponentOrder>>>;
  componentOrder?: Maybe<ComponentOrder>;
  events?: Maybe<Array<Maybe<Event>>>;
  event?: Maybe<Event>;
  eventsByCalendar?: Maybe<Array<Maybe<Event>>>;
  eventsForActiveCalendar?: Maybe<Array<Maybe<Event>>>;
  features?: Maybe<Array<Maybe<Feature>>>;
  feature?: Maybe<Feature>;
  featureByName?: Maybe<Feature>;
  items?: Maybe<Array<Maybe<Item>>>;
  item?: Maybe<Item>;
  itemsByProject?: Maybe<Array<Maybe<Item>>>;
  itemsByArea?: Maybe<Array<Maybe<Item>>>;
  itemsByFilter?: Maybe<Array<Maybe<Item>>>;
  itemsByParent?: Maybe<Array<Maybe<Item>>>;
  itemOrders?: Maybe<Array<Maybe<ItemOrder>>>;
  itemOrder?: Maybe<ItemOrder>;
  labels?: Maybe<Array<Maybe<Label>>>;
  label?: Maybe<Label>;
  projects?: Maybe<Array<Maybe<Project>>>;
  project?: Maybe<Project>;
  projectsByArea?: Maybe<Array<Maybe<Project>>>;
  projectOrders?: Maybe<Array<Maybe<ProjectOrder>>>;
  projectOrder?: Maybe<ProjectOrder>;
  reminders?: Maybe<Array<Maybe<Reminder>>>;
  reminder?: Maybe<Reminder>;
  remindersByItem?: Maybe<Array<Maybe<Reminder>>>;
  views?: Maybe<Array<Maybe<View>>>;
  view?: Maybe<View>;
  viewOrders?: Maybe<Array<Maybe<ViewOrder>>>;
  viewOrder?: Maybe<ViewOrder>;
  weeklyGoals?: Maybe<Array<Maybe<WeeklyGoal>>>;
  weeklyGoal?: Maybe<WeeklyGoal>;
  weeklyGoalByName?: Maybe<WeeklyGoal>;
};


export type QueryAreaArgs = {
  key: Scalars['String'];
};


export type QueryAreaOrderArgs = {
  areaKey: Scalars['String'];
};


export type QueryCalendarArgs = {
  key: Scalars['String'];
};


export type QueryComponentArgs = {
  key: Scalars['String'];
};


export type QueryComponentsByViewArgs = {
  viewKey: Scalars['String'];
};


export type QueryComponentOrderArgs = {
  componentKey: Scalars['String'];
};


export type QueryEventArgs = {
  key: Scalars['String'];
};


export type QueryEventsByCalendarArgs = {
  calendarKey: Scalars['String'];
};


export type QueryFeatureArgs = {
  key: Scalars['String'];
};


export type QueryFeatureByNameArgs = {
  name: Scalars['String'];
};


export type QueryItemArgs = {
  key: Scalars['String'];
};


export type QueryItemsByProjectArgs = {
  projectKey: Scalars['String'];
};


export type QueryItemsByAreaArgs = {
  areaKey: Scalars['String'];
};


export type QueryItemsByFilterArgs = {
  filter: Scalars['String'];
};


export type QueryItemsByParentArgs = {
  parentKey: Scalars['String'];
};


export type QueryItemOrderArgs = {
  itemKey: Scalars['String'];
};


export type QueryLabelArgs = {
  key: Scalars['String'];
};


export type QueryProjectsArgs = {
  input?: Maybe<ProjectsInput>;
};


export type QueryProjectArgs = {
  key: Scalars['String'];
};


export type QueryProjectsByAreaArgs = {
  input: ProjectsByAreaInput;
};


export type QueryProjectOrderArgs = {
  projectKey: Scalars['String'];
};


export type QueryReminderArgs = {
  key: Scalars['String'];
};


export type QueryRemindersByItemArgs = {
  itemKey: Scalars['String'];
};


export type QueryViewArgs = {
  key: Scalars['String'];
};


export type QueryViewOrderArgs = {
  viewKey: Scalars['String'];
};


export type QueryWeeklyGoalArgs = {
  key: Scalars['String'];
};


export type QueryWeeklyGoalByNameArgs = {
  name: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createArea?: Maybe<Area>;
  migrateArea?: Maybe<Area>;
  deleteArea?: Maybe<Area>;
  renameArea?: Maybe<Area>;
  changeDescriptionArea?: Maybe<Area>;
  setAreaOrder?: Maybe<AreaOrder>;
  createAreaOrder?: Maybe<AreaOrder>;
  migrateAreaOrder?: Maybe<AreaOrder>;
  createCalendar?: Maybe<Calendar>;
  deleteCalendar?: Maybe<Calendar>;
  setActiveCalendar?: Maybe<Calendar>;
  createFilteredItemListComponent?: Maybe<Component>;
  createViewHeaderComponent?: Maybe<Component>;
  setParametersOfFilteredItemListComponent?: Maybe<Component>;
  migrateComponent?: Maybe<Component>;
  deleteComponent?: Maybe<Component>;
  setComponentOrder?: Maybe<ComponentOrder>;
  createComponentOrder?: Maybe<ComponentOrder>;
  migrateComponentOrder?: Maybe<ComponentOrder>;
  createEvent?: Maybe<Event>;
  deleteEvent?: Maybe<Scalars['String']>;
  createFeature?: Maybe<Feature>;
  setFeature?: Maybe<Feature>;
  createItem?: Maybe<Item>;
  migrateItem?: Maybe<Item>;
  deleteItem?: Maybe<Item>;
  restoreItem?: Maybe<Item>;
  renameItem?: Maybe<Item>;
  setTypeOfItem?: Maybe<Item>;
  completeItem?: Maybe<Item>;
  unCompleteItem?: Maybe<Item>;
  setRepeatOfItem?: Maybe<Item>;
  cloneItem?: Maybe<Item>;
  setProjectOfItem?: Maybe<Item>;
  setAreaOfItem?: Maybe<Item>;
  setScheduledAtOfItem?: Maybe<Item>;
  setDueAtOfItem?: Maybe<Item>;
  setParentOfItem?: Maybe<Item>;
  permanentDeleteItem?: Maybe<Item>;
  setLabelOfItem?: Maybe<Item>;
  setItemOrder?: Maybe<ItemOrder>;
  createItemOrder?: Maybe<ItemOrder>;
  migrateItemOrder?: Maybe<ItemOrder>;
  createLabel?: Maybe<Label>;
  renameLabel?: Maybe<Label>;
  setColourOfLabel?: Maybe<Label>;
  deleteLabel?: Maybe<Scalars['String']>;
  createProject?: Maybe<Project>;
  migrateProject?: Maybe<Project>;
  deleteProject?: Maybe<Project>;
  renameProject?: Maybe<Project>;
  changeDescriptionProject?: Maybe<Project>;
  setEndDateOfProject?: Maybe<Project>;
  setStartDateOfProject?: Maybe<Project>;
  setAreaOfProject?: Maybe<Project>;
  setProjectOrder?: Maybe<ProjectOrder>;
  createProjectOrder?: Maybe<ProjectOrder>;
  migrateProjectOrder?: Maybe<ProjectOrder>;
  createReminder?: Maybe<Reminder>;
  deleteReminder?: Maybe<Reminder>;
  deleteReminderFromItem?: Maybe<Reminder>;
  createView?: Maybe<View>;
  migrateView?: Maybe<View>;
  deleteView?: Maybe<View>;
  renameView?: Maybe<View>;
  setViewOrder?: Maybe<ViewOrder>;
  createViewOrder?: Maybe<ViewOrder>;
  migrateViewOrder?: Maybe<ViewOrder>;
  createWeeklyGoal?: Maybe<WeeklyGoal>;
};


export type MutationCreateAreaArgs = {
  input: CreateAreaInput;
};


export type MutationMigrateAreaArgs = {
  input: MigrateAreaInput;
};


export type MutationDeleteAreaArgs = {
  input: DeleteAreaInput;
};


export type MutationRenameAreaArgs = {
  input: RenameAreaInput;
};


export type MutationChangeDescriptionAreaArgs = {
  input: ChangeDescriptionAreaInput;
};


export type MutationSetAreaOrderArgs = {
  input: SetAreaOrderInput;
};


export type MutationCreateAreaOrderArgs = {
  input: CreateAreaOrderInput;
};


export type MutationMigrateAreaOrderArgs = {
  input: MigrateAreaOrderInput;
};


export type MutationCreateCalendarArgs = {
  input: CreateCalendarInput;
};


export type MutationDeleteCalendarArgs = {
  input: DeleteCalendarInput;
};


export type MutationSetActiveCalendarArgs = {
  input: ActiveCalendarInput;
};


export type MutationCreateFilteredItemListComponentArgs = {
  input: CreateFilteredItemListComponentInput;
};


export type MutationCreateViewHeaderComponentArgs = {
  input: CreateViewHeaderComponentInput;
};


export type MutationSetParametersOfFilteredItemListComponentArgs = {
  input: SetParametersOfFilteredItemListComponentInput;
};


export type MutationMigrateComponentArgs = {
  input: MigrateComponentInput;
};


export type MutationDeleteComponentArgs = {
  input: DeleteComponentInput;
};


export type MutationSetComponentOrderArgs = {
  input: SetComponentOrderInput;
};


export type MutationCreateComponentOrderArgs = {
  input: CreateComponentOrderInput;
};


export type MutationMigrateComponentOrderArgs = {
  input: MigrateComponentOrderInput;
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
};


export type MutationDeleteEventArgs = {
  input: DeleteEventInput;
};


export type MutationCreateFeatureArgs = {
  input: CreateFeatureInput;
};


export type MutationSetFeatureArgs = {
  input: SetFeatureInput;
};


export type MutationCreateItemArgs = {
  input: CreateItemInput;
};


export type MutationMigrateItemArgs = {
  input: MigrateItemInput;
};


export type MutationDeleteItemArgs = {
  input: DeleteItemInput;
};


export type MutationRestoreItemArgs = {
  input: RestoreItemInput;
};


export type MutationRenameItemArgs = {
  input: RenameItemInput;
};


export type MutationSetTypeOfItemArgs = {
  input: SetTypeOfItemInput;
};


export type MutationCompleteItemArgs = {
  input: CompleteItemInput;
};


export type MutationUnCompleteItemArgs = {
  input: UnCompleteItemInput;
};


export type MutationSetRepeatOfItemArgs = {
  input: SetRepeatOfItemInput;
};


export type MutationCloneItemArgs = {
  input: CloneItemInput;
};


export type MutationSetProjectOfItemArgs = {
  input: SetProjectOfItemInput;
};


export type MutationSetAreaOfItemArgs = {
  input: SetAreaOfItemInput;
};


export type MutationSetScheduledAtOfItemArgs = {
  input: SetScheduledAtOfItemInput;
};


export type MutationSetDueAtOfItemArgs = {
  input: SetDueAtOfItemInput;
};


export type MutationSetParentOfItemArgs = {
  input: SetParentOfItemInput;
};


export type MutationPermanentDeleteItemArgs = {
  input: PermanentDeleteInput;
};


export type MutationSetLabelOfItemArgs = {
  input: SetLabelOfInput;
};


export type MutationSetItemOrderArgs = {
  input: SetItemOrderInput;
};


export type MutationCreateItemOrderArgs = {
  input: CreateItemOrderInput;
};


export type MutationMigrateItemOrderArgs = {
  input: MigrateItemOrderInput;
};


export type MutationCreateLabelArgs = {
  input: CreateLabelInput;
};


export type MutationRenameLabelArgs = {
  input: RenameLabelInput;
};


export type MutationSetColourOfLabelArgs = {
  input: SetColourOfLabelInput;
};


export type MutationDeleteLabelArgs = {
  input: DeleteLabelInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationMigrateProjectArgs = {
  input: MigrateProjectInput;
};


export type MutationDeleteProjectArgs = {
  input: DeleteProjectInput;
};


export type MutationRenameProjectArgs = {
  input: RenameProjectInput;
};


export type MutationChangeDescriptionProjectArgs = {
  input: ChangeDescriptionProjectInput;
};


export type MutationSetEndDateOfProjectArgs = {
  input: SetEndDateOfProjectInput;
};


export type MutationSetStartDateOfProjectArgs = {
  input: SetStartDateOfProjectInput;
};


export type MutationSetAreaOfProjectArgs = {
  input: SetAreaOfProjectInput;
};


export type MutationSetProjectOrderArgs = {
  input: SetProjectOrderInput;
};


export type MutationCreateProjectOrderArgs = {
  input: CreateProjectOrderInput;
};


export type MutationMigrateProjectOrderArgs = {
  input: MigrateProjectOrderInput;
};


export type MutationCreateReminderArgs = {
  input: CreateReminderInput;
};


export type MutationDeleteReminderArgs = {
  input: DeleteReminderInput;
};


export type MutationDeleteReminderFromItemArgs = {
  input: DeleteReminderFromItemInput;
};


export type MutationCreateViewArgs = {
  input: CreateViewInput;
};


export type MutationMigrateViewArgs = {
  input: MigrateViewInput;
};


export type MutationDeleteViewArgs = {
  input: DeleteViewInput;
};


export type MutationRenameViewArgs = {
  input: RenameViewInput;
};


export type MutationSetViewOrderArgs = {
  input: SetViewOrderInput;
};


export type MutationCreateViewOrderArgs = {
  input: CreateViewOrderInput;
};


export type MutationMigrateViewOrderArgs = {
  input: MigrateViewOrderInput;
};


export type MutationCreateWeeklyGoalArgs = {
  input: CreateWeeklyGoalInput;
};

export type AreaOrder = {
  __typename?: 'AreaOrder';
  areaKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type SetAreaOrderInput = {
  areaKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type CreateAreaOrderInput = {
  areaKey: Scalars['String'];
};

export type MigrateAreaOrderInput = {
  areaKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type Calendar = {
  __typename?: 'Calendar';
  key: Scalars['String'];
  name: Scalars['String'];
  active?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['Boolean']>;
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  events?: Maybe<Array<Maybe<Event>>>;
};

export type CreateCalendarInput = {
  key: Scalars['String'];
  name: Scalars['String'];
  active: Scalars['Boolean'];
};

export type DeleteCalendarInput = {
  key: Scalars['String'];
};

export type ActiveCalendarInput = {
  key: Scalars['String'];
  active?: Maybe<Scalars['Boolean']>;
};

export type Component = {
  __typename?: 'Component';
  key: Scalars['String'];
  viewKey: View;
  location: Scalars['String'];
  type: Scalars['String'];
  parameters?: Maybe<Scalars['String']>;
  sortOrder: ComponentOrder;
};

export type CreateFilteredItemListComponentInput = {
  key: Scalars['String'];
  viewKey: Scalars['String'];
  location: Scalars['String'];
  type: Scalars['String'];
  parameters?: Maybe<FilteredItemListPropsInput>;
};

export type CreateViewHeaderComponentInput = {
  key: Scalars['String'];
  viewKey: Scalars['String'];
  location: Scalars['String'];
  type: Scalars['String'];
  parameters?: Maybe<ViewHeaderPropsInput>;
};

export type FilteredItemListPropsInput = {
  legacyFilter?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  hiddenIcons?: Maybe<Array<Maybe<Scalars['String']>>>;
  isFilterable?: Maybe<Scalars['Boolean']>;
  listName?: Maybe<Scalars['String']>;
  flattenSubtasks?: Maybe<Scalars['Boolean']>;
  showCompletedToggle?: Maybe<Scalars['Boolean']>;
  initiallyExpanded?: Maybe<Scalars['Boolean']>;
};

export type SetParametersOfFilteredItemListComponentInput = {
  key: Scalars['String'];
  parameters: FilteredItemListPropsInput;
};

export type ViewHeaderPropsInput = {
  name: Scalars['String'];
  icon?: Maybe<Scalars['String']>;
};

export type DeleteComponentInput = {
  key: Scalars['String'];
};

export type MigrateComponentInput = {
  key: Scalars['String'];
  viewKey: Scalars['String'];
  location: Scalars['String'];
  type: Scalars['String'];
  parameters: Scalars['String'];
};

export type ComponentOrder = {
  __typename?: 'ComponentOrder';
  componentKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type SetComponentOrderInput = {
  componentKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type CreateComponentOrderInput = {
  componentKey: Scalars['String'];
};

export type MigrateComponentOrderInput = {
  componentKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type Event = {
  __typename?: 'Event';
  key: Scalars['String'];
  title: Scalars['String'];
  startAt?: Maybe<Scalars['DateTime']>;
  endAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  allDay?: Maybe<Scalars['Boolean']>;
  calendar?: Maybe<Calendar>;
};

export type CreateEventInput = {
  key: Scalars['String'];
  title: Scalars['String'];
  startAt?: Maybe<Scalars['DateTime']>;
  endAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  allDay?: Maybe<Scalars['Boolean']>;
  calendarKey?: Maybe<Scalars['String']>;
};

export type DeleteEventInput = {
  key: Scalars['String'];
};

export type Feature = {
  __typename?: 'Feature';
  key: Scalars['String'];
  name: Scalars['String'];
  enabled?: Maybe<Scalars['Boolean']>;
};

export type CreateFeatureInput = {
  key: Scalars['String'];
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export type SetFeatureInput = {
  key: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export type Item = {
  __typename?: 'Item';
  key: Scalars['String'];
  type?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  deleted?: Maybe<Scalars['Boolean']>;
  completed?: Maybe<Scalars['Boolean']>;
  parent?: Maybe<Item>;
  project?: Maybe<Project>;
  dueAt?: Maybe<Scalars['DateTime']>;
  scheduledAt?: Maybe<Scalars['DateTime']>;
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  completedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  repeat?: Maybe<Scalars['String']>;
  label?: Maybe<Label>;
  area?: Maybe<Area>;
  children?: Maybe<Array<Maybe<Item>>>;
  sortOrder: ItemOrder;
  reminders?: Maybe<Array<Maybe<Reminder>>>;
};

export type CreateItemInput = {
  key: Scalars['String'];
  type: Scalars['String'];
  text: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  parentKey?: Maybe<Scalars['String']>;
  projectKey?: Maybe<Scalars['String']>;
  dueAt?: Maybe<Scalars['DateTime']>;
  scheduledAt?: Maybe<Scalars['DateTime']>;
  repeat?: Maybe<Scalars['String']>;
  labelKey?: Maybe<Scalars['String']>;
};

export type MigrateItemInput = {
  key: Scalars['String'];
  type?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  deleted?: Maybe<Scalars['Boolean']>;
  completed?: Maybe<Scalars['Boolean']>;
  parentKey?: Maybe<Scalars['String']>;
  projectKey?: Maybe<Scalars['String']>;
  dueAt?: Maybe<Scalars['DateTime']>;
  scheduledAt?: Maybe<Scalars['DateTime']>;
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  completedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  repeat?: Maybe<Scalars['String']>;
  labelKey?: Maybe<Scalars['String']>;
  areaKey?: Maybe<Scalars['String']>;
};

export type SetTypeOfItemInput = {
  key: Scalars['String'];
  type: Scalars['String'];
};

export type DeleteItemInput = {
  key: Scalars['String'];
};

export type RestoreItemInput = {
  key: Scalars['String'];
};

export type RenameItemInput = {
  key: Scalars['String'];
  text: Scalars['String'];
};

export type CompleteItemInput = {
  key: Scalars['String'];
};

export type UnCompleteItemInput = {
  key: Scalars['String'];
};

export type SetRepeatOfItemInput = {
  key: Scalars['String'];
  repeat?: Maybe<Scalars['String']>;
};

export type CloneItemInput = {
  key: Scalars['String'];
};

export type SetProjectOfItemInput = {
  key: Scalars['String'];
  projectKey?: Maybe<Scalars['String']>;
};

export type SetAreaOfItemInput = {
  key: Scalars['String'];
  areaKey?: Maybe<Scalars['String']>;
};

export type SetScheduledAtOfItemInput = {
  key: Scalars['String'];
  scheduledAt?: Maybe<Scalars['DateTime']>;
};

export type SetDueAtOfItemInput = {
  key: Scalars['String'];
  dueAt?: Maybe<Scalars['DateTime']>;
};

export type SetParentOfItemInput = {
  key: Scalars['String'];
  parentKey?: Maybe<Scalars['String']>;
};

export type PermanentDeleteInput = {
  key: Scalars['String'];
};

export type SetLabelOfInput = {
  key: Scalars['String'];
  labelKey?: Maybe<Scalars['String']>;
};

export type ItemOrder = {
  __typename?: 'ItemOrder';
  itemKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type CreateItemOrderInput = {
  itemKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type SetItemOrderInput = {
  itemKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type MigrateItemOrderInput = {
  itemKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type Label = {
  __typename?: 'Label';
  key: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  colour?: Maybe<Scalars['String']>;
};

export type CreateLabelInput = {
  key: Scalars['String'];
  name: Scalars['String'];
  colour: Scalars['String'];
};

export type RenameLabelInput = {
  key: Scalars['String'];
  name: Scalars['String'];
};

export type SetColourOfLabelInput = {
  key: Scalars['String'];
  colour: Scalars['String'];
};

export type DeleteLabelInput = {
  key: Scalars['String'];
};

export type Project = {
  __typename?: 'Project';
  key: Scalars['String'];
  name: Scalars['String'];
  deleted?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  startAt?: Maybe<Scalars['DateTime']>;
  endAt?: Maybe<Scalars['DateTime']>;
  area?: Maybe<Area>;
  items?: Maybe<Array<Maybe<Item>>>;
  sortOrder?: Maybe<ProjectOrder>;
};

export type CreateProjectInput = {
  key: Scalars['String'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  startAt?: Maybe<Scalars['DateTime']>;
  endAt?: Maybe<Scalars['DateTime']>;
  areaKey?: Maybe<Scalars['String']>;
};

export type MigrateProjectInput = {
  key: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  deleted?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  startAt?: Maybe<Scalars['DateTime']>;
  endAt?: Maybe<Scalars['DateTime']>;
  areaKey?: Maybe<Scalars['String']>;
};

export type DeleteProjectInput = {
  key: Scalars['String'];
};

export type RenameProjectInput = {
  key: Scalars['String'];
  name: Scalars['String'];
};

export type ChangeDescriptionProjectInput = {
  key: Scalars['String'];
  description: Scalars['String'];
};

export type SetEndDateOfProjectInput = {
  key: Scalars['String'];
  endAt: Scalars['String'];
};

export type SetStartDateOfProjectInput = {
  key: Scalars['String'];
  startAt: Scalars['String'];
};

export type ProjectsInput = {
  deleted?: Maybe<Scalars['Boolean']>;
};

export type ProjectsByAreaInput = {
  areaKey: Scalars['String'];
};

export type SetAreaOfProjectInput = {
  key: Scalars['String'];
  areaKey: Scalars['String'];
};

export type ProjectOrder = {
  __typename?: 'ProjectOrder';
  projectKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type CreateProjectOrderInput = {
  projectKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type SetProjectOrderInput = {
  projectKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type MigrateProjectOrderInput = {
  projectKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type Reminder = {
  __typename?: 'Reminder';
  key: Scalars['String'];
  text?: Maybe<Scalars['String']>;
  deleted?: Maybe<Scalars['Boolean']>;
  remindAt?: Maybe<Scalars['DateTime']>;
  item?: Maybe<Item>;
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type CreateReminderInput = {
  key: Scalars['String'];
  text: Scalars['String'];
  remindAt?: Maybe<Scalars['DateTime']>;
  itemKey?: Maybe<Scalars['String']>;
};

export type DeleteReminderInput = {
  key: Scalars['String'];
};

export type DeleteReminderFromItemInput = {
  itemKey: Scalars['String'];
};

export type View = {
  __typename?: 'View';
  key: Scalars['String'];
  name: Scalars['String'];
  icon: Scalars['String'];
  type: Scalars['String'];
  deleted: Scalars['Boolean'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  sortOrder?: Maybe<ViewOrder>;
};

export type MigrateViewInput = {
  key: Scalars['String'];
  name: Scalars['String'];
  icon?: Maybe<Scalars['String']>;
  type: Scalars['String'];
};

export type CreateViewInput = {
  key: Scalars['String'];
  name: Scalars['String'];
  icon?: Maybe<Scalars['String']>;
  type: Scalars['String'];
};

export type DeleteViewInput = {
  key: Scalars['String'];
};

export type RenameViewInput = {
  key: Scalars['String'];
  name: Scalars['String'];
};

export type ViewOrder = {
  __typename?: 'ViewOrder';
  viewKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type SetViewOrderInput = {
  viewKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type CreateViewOrderInput = {
  viewKey: Scalars['String'];
};

export type MigrateViewOrderInput = {
  viewKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type WeeklyGoal = {
  __typename?: 'WeeklyGoal';
  key: Scalars['String'];
  week: Scalars['String'];
  goal?: Maybe<Scalars['String']>;
};

export type CreateWeeklyGoalInput = {
  key: Scalars['String'];
  week: Scalars['String'];
  goal?: Maybe<Scalars['String']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  Area: ResolverTypeWrapper<Area>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  MigrateAreaInput: MigrateAreaInput;
  CreateAreaInput: CreateAreaInput;
  DeleteAreaInput: DeleteAreaInput;
  RenameAreaInput: RenameAreaInput;
  ChangeDescriptionAreaInput: ChangeDescriptionAreaInput;
  Query: ResolverTypeWrapper<{}>;
  Mutation: ResolverTypeWrapper<{}>;
  AreaOrder: ResolverTypeWrapper<AreaOrder>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  SetAreaOrderInput: SetAreaOrderInput;
  CreateAreaOrderInput: CreateAreaOrderInput;
  MigrateAreaOrderInput: MigrateAreaOrderInput;
  Calendar: ResolverTypeWrapper<Calendar>;
  CreateCalendarInput: CreateCalendarInput;
  DeleteCalendarInput: DeleteCalendarInput;
  ActiveCalendarInput: ActiveCalendarInput;
  Component: ResolverTypeWrapper<Component>;
  CreateFilteredItemListComponentInput: CreateFilteredItemListComponentInput;
  CreateViewHeaderComponentInput: CreateViewHeaderComponentInput;
  FilteredItemListPropsInput: FilteredItemListPropsInput;
  SetParametersOfFilteredItemListComponentInput: SetParametersOfFilteredItemListComponentInput;
  ViewHeaderPropsInput: ViewHeaderPropsInput;
  DeleteComponentInput: DeleteComponentInput;
  MigrateComponentInput: MigrateComponentInput;
  ComponentOrder: ResolverTypeWrapper<ComponentOrder>;
  SetComponentOrderInput: SetComponentOrderInput;
  CreateComponentOrderInput: CreateComponentOrderInput;
  MigrateComponentOrderInput: MigrateComponentOrderInput;
  Event: ResolverTypeWrapper<Event>;
  CreateEventInput: CreateEventInput;
  DeleteEventInput: DeleteEventInput;
  Feature: ResolverTypeWrapper<Feature>;
  CreateFeatureInput: CreateFeatureInput;
  SetFeatureInput: SetFeatureInput;
  Item: ResolverTypeWrapper<Item>;
  CreateItemInput: CreateItemInput;
  MigrateItemInput: MigrateItemInput;
  SetTypeOfItemInput: SetTypeOfItemInput;
  DeleteItemInput: DeleteItemInput;
  RestoreItemInput: RestoreItemInput;
  RenameItemInput: RenameItemInput;
  CompleteItemInput: CompleteItemInput;
  UnCompleteItemInput: UnCompleteItemInput;
  SetRepeatOfItemInput: SetRepeatOfItemInput;
  CloneItemInput: CloneItemInput;
  SetProjectOfItemInput: SetProjectOfItemInput;
  SetAreaOfItemInput: SetAreaOfItemInput;
  SetScheduledAtOfItemInput: SetScheduledAtOfItemInput;
  SetDueAtOfItemInput: SetDueAtOfItemInput;
  SetParentOfItemInput: SetParentOfItemInput;
  PermanentDeleteInput: PermanentDeleteInput;
  SetLabelOfInput: SetLabelOfInput;
  ItemOrder: ResolverTypeWrapper<ItemOrder>;
  CreateItemOrderInput: CreateItemOrderInput;
  SetItemOrderInput: SetItemOrderInput;
  MigrateItemOrderInput: MigrateItemOrderInput;
  Label: ResolverTypeWrapper<Label>;
  CreateLabelInput: CreateLabelInput;
  RenameLabelInput: RenameLabelInput;
  SetColourOfLabelInput: SetColourOfLabelInput;
  DeleteLabelInput: DeleteLabelInput;
  Project: ResolverTypeWrapper<Project>;
  CreateProjectInput: CreateProjectInput;
  MigrateProjectInput: MigrateProjectInput;
  DeleteProjectInput: DeleteProjectInput;
  RenameProjectInput: RenameProjectInput;
  ChangeDescriptionProjectInput: ChangeDescriptionProjectInput;
  SetEndDateOfProjectInput: SetEndDateOfProjectInput;
  SetStartDateOfProjectInput: SetStartDateOfProjectInput;
  ProjectsInput: ProjectsInput;
  ProjectsByAreaInput: ProjectsByAreaInput;
  SetAreaOfProjectInput: SetAreaOfProjectInput;
  ProjectOrder: ResolverTypeWrapper<ProjectOrder>;
  CreateProjectOrderInput: CreateProjectOrderInput;
  SetProjectOrderInput: SetProjectOrderInput;
  MigrateProjectOrderInput: MigrateProjectOrderInput;
  Reminder: ResolverTypeWrapper<Reminder>;
  CreateReminderInput: CreateReminderInput;
  DeleteReminderInput: DeleteReminderInput;
  DeleteReminderFromItemInput: DeleteReminderFromItemInput;
  View: ResolverTypeWrapper<View>;
  MigrateViewInput: MigrateViewInput;
  CreateViewInput: CreateViewInput;
  DeleteViewInput: DeleteViewInput;
  RenameViewInput: RenameViewInput;
  ViewOrder: ResolverTypeWrapper<ViewOrder>;
  SetViewOrderInput: SetViewOrderInput;
  CreateViewOrderInput: CreateViewOrderInput;
  MigrateViewOrderInput: MigrateViewOrderInput;
  WeeklyGoal: ResolverTypeWrapper<WeeklyGoal>;
  CreateWeeklyGoalInput: CreateWeeklyGoalInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  DateTime: Scalars['DateTime'];
  Area: Area;
  String: Scalars['String'];
  Boolean: Scalars['Boolean'];
  MigrateAreaInput: MigrateAreaInput;
  CreateAreaInput: CreateAreaInput;
  DeleteAreaInput: DeleteAreaInput;
  RenameAreaInput: RenameAreaInput;
  ChangeDescriptionAreaInput: ChangeDescriptionAreaInput;
  Query: {};
  Mutation: {};
  AreaOrder: AreaOrder;
  Int: Scalars['Int'];
  SetAreaOrderInput: SetAreaOrderInput;
  CreateAreaOrderInput: CreateAreaOrderInput;
  MigrateAreaOrderInput: MigrateAreaOrderInput;
  Calendar: Calendar;
  CreateCalendarInput: CreateCalendarInput;
  DeleteCalendarInput: DeleteCalendarInput;
  ActiveCalendarInput: ActiveCalendarInput;
  Component: Component;
  CreateFilteredItemListComponentInput: CreateFilteredItemListComponentInput;
  CreateViewHeaderComponentInput: CreateViewHeaderComponentInput;
  FilteredItemListPropsInput: FilteredItemListPropsInput;
  SetParametersOfFilteredItemListComponentInput: SetParametersOfFilteredItemListComponentInput;
  ViewHeaderPropsInput: ViewHeaderPropsInput;
  DeleteComponentInput: DeleteComponentInput;
  MigrateComponentInput: MigrateComponentInput;
  ComponentOrder: ComponentOrder;
  SetComponentOrderInput: SetComponentOrderInput;
  CreateComponentOrderInput: CreateComponentOrderInput;
  MigrateComponentOrderInput: MigrateComponentOrderInput;
  Event: Event;
  CreateEventInput: CreateEventInput;
  DeleteEventInput: DeleteEventInput;
  Feature: Feature;
  CreateFeatureInput: CreateFeatureInput;
  SetFeatureInput: SetFeatureInput;
  Item: Item;
  CreateItemInput: CreateItemInput;
  MigrateItemInput: MigrateItemInput;
  SetTypeOfItemInput: SetTypeOfItemInput;
  DeleteItemInput: DeleteItemInput;
  RestoreItemInput: RestoreItemInput;
  RenameItemInput: RenameItemInput;
  CompleteItemInput: CompleteItemInput;
  UnCompleteItemInput: UnCompleteItemInput;
  SetRepeatOfItemInput: SetRepeatOfItemInput;
  CloneItemInput: CloneItemInput;
  SetProjectOfItemInput: SetProjectOfItemInput;
  SetAreaOfItemInput: SetAreaOfItemInput;
  SetScheduledAtOfItemInput: SetScheduledAtOfItemInput;
  SetDueAtOfItemInput: SetDueAtOfItemInput;
  SetParentOfItemInput: SetParentOfItemInput;
  PermanentDeleteInput: PermanentDeleteInput;
  SetLabelOfInput: SetLabelOfInput;
  ItemOrder: ItemOrder;
  CreateItemOrderInput: CreateItemOrderInput;
  SetItemOrderInput: SetItemOrderInput;
  MigrateItemOrderInput: MigrateItemOrderInput;
  Label: Label;
  CreateLabelInput: CreateLabelInput;
  RenameLabelInput: RenameLabelInput;
  SetColourOfLabelInput: SetColourOfLabelInput;
  DeleteLabelInput: DeleteLabelInput;
  Project: Project;
  CreateProjectInput: CreateProjectInput;
  MigrateProjectInput: MigrateProjectInput;
  DeleteProjectInput: DeleteProjectInput;
  RenameProjectInput: RenameProjectInput;
  ChangeDescriptionProjectInput: ChangeDescriptionProjectInput;
  SetEndDateOfProjectInput: SetEndDateOfProjectInput;
  SetStartDateOfProjectInput: SetStartDateOfProjectInput;
  ProjectsInput: ProjectsInput;
  ProjectsByAreaInput: ProjectsByAreaInput;
  SetAreaOfProjectInput: SetAreaOfProjectInput;
  ProjectOrder: ProjectOrder;
  CreateProjectOrderInput: CreateProjectOrderInput;
  SetProjectOrderInput: SetProjectOrderInput;
  MigrateProjectOrderInput: MigrateProjectOrderInput;
  Reminder: Reminder;
  CreateReminderInput: CreateReminderInput;
  DeleteReminderInput: DeleteReminderInput;
  DeleteReminderFromItemInput: DeleteReminderFromItemInput;
  View: View;
  MigrateViewInput: MigrateViewInput;
  CreateViewInput: CreateViewInput;
  DeleteViewInput: DeleteViewInput;
  RenameViewInput: RenameViewInput;
  ViewOrder: ViewOrder;
  SetViewOrderInput: SetViewOrderInput;
  CreateViewOrderInput: CreateViewOrderInput;
  MigrateViewOrderInput: MigrateViewOrderInput;
  WeeklyGoal: WeeklyGoal;
  CreateWeeklyGoalInput: CreateWeeklyGoalInput;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type AreaResolvers<ContextType = any, ParentType extends ResolversParentTypes['Area'] = ResolversParentTypes['Area']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastUpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  projects?: Resolver<Maybe<Array<Maybe<ResolversTypes['Project']>>>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType>;
  sortOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  areas?: Resolver<Maybe<Array<Maybe<ResolversTypes['Area']>>>, ParentType, ContextType>;
  area?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<QueryAreaArgs, 'key'>>;
  areaOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['AreaOrder']>>>, ParentType, ContextType>;
  areaOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType, RequireFields<QueryAreaOrderArgs, 'areaKey'>>;
  calendars?: Resolver<Maybe<Array<Maybe<ResolversTypes['Calendar']>>>, ParentType, ContextType>;
  calendar?: Resolver<Maybe<ResolversTypes['Calendar']>, ParentType, ContextType, RequireFields<QueryCalendarArgs, 'key'>>;
  getActiveCalendar?: Resolver<Maybe<ResolversTypes['Calendar']>, ParentType, ContextType>;
  components?: Resolver<Maybe<Array<Maybe<ResolversTypes['Component']>>>, ParentType, ContextType>;
  component?: Resolver<Maybe<ResolversTypes['Component']>, ParentType, ContextType, RequireFields<QueryComponentArgs, 'key'>>;
  componentsByView?: Resolver<Maybe<Array<Maybe<ResolversTypes['Component']>>>, ParentType, ContextType, RequireFields<QueryComponentsByViewArgs, 'viewKey'>>;
  componentOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['ComponentOrder']>>>, ParentType, ContextType>;
  componentOrder?: Resolver<Maybe<ResolversTypes['ComponentOrder']>, ParentType, ContextType, RequireFields<QueryComponentOrderArgs, 'componentKey'>>;
  events?: Resolver<Maybe<Array<Maybe<ResolversTypes['Event']>>>, ParentType, ContextType>;
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventArgs, 'key'>>;
  eventsByCalendar?: Resolver<Maybe<Array<Maybe<ResolversTypes['Event']>>>, ParentType, ContextType, RequireFields<QueryEventsByCalendarArgs, 'calendarKey'>>;
  eventsForActiveCalendar?: Resolver<Maybe<Array<Maybe<ResolversTypes['Event']>>>, ParentType, ContextType>;
  features?: Resolver<Maybe<Array<Maybe<ResolversTypes['Feature']>>>, ParentType, ContextType>;
  feature?: Resolver<Maybe<ResolversTypes['Feature']>, ParentType, ContextType, RequireFields<QueryFeatureArgs, 'key'>>;
  featureByName?: Resolver<Maybe<ResolversTypes['Feature']>, ParentType, ContextType, RequireFields<QueryFeatureByNameArgs, 'name'>>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType>;
  item?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<QueryItemArgs, 'key'>>;
  itemsByProject?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType, RequireFields<QueryItemsByProjectArgs, 'projectKey'>>;
  itemsByArea?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType, RequireFields<QueryItemsByAreaArgs, 'areaKey'>>;
  itemsByFilter?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType, RequireFields<QueryItemsByFilterArgs, 'filter'>>;
  itemsByParent?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType, RequireFields<QueryItemsByParentArgs, 'parentKey'>>;
  itemOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['ItemOrder']>>>, ParentType, ContextType>;
  itemOrder?: Resolver<Maybe<ResolversTypes['ItemOrder']>, ParentType, ContextType, RequireFields<QueryItemOrderArgs, 'itemKey'>>;
  labels?: Resolver<Maybe<Array<Maybe<ResolversTypes['Label']>>>, ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<QueryLabelArgs, 'key'>>;
  projects?: Resolver<Maybe<Array<Maybe<ResolversTypes['Project']>>>, ParentType, ContextType, RequireFields<QueryProjectsArgs, never>>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<QueryProjectArgs, 'key'>>;
  projectsByArea?: Resolver<Maybe<Array<Maybe<ResolversTypes['Project']>>>, ParentType, ContextType, RequireFields<QueryProjectsByAreaArgs, 'input'>>;
  projectOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectOrder']>>>, ParentType, ContextType>;
  projectOrder?: Resolver<Maybe<ResolversTypes['ProjectOrder']>, ParentType, ContextType, RequireFields<QueryProjectOrderArgs, 'projectKey'>>;
  reminders?: Resolver<Maybe<Array<Maybe<ResolversTypes['Reminder']>>>, ParentType, ContextType>;
  reminder?: Resolver<Maybe<ResolversTypes['Reminder']>, ParentType, ContextType, RequireFields<QueryReminderArgs, 'key'>>;
  remindersByItem?: Resolver<Maybe<Array<Maybe<ResolversTypes['Reminder']>>>, ParentType, ContextType, RequireFields<QueryRemindersByItemArgs, 'itemKey'>>;
  views?: Resolver<Maybe<Array<Maybe<ResolversTypes['View']>>>, ParentType, ContextType>;
  view?: Resolver<Maybe<ResolversTypes['View']>, ParentType, ContextType, RequireFields<QueryViewArgs, 'key'>>;
  viewOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['ViewOrder']>>>, ParentType, ContextType>;
  viewOrder?: Resolver<Maybe<ResolversTypes['ViewOrder']>, ParentType, ContextType, RequireFields<QueryViewOrderArgs, 'viewKey'>>;
  weeklyGoals?: Resolver<Maybe<Array<Maybe<ResolversTypes['WeeklyGoal']>>>, ParentType, ContextType>;
  weeklyGoal?: Resolver<Maybe<ResolversTypes['WeeklyGoal']>, ParentType, ContextType, RequireFields<QueryWeeklyGoalArgs, 'key'>>;
  weeklyGoalByName?: Resolver<Maybe<ResolversTypes['WeeklyGoal']>, ParentType, ContextType, RequireFields<QueryWeeklyGoalByNameArgs, 'name'>>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationCreateAreaArgs, 'input'>>;
  migrateArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationMigrateAreaArgs, 'input'>>;
  deleteArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationDeleteAreaArgs, 'input'>>;
  renameArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationRenameAreaArgs, 'input'>>;
  changeDescriptionArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationChangeDescriptionAreaArgs, 'input'>>;
  setAreaOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType, RequireFields<MutationSetAreaOrderArgs, 'input'>>;
  createAreaOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType, RequireFields<MutationCreateAreaOrderArgs, 'input'>>;
  migrateAreaOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType, RequireFields<MutationMigrateAreaOrderArgs, 'input'>>;
  createCalendar?: Resolver<Maybe<ResolversTypes['Calendar']>, ParentType, ContextType, RequireFields<MutationCreateCalendarArgs, 'input'>>;
  deleteCalendar?: Resolver<Maybe<ResolversTypes['Calendar']>, ParentType, ContextType, RequireFields<MutationDeleteCalendarArgs, 'input'>>;
  setActiveCalendar?: Resolver<Maybe<ResolversTypes['Calendar']>, ParentType, ContextType, RequireFields<MutationSetActiveCalendarArgs, 'input'>>;
  createFilteredItemListComponent?: Resolver<Maybe<ResolversTypes['Component']>, ParentType, ContextType, RequireFields<MutationCreateFilteredItemListComponentArgs, 'input'>>;
  createViewHeaderComponent?: Resolver<Maybe<ResolversTypes['Component']>, ParentType, ContextType, RequireFields<MutationCreateViewHeaderComponentArgs, 'input'>>;
  setParametersOfFilteredItemListComponent?: Resolver<Maybe<ResolversTypes['Component']>, ParentType, ContextType, RequireFields<MutationSetParametersOfFilteredItemListComponentArgs, 'input'>>;
  migrateComponent?: Resolver<Maybe<ResolversTypes['Component']>, ParentType, ContextType, RequireFields<MutationMigrateComponentArgs, 'input'>>;
  deleteComponent?: Resolver<Maybe<ResolversTypes['Component']>, ParentType, ContextType, RequireFields<MutationDeleteComponentArgs, 'input'>>;
  setComponentOrder?: Resolver<Maybe<ResolversTypes['ComponentOrder']>, ParentType, ContextType, RequireFields<MutationSetComponentOrderArgs, 'input'>>;
  createComponentOrder?: Resolver<Maybe<ResolversTypes['ComponentOrder']>, ParentType, ContextType, RequireFields<MutationCreateComponentOrderArgs, 'input'>>;
  migrateComponentOrder?: Resolver<Maybe<ResolversTypes['ComponentOrder']>, ParentType, ContextType, RequireFields<MutationMigrateComponentOrderArgs, 'input'>>;
  createEvent?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<MutationCreateEventArgs, 'input'>>;
  deleteEvent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteEventArgs, 'input'>>;
  createFeature?: Resolver<Maybe<ResolversTypes['Feature']>, ParentType, ContextType, RequireFields<MutationCreateFeatureArgs, 'input'>>;
  setFeature?: Resolver<Maybe<ResolversTypes['Feature']>, ParentType, ContextType, RequireFields<MutationSetFeatureArgs, 'input'>>;
  createItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationCreateItemArgs, 'input'>>;
  migrateItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationMigrateItemArgs, 'input'>>;
  deleteItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationDeleteItemArgs, 'input'>>;
  restoreItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationRestoreItemArgs, 'input'>>;
  renameItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationRenameItemArgs, 'input'>>;
  setTypeOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetTypeOfItemArgs, 'input'>>;
  completeItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationCompleteItemArgs, 'input'>>;
  unCompleteItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationUnCompleteItemArgs, 'input'>>;
  setRepeatOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetRepeatOfItemArgs, 'input'>>;
  cloneItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationCloneItemArgs, 'input'>>;
  setProjectOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetProjectOfItemArgs, 'input'>>;
  setAreaOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetAreaOfItemArgs, 'input'>>;
  setScheduledAtOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetScheduledAtOfItemArgs, 'input'>>;
  setDueAtOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetDueAtOfItemArgs, 'input'>>;
  setParentOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetParentOfItemArgs, 'input'>>;
  permanentDeleteItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationPermanentDeleteItemArgs, 'input'>>;
  setLabelOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetLabelOfItemArgs, 'input'>>;
  setItemOrder?: Resolver<Maybe<ResolversTypes['ItemOrder']>, ParentType, ContextType, RequireFields<MutationSetItemOrderArgs, 'input'>>;
  createItemOrder?: Resolver<Maybe<ResolversTypes['ItemOrder']>, ParentType, ContextType, RequireFields<MutationCreateItemOrderArgs, 'input'>>;
  migrateItemOrder?: Resolver<Maybe<ResolversTypes['ItemOrder']>, ParentType, ContextType, RequireFields<MutationMigrateItemOrderArgs, 'input'>>;
  createLabel?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<MutationCreateLabelArgs, 'input'>>;
  renameLabel?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<MutationRenameLabelArgs, 'input'>>;
  setColourOfLabel?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<MutationSetColourOfLabelArgs, 'input'>>;
  deleteLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteLabelArgs, 'input'>>;
  createProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationCreateProjectArgs, 'input'>>;
  migrateProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationMigrateProjectArgs, 'input'>>;
  deleteProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationDeleteProjectArgs, 'input'>>;
  renameProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationRenameProjectArgs, 'input'>>;
  changeDescriptionProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationChangeDescriptionProjectArgs, 'input'>>;
  setEndDateOfProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationSetEndDateOfProjectArgs, 'input'>>;
  setStartDateOfProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationSetStartDateOfProjectArgs, 'input'>>;
  setAreaOfProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationSetAreaOfProjectArgs, 'input'>>;
  setProjectOrder?: Resolver<Maybe<ResolversTypes['ProjectOrder']>, ParentType, ContextType, RequireFields<MutationSetProjectOrderArgs, 'input'>>;
  createProjectOrder?: Resolver<Maybe<ResolversTypes['ProjectOrder']>, ParentType, ContextType, RequireFields<MutationCreateProjectOrderArgs, 'input'>>;
  migrateProjectOrder?: Resolver<Maybe<ResolversTypes['ProjectOrder']>, ParentType, ContextType, RequireFields<MutationMigrateProjectOrderArgs, 'input'>>;
  createReminder?: Resolver<Maybe<ResolversTypes['Reminder']>, ParentType, ContextType, RequireFields<MutationCreateReminderArgs, 'input'>>;
  deleteReminder?: Resolver<Maybe<ResolversTypes['Reminder']>, ParentType, ContextType, RequireFields<MutationDeleteReminderArgs, 'input'>>;
  deleteReminderFromItem?: Resolver<Maybe<ResolversTypes['Reminder']>, ParentType, ContextType, RequireFields<MutationDeleteReminderFromItemArgs, 'input'>>;
  createView?: Resolver<Maybe<ResolversTypes['View']>, ParentType, ContextType, RequireFields<MutationCreateViewArgs, 'input'>>;
  migrateView?: Resolver<Maybe<ResolversTypes['View']>, ParentType, ContextType, RequireFields<MutationMigrateViewArgs, 'input'>>;
  deleteView?: Resolver<Maybe<ResolversTypes['View']>, ParentType, ContextType, RequireFields<MutationDeleteViewArgs, 'input'>>;
  renameView?: Resolver<Maybe<ResolversTypes['View']>, ParentType, ContextType, RequireFields<MutationRenameViewArgs, 'input'>>;
  setViewOrder?: Resolver<Maybe<ResolversTypes['ViewOrder']>, ParentType, ContextType, RequireFields<MutationSetViewOrderArgs, 'input'>>;
  createViewOrder?: Resolver<Maybe<ResolversTypes['ViewOrder']>, ParentType, ContextType, RequireFields<MutationCreateViewOrderArgs, 'input'>>;
  migrateViewOrder?: Resolver<Maybe<ResolversTypes['ViewOrder']>, ParentType, ContextType, RequireFields<MutationMigrateViewOrderArgs, 'input'>>;
  createWeeklyGoal?: Resolver<Maybe<ResolversTypes['WeeklyGoal']>, ParentType, ContextType, RequireFields<MutationCreateWeeklyGoalArgs, 'input'>>;
};

export type AreaOrderResolvers<ContextType = any, ParentType extends ResolversParentTypes['AreaOrder'] = ResolversParentTypes['AreaOrder']> = {
  areaKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CalendarResolvers<ContextType = any, ParentType extends ResolversParentTypes['Calendar'] = ResolversParentTypes['Calendar']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lastUpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  events?: Resolver<Maybe<Array<Maybe<ResolversTypes['Event']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ComponentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Component'] = ResolversParentTypes['Component']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  viewKey?: Resolver<ResolversTypes['View'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parameters?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['ComponentOrder'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ComponentOrderResolvers<ContextType = any, ParentType extends ResolversParentTypes['ComponentOrder'] = ResolversParentTypes['ComponentOrder']> = {
  componentKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EventResolvers<ContextType = any, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  endAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  allDay?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  calendar?: Resolver<Maybe<ResolversTypes['Calendar']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureResolvers<ContextType = any, ParentType extends ResolversParentTypes['Feature'] = ResolversParentTypes['Feature']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['Item'] = ResolversParentTypes['Item']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  completed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  dueAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  scheduledAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  lastUpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  completedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  repeat?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType>;
  area?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType>;
  children?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['ItemOrder'], ParentType, ContextType>;
  reminders?: Resolver<Maybe<Array<Maybe<ResolversTypes['Reminder']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItemOrderResolvers<ContextType = any, ParentType extends ResolversParentTypes['ItemOrder'] = ResolversParentTypes['ItemOrder']> = {
  itemKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LabelResolvers<ContextType = any, ParentType extends ResolversParentTypes['Label'] = ResolversParentTypes['Label']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  colour?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectResolvers<ContextType = any, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastUpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  endAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  area?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType>;
  sortOrder?: Resolver<Maybe<ResolversTypes['ProjectOrder']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectOrderResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectOrder'] = ResolversParentTypes['ProjectOrder']> = {
  projectKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReminderResolvers<ContextType = any, ParentType extends ResolversParentTypes['Reminder'] = ResolversParentTypes['Reminder']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  remindAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  item?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType>;
  lastUpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ViewResolvers<ContextType = any, ParentType extends ResolversParentTypes['View'] = ResolversParentTypes['View']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  sortOrder?: Resolver<Maybe<ResolversTypes['ViewOrder']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ViewOrderResolvers<ContextType = any, ParentType extends ResolversParentTypes['ViewOrder'] = ResolversParentTypes['ViewOrder']> = {
  viewKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WeeklyGoalResolvers<ContextType = any, ParentType extends ResolversParentTypes['WeeklyGoal'] = ResolversParentTypes['WeeklyGoal']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  week?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  goal?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  DateTime?: GraphQLScalarType;
  Area?: AreaResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  AreaOrder?: AreaOrderResolvers<ContextType>;
  Calendar?: CalendarResolvers<ContextType>;
  Component?: ComponentResolvers<ContextType>;
  ComponentOrder?: ComponentOrderResolvers<ContextType>;
  Event?: EventResolvers<ContextType>;
  Feature?: FeatureResolvers<ContextType>;
  Item?: ItemResolvers<ContextType>;
  ItemOrder?: ItemOrderResolvers<ContextType>;
  Label?: LabelResolvers<ContextType>;
  Project?: ProjectResolvers<ContextType>;
  ProjectOrder?: ProjectOrderResolvers<ContextType>;
  Reminder?: ReminderResolvers<ContextType>;
  View?: ViewResolvers<ContextType>;
  ViewOrder?: ViewOrderResolvers<ContextType>;
  WeeklyGoal?: WeeklyGoalResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
