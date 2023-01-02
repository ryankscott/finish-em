import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { AreaEntity, AreaOrderEntity, CalendarEntity, ComponentEntity, ComponentOrderEntity, EventEntity, FeatureEntity, ItemEntity, ItemOrderEntity, LabelEntity, ProjectEntity, ProjectOrderEntity, ReminderEntity, ViewEntity, ViewOrderEntity, WeeklyGoalEntity } from './database/types/index';
import { Context } from './resolvers/types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
  JSON: any;
};

export type ActiveCalendarInput = {
  key: Scalars['String'];
};

export type Area = {
  __typename?: 'Area';
  createdAt?: Maybe<Scalars['DateTime']>;
  deleted?: Maybe<Scalars['Boolean']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  emoji?: Maybe<Scalars['String']>;
  items?: Maybe<Array<Maybe<Item>>>;
  key: Scalars['String'];
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  name?: Maybe<Scalars['String']>;
  projects?: Maybe<Array<Maybe<Project>>>;
  sortOrder?: Maybe<AreaOrder>;
};

export type AreaOrder = {
  __typename?: 'AreaOrder';
  areaKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type Attendee = {
  __typename?: 'Attendee';
  email: Scalars['String'];
  name?: Maybe<Scalars['String']>;
};

export type AttendeeInput = {
  email: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
};

export type BulkCreateItemOrdersInput = {
  componentKey: Scalars['String'];
  itemKeys: Array<InputMaybe<Scalars['String']>>;
};

export type Calendar = {
  __typename?: 'Calendar';
  active?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  deleted?: Maybe<Scalars['Boolean']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  events?: Maybe<Array<Maybe<Event>>>;
  key: Scalars['String'];
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
};

export type CloneComponentInput = {
  key: Scalars['String'];
};

export type CloneItemInput = {
  key: Scalars['String'];
};

export type CompleteItemInput = {
  key: Scalars['String'];
};

export type Component = {
  __typename?: 'Component';
  key: Scalars['String'];
  location: Scalars['String'];
  parameters?: Maybe<Scalars['String']>;
  sortOrder: ComponentOrder;
  type: Scalars['String'];
  viewKey: Scalars['String'];
};

export type ComponentOrder = {
  __typename?: 'ComponentOrder';
  componentKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type CreateAreaInput = {
  description?: InputMaybe<Scalars['String']>;
  key: Scalars['String'];
  name: Scalars['String'];
};

export type CreateAreaOrderInput = {
  areaKey: Scalars['String'];
};

export type CreateCalendarInput = {
  active: Scalars['Boolean'];
  key: Scalars['String'];
  name: Scalars['String'];
};

export type CreateComponentInput = {
  key: Scalars['String'];
  location: Scalars['String'];
  parameters: Scalars['JSON'];
  type: Scalars['String'];
  viewKey: Scalars['String'];
};

export type CreateComponentOrderInput = {
  componentKey: Scalars['String'];
};

export type CreateEventInput = {
  allDay?: InputMaybe<Scalars['Boolean']>;
  attendees?: InputMaybe<Array<InputMaybe<AttendeeInput>>>;
  calendarKey?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  endAt: Scalars['DateTime'];
  key: Scalars['String'];
  location?: InputMaybe<Scalars['String']>;
  recurrence?: InputMaybe<Scalars['String']>;
  startAt: Scalars['DateTime'];
  title: Scalars['String'];
};

export type CreateFeatureInput = {
  enabled: Scalars['Boolean'];
  key: Scalars['String'];
  metadata?: InputMaybe<Scalars['JSON']>;
  name: Scalars['String'];
};

export type CreateItemInput = {
  description?: InputMaybe<Scalars['String']>;
  dueAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  labelKey?: InputMaybe<Scalars['String']>;
  parentKey?: InputMaybe<Scalars['String']>;
  projectKey?: InputMaybe<Scalars['String']>;
  repeat?: InputMaybe<Scalars['String']>;
  scheduledAt?: InputMaybe<Scalars['DateTime']>;
  text: Scalars['String'];
  type: Scalars['String'];
};

export type CreateItemOrderInput = {
  componentKey: Scalars['String'];
  itemKey: Scalars['String'];
};

export type CreateLabelInput = {
  colour: Scalars['String'];
  key: Scalars['String'];
  name: Scalars['String'];
};

export type CreateProjectInput = {
  areaKey?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  emoji?: InputMaybe<Scalars['String']>;
  endAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  name: Scalars['String'];
  startAt?: InputMaybe<Scalars['DateTime']>;
};

export type CreateProjectOrderInput = {
  projectKey: Scalars['String'];
};

export type CreateReminderInput = {
  itemKey?: InputMaybe<Scalars['String']>;
  key: Scalars['String'];
  remindAt?: InputMaybe<Scalars['DateTime']>;
  text: Scalars['String'];
};

export type CreateViewInput = {
  icon?: InputMaybe<Scalars['String']>;
  key: Scalars['String'];
  name: Scalars['String'];
  type: Scalars['String'];
};

export type CreateViewOrderInput = {
  viewKey: Scalars['String'];
};

export type CreateWeeklyGoalInput = {
  goal?: InputMaybe<Scalars['String']>;
  key: Scalars['String'];
  week: Scalars['String'];
};

export type DeleteAreaInput = {
  key: Scalars['String'];
};

export type DeleteComponentInput = {
  key: Scalars['String'];
};

export type DeleteEventInput = {
  key: Scalars['String'];
};

export type DeleteItemInput = {
  key: Scalars['String'];
};

export type DeleteItemOrdersByComponentInput = {
  componentKey: Scalars['String'];
};

export type DeleteLabelInput = {
  key: Scalars['String'];
};

export type DeleteProjectInput = {
  key: Scalars['String'];
};

export type DeleteReminderFromItemInput = {
  itemKey: Scalars['String'];
};

export type DeleteReminderInput = {
  key: Scalars['String'];
};

export type DeleteViewInput = {
  key: Scalars['String'];
};

export type Event = {
  __typename?: 'Event';
  allDay?: Maybe<Scalars['Boolean']>;
  attendees?: Maybe<Array<Maybe<Attendee>>>;
  calendar?: Maybe<Calendar>;
  createdAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  endAt?: Maybe<Scalars['DateTime']>;
  key: Scalars['String'];
  location?: Maybe<Scalars['String']>;
  recurrence?: Maybe<Scalars['String']>;
  startAt?: Maybe<Scalars['DateTime']>;
  title: Scalars['String'];
};

export type Feature = {
  __typename?: 'Feature';
  enabled?: Maybe<Scalars['Boolean']>;
  key: Scalars['String'];
  metadata?: Maybe<Scalars['JSON']>;
  name: Scalars['String'];
};

export type Item = {
  __typename?: 'Item';
  area?: Maybe<Area>;
  children?: Maybe<Array<Maybe<Item>>>;
  completed?: Maybe<Scalars['Boolean']>;
  completedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  deleted?: Maybe<Scalars['Boolean']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  dueAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['String'];
  key: Scalars['String'];
  label?: Maybe<Label>;
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  parent?: Maybe<Item>;
  project?: Maybe<Project>;
  reminders?: Maybe<Array<Maybe<Reminder>>>;
  repeat?: Maybe<Scalars['String']>;
  scheduledAt?: Maybe<Scalars['DateTime']>;
  snoozedUntil?: Maybe<Scalars['DateTime']>;
  sortOrders?: Maybe<Array<Maybe<ItemOrder>>>;
  text?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export type ItemOrder = {
  __typename?: 'ItemOrder';
  componentKey: Scalars['String'];
  item: Item;
  sortOrder: Scalars['Int'];
};

export type Label = {
  __typename?: 'Label';
  colour?: Maybe<Scalars['String']>;
  key: Scalars['String'];
  name?: Maybe<Scalars['String']>;
};

export type MigrateAreaOrderInput = {
  areaKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type MigrateComponentInput = {
  key: Scalars['String'];
  location: Scalars['String'];
  parameters: Scalars['String'];
  type: Scalars['String'];
  viewKey: Scalars['String'];
};

export type MigrateComponentOrderInput = {
  componentKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type MigrateViewOrderInput = {
  sortOrder: Scalars['Int'];
  viewKey: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  bulkCreateItemOrders?: Maybe<Array<Maybe<ItemOrder>>>;
  cloneComponent?: Maybe<Component>;
  cloneItem?: Maybe<Item>;
  completeItem?: Maybe<Item>;
  createArea?: Maybe<Area>;
  createAreaOrder?: Maybe<AreaOrder>;
  createCalendar?: Maybe<Calendar>;
  createComponent?: Maybe<Component>;
  createComponentOrder?: Maybe<ComponentOrder>;
  createEvent?: Maybe<Event>;
  createFeature?: Maybe<Feature>;
  createItem?: Maybe<Item>;
  createItemOrder?: Maybe<ItemOrder>;
  createLabel?: Maybe<Label>;
  createProject?: Maybe<Project>;
  createProjectOrder?: Maybe<ProjectOrder>;
  createReminder?: Maybe<Reminder>;
  createView?: Maybe<View>;
  createViewOrder?: Maybe<ViewOrder>;
  createWeeklyGoal?: Maybe<WeeklyGoal>;
  deleteArea?: Maybe<Area>;
  deleteComponent?: Maybe<Scalars['String']>;
  deleteEvent?: Maybe<Scalars['String']>;
  deleteItem?: Maybe<Item>;
  deleteItemOrdersByComponent?: Maybe<Scalars['String']>;
  deleteLabel?: Maybe<Scalars['String']>;
  deleteProject?: Maybe<Project>;
  deleteReminder?: Maybe<Reminder>;
  deleteReminderFromItem?: Maybe<Reminder>;
  deleteView?: Maybe<View>;
  migrateAreaOrder?: Maybe<AreaOrder>;
  migrateComponent?: Maybe<Component>;
  migrateComponentOrder?: Maybe<ComponentOrder>;
  migrateViewOrder?: Maybe<ViewOrder>;
  permanentDeleteItem: Scalars['String'];
  renameArea?: Maybe<Area>;
  renameItem?: Maybe<Item>;
  renameLabel?: Maybe<Label>;
  renameProject?: Maybe<Project>;
  renameView?: Maybe<View>;
  restoreItem?: Maybe<Item>;
  setActiveCalendar?: Maybe<Calendar>;
  setAreaOfItem?: Maybe<Item>;
  setAreaOfProject?: Maybe<Project>;
  setAreaOrder?: Maybe<AreaOrder>;
  setColourOfLabel?: Maybe<Label>;
  setComponentOrder?: Maybe<ComponentOrder>;
  setDescriptionOfArea?: Maybe<Area>;
  setDescriptionOfProject?: Maybe<Project>;
  setDueAtOfItem?: Maybe<Item>;
  setEmojiOfArea?: Maybe<Area>;
  setEmojiOfProject?: Maybe<Project>;
  setEndDateOfProject?: Maybe<Project>;
  setFeature?: Maybe<Feature>;
  setFeatureMetadata?: Maybe<Feature>;
  setItemOrder?: Maybe<ItemOrder>;
  setLabelOfItem?: Maybe<Item>;
  setParametersOfComponent?: Maybe<Component>;
  setParentOfItem?: Maybe<Item>;
  setProjectOfItem?: Maybe<Item>;
  setProjectOrder?: Maybe<ProjectOrder>;
  setRepeatOfItem?: Maybe<Item>;
  setScheduledAtOfItem?: Maybe<Item>;
  setSnoozeOfItem?: Maybe<Item>;
  setStartDateOfProject?: Maybe<Project>;
  setViewOrder?: Maybe<ViewOrder>;
  unCompleteItem?: Maybe<Item>;
};


export type MutationBulkCreateItemOrdersArgs = {
  input: BulkCreateItemOrdersInput;
};


export type MutationCloneComponentArgs = {
  input: CloneComponentInput;
};


export type MutationCloneItemArgs = {
  input: CloneItemInput;
};


export type MutationCompleteItemArgs = {
  input: CompleteItemInput;
};


export type MutationCreateAreaArgs = {
  input: CreateAreaInput;
};


export type MutationCreateAreaOrderArgs = {
  input: CreateAreaOrderInput;
};


export type MutationCreateCalendarArgs = {
  input: CreateCalendarInput;
};


export type MutationCreateComponentArgs = {
  input: CreateComponentInput;
};


export type MutationCreateComponentOrderArgs = {
  input: CreateComponentOrderInput;
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
};


export type MutationCreateFeatureArgs = {
  input: CreateFeatureInput;
};


export type MutationCreateItemArgs = {
  input: CreateItemInput;
};


export type MutationCreateItemOrderArgs = {
  input: CreateItemOrderInput;
};


export type MutationCreateLabelArgs = {
  input: CreateLabelInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreateProjectOrderArgs = {
  input: CreateProjectOrderInput;
};


export type MutationCreateReminderArgs = {
  input: CreateReminderInput;
};


export type MutationCreateViewArgs = {
  input: CreateViewInput;
};


export type MutationCreateViewOrderArgs = {
  input: CreateViewOrderInput;
};


export type MutationCreateWeeklyGoalArgs = {
  input: CreateWeeklyGoalInput;
};


export type MutationDeleteAreaArgs = {
  input: DeleteAreaInput;
};


export type MutationDeleteComponentArgs = {
  input: DeleteComponentInput;
};


export type MutationDeleteEventArgs = {
  input: DeleteEventInput;
};


export type MutationDeleteItemArgs = {
  input: DeleteItemInput;
};


export type MutationDeleteItemOrdersByComponentArgs = {
  input: DeleteItemOrdersByComponentInput;
};


export type MutationDeleteLabelArgs = {
  input: DeleteLabelInput;
};


export type MutationDeleteProjectArgs = {
  input: DeleteProjectInput;
};


export type MutationDeleteReminderArgs = {
  input: DeleteReminderInput;
};


export type MutationDeleteReminderFromItemArgs = {
  input: DeleteReminderFromItemInput;
};


export type MutationDeleteViewArgs = {
  input: DeleteViewInput;
};


export type MutationMigrateAreaOrderArgs = {
  input: MigrateAreaOrderInput;
};


export type MutationMigrateComponentArgs = {
  input: MigrateComponentInput;
};


export type MutationMigrateComponentOrderArgs = {
  input: MigrateComponentOrderInput;
};


export type MutationMigrateViewOrderArgs = {
  input: MigrateViewOrderInput;
};


export type MutationPermanentDeleteItemArgs = {
  input: PermanentDeleteInput;
};


export type MutationRenameAreaArgs = {
  input: RenameAreaInput;
};


export type MutationRenameItemArgs = {
  input: RenameItemInput;
};


export type MutationRenameLabelArgs = {
  input: RenameLabelInput;
};


export type MutationRenameProjectArgs = {
  input: RenameProjectInput;
};


export type MutationRenameViewArgs = {
  input: RenameViewInput;
};


export type MutationRestoreItemArgs = {
  input: RestoreItemInput;
};


export type MutationSetActiveCalendarArgs = {
  input: ActiveCalendarInput;
};


export type MutationSetAreaOfItemArgs = {
  input: SetAreaOfItemInput;
};


export type MutationSetAreaOfProjectArgs = {
  input: SetAreaOfProjectInput;
};


export type MutationSetAreaOrderArgs = {
  input: SetAreaOrderInput;
};


export type MutationSetColourOfLabelArgs = {
  input: SetColourOfLabelInput;
};


export type MutationSetComponentOrderArgs = {
  input: SetComponentOrderInput;
};


export type MutationSetDescriptionOfAreaArgs = {
  input: SetDescriptionOfAreaInput;
};


export type MutationSetDescriptionOfProjectArgs = {
  input: SetDescriptionOfProjectInput;
};


export type MutationSetDueAtOfItemArgs = {
  input: SetDueAtOfItemInput;
};


export type MutationSetEmojiOfAreaArgs = {
  input: SetEmojiOfAreaInput;
};


export type MutationSetEmojiOfProjectArgs = {
  input: SetEmojiOfProjectInput;
};


export type MutationSetEndDateOfProjectArgs = {
  input: SetEndDateOfProjectInput;
};


export type MutationSetFeatureArgs = {
  input: SetFeatureInput;
};


export type MutationSetFeatureMetadataArgs = {
  input: SetFeatureMetadataInput;
};


export type MutationSetItemOrderArgs = {
  input: SetItemOrderInput;
};


export type MutationSetLabelOfItemArgs = {
  input: SetLabelOfInput;
};


export type MutationSetParametersOfComponentArgs = {
  input: SetParametersOfComponentInput;
};


export type MutationSetParentOfItemArgs = {
  input: SetParentOfItemInput;
};


export type MutationSetProjectOfItemArgs = {
  input: SetProjectOfItemInput;
};


export type MutationSetProjectOrderArgs = {
  input: SetProjectOrderInput;
};


export type MutationSetRepeatOfItemArgs = {
  input: SetRepeatOfItemInput;
};


export type MutationSetScheduledAtOfItemArgs = {
  input: SetScheduledAtOfItemInput;
};


export type MutationSetSnoozeOfItemArgs = {
  input: SetSnoozeOfItemInput;
};


export type MutationSetStartDateOfProjectArgs = {
  input: SetStartDateOfProjectInput;
};


export type MutationSetViewOrderArgs = {
  input: SetViewOrderInput;
};


export type MutationUnCompleteItemArgs = {
  input: UnCompleteItemInput;
};

export type PermanentDeleteInput = {
  key: Scalars['String'];
};

export type Project = {
  __typename?: 'Project';
  area?: Maybe<Area>;
  createdAt?: Maybe<Scalars['DateTime']>;
  deleted?: Maybe<Scalars['Boolean']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  emoji?: Maybe<Scalars['String']>;
  endAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['String'];
  items?: Maybe<Array<Maybe<Item>>>;
  key: Scalars['String'];
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  sortOrder?: Maybe<ProjectOrder>;
  startAt?: Maybe<Scalars['DateTime']>;
};

export type ProjectOrder = {
  __typename?: 'ProjectOrder';
  projectKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type ProjectsByAreaInput = {
  areaKey: Scalars['String'];
};

export type ProjectsInput = {
  deleted?: InputMaybe<Scalars['Boolean']>;
};

export type Query = {
  __typename?: 'Query';
  area?: Maybe<Area>;
  areaOrder?: Maybe<AreaOrder>;
  areaOrders?: Maybe<Array<Maybe<AreaOrder>>>;
  areas?: Maybe<Array<Maybe<Area>>>;
  calendar?: Maybe<Calendar>;
  calendars?: Maybe<Array<Maybe<Calendar>>>;
  component?: Maybe<Component>;
  componentOrder?: Maybe<ComponentOrder>;
  componentOrders?: Maybe<Array<Maybe<ComponentOrder>>>;
  components?: Maybe<Array<Maybe<Component>>>;
  componentsByView?: Maybe<Array<Maybe<Component>>>;
  event?: Maybe<Event>;
  events?: Maybe<Array<Maybe<Event>>>;
  eventsByCalendar?: Maybe<Array<Maybe<Event>>>;
  eventsForActiveCalendar?: Maybe<Array<Maybe<Event>>>;
  feature?: Maybe<Feature>;
  featureByName?: Maybe<Feature>;
  features?: Maybe<Array<Maybe<Feature>>>;
  getActiveCalendar?: Maybe<Calendar>;
  item?: Maybe<Item>;
  itemOrder?: Maybe<ItemOrder>;
  itemOrders?: Maybe<Array<Maybe<ItemOrder>>>;
  itemOrdersByComponent?: Maybe<Array<Maybe<ItemOrder>>>;
  itemOrdersByItem?: Maybe<Array<Maybe<ItemOrder>>>;
  items?: Maybe<Array<Maybe<Item>>>;
  itemsByArea?: Maybe<Array<Maybe<Item>>>;
  itemsByFilter?: Maybe<Array<Maybe<Item>>>;
  itemsByParent?: Maybe<Array<Maybe<Item>>>;
  itemsByProject?: Maybe<Array<Maybe<Item>>>;
  label?: Maybe<Label>;
  labels?: Maybe<Array<Maybe<Label>>>;
  project?: Maybe<Project>;
  projectOrder?: Maybe<ProjectOrder>;
  projectOrders?: Maybe<Array<Maybe<ProjectOrder>>>;
  projects?: Maybe<Array<Maybe<Project>>>;
  projectsByArea?: Maybe<Array<Maybe<Project>>>;
  reminder?: Maybe<Reminder>;
  reminders?: Maybe<Array<Maybe<Reminder>>>;
  remindersByItem?: Maybe<Array<Maybe<Reminder>>>;
  view?: Maybe<View>;
  viewOrder?: Maybe<ViewOrder>;
  viewOrders?: Maybe<Array<Maybe<ViewOrder>>>;
  views?: Maybe<Array<Maybe<View>>>;
  weeklyGoal?: Maybe<WeeklyGoal>;
  weeklyGoalByName?: Maybe<WeeklyGoal>;
  weeklyGoals?: Maybe<Array<Maybe<WeeklyGoal>>>;
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


export type QueryComponentOrderArgs = {
  componentKey: Scalars['String'];
};


export type QueryComponentsByViewArgs = {
  viewKey: Scalars['String'];
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


export type QueryItemOrderArgs = {
  componentKey: Scalars['String'];
  itemKey: Scalars['String'];
};


export type QueryItemOrdersByComponentArgs = {
  componentKey: Scalars['String'];
};


export type QueryItemOrdersByItemArgs = {
  itemKey: Scalars['String'];
};


export type QueryItemsByAreaArgs = {
  areaKey: Scalars['String'];
};


export type QueryItemsByFilterArgs = {
  componentKey: Scalars['String'];
  filter: Scalars['String'];
};


export type QueryItemsByParentArgs = {
  parentKey: Scalars['String'];
};


export type QueryItemsByProjectArgs = {
  projectKey: Scalars['String'];
};


export type QueryLabelArgs = {
  key: Scalars['String'];
};


export type QueryProjectArgs = {
  key: Scalars['String'];
};


export type QueryProjectOrderArgs = {
  projectKey: Scalars['String'];
};


export type QueryProjectsArgs = {
  input?: InputMaybe<ProjectsInput>;
};


export type QueryProjectsByAreaArgs = {
  input: ProjectsByAreaInput;
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

export type Reminder = {
  __typename?: 'Reminder';
  createdAt?: Maybe<Scalars['DateTime']>;
  deleted?: Maybe<Scalars['Boolean']>;
  deletedAt?: Maybe<Scalars['DateTime']>;
  item?: Maybe<Item>;
  key: Scalars['String'];
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  remindAt?: Maybe<Scalars['DateTime']>;
  text: Scalars['String'];
};

export type RenameAreaInput = {
  key: Scalars['String'];
  name: Scalars['String'];
};

export type RenameItemInput = {
  key: Scalars['String'];
  text: Scalars['String'];
};

export type RenameLabelInput = {
  key: Scalars['String'];
  name: Scalars['String'];
};

export type RenameProjectInput = {
  key: Scalars['String'];
  name: Scalars['String'];
};

export type RenameViewInput = {
  key: Scalars['String'];
  name: Scalars['String'];
};

export type RestoreItemInput = {
  key: Scalars['String'];
};

export type SetAreaOfItemInput = {
  areaKey: Scalars['String'];
  key: Scalars['String'];
};

export type SetAreaOfProjectInput = {
  areaKey: Scalars['String'];
  key: Scalars['String'];
};

export type SetAreaOrderInput = {
  areaKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type SetColourOfLabelInput = {
  colour: Scalars['String'];
  key: Scalars['String'];
};

export type SetComponentOrderInput = {
  componentKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type SetDescriptionOfAreaInput = {
  description: Scalars['String'];
  key: Scalars['String'];
};

export type SetDueAtOfItemInput = {
  dueAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
};

export type SetEmojiOfAreaInput = {
  emoji: Scalars['String'];
  key: Scalars['String'];
};

export type SetEndDateOfProjectInput = {
  endAt: Scalars['DateTime'];
  key: Scalars['String'];
};

export type SetFeatureInput = {
  enabled: Scalars['Boolean'];
  key: Scalars['String'];
};

export type SetFeatureMetadataInput = {
  key: Scalars['String'];
  metadata: Scalars['JSON'];
};

export type SetItemOrderInput = {
  componentKey: Scalars['String'];
  itemKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type SetLabelOfInput = {
  key: Scalars['String'];
  labelKey: Scalars['String'];
};

export type SetParametersOfComponentInput = {
  key: Scalars['String'];
  parameters: Scalars['JSON'];
};

export type SetParentOfItemInput = {
  key: Scalars['String'];
  parentKey: Scalars['String'];
};

export type SetProjectOfItemInput = {
  key: Scalars['String'];
  projectKey: Scalars['String'];
};

export type SetProjectOrderInput = {
  projectKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type SetRepeatOfItemInput = {
  key: Scalars['String'];
  repeat: Scalars['String'];
};

export type SetScheduledAtOfItemInput = {
  key: Scalars['String'];
  scheduledAt?: InputMaybe<Scalars['DateTime']>;
};

export type SetSnoozeOfItemInput = {
  key: Scalars['String'];
  snoozedUntil?: InputMaybe<Scalars['DateTime']>;
};

export type SetStartDateOfProjectInput = {
  key: Scalars['String'];
  startAt: Scalars['DateTime'];
};

export type SetViewOrderInput = {
  sortOrder: Scalars['Int'];
  viewKey: Scalars['String'];
};

export type UnCompleteItemInput = {
  key: Scalars['String'];
};

export type View = {
  __typename?: 'View';
  createdAt?: Maybe<Scalars['DateTime']>;
  deleted: Scalars['Boolean'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  icon: Scalars['String'];
  id: Scalars['String'];
  key: Scalars['String'];
  name: Scalars['String'];
  sortOrder?: Maybe<ViewOrder>;
  type: Scalars['String'];
};

export type ViewOrder = {
  __typename?: 'ViewOrder';
  id: Scalars['String'];
  sortOrder: Scalars['Int'];
  viewKey: Scalars['String'];
};

export type WeeklyGoal = {
  __typename?: 'WeeklyGoal';
  goal?: Maybe<Scalars['String']>;
  key: Scalars['String'];
  week: Scalars['String'];
};

export type SetDescriptionOfProjectInput = {
  description: Scalars['String'];
  key: Scalars['String'];
};

export type SetEmojiOfProjectInput = {
  emoji: Scalars['String'];
  key: Scalars['String'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

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
export type ResolversTypes = ResolversObject<{
  ActiveCalendarInput: ActiveCalendarInput;
  Area: ResolverTypeWrapper<AreaEntity>;
  AreaOrder: ResolverTypeWrapper<AreaOrderEntity>;
  Attendee: ResolverTypeWrapper<Attendee>;
  AttendeeInput: AttendeeInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  BulkCreateItemOrdersInput: BulkCreateItemOrdersInput;
  Calendar: ResolverTypeWrapper<CalendarEntity>;
  CloneComponentInput: CloneComponentInput;
  CloneItemInput: CloneItemInput;
  CompleteItemInput: CompleteItemInput;
  Component: ResolverTypeWrapper<ComponentEntity>;
  ComponentOrder: ResolverTypeWrapper<ComponentOrderEntity>;
  CreateAreaInput: CreateAreaInput;
  CreateAreaOrderInput: CreateAreaOrderInput;
  CreateCalendarInput: CreateCalendarInput;
  CreateComponentInput: CreateComponentInput;
  CreateComponentOrderInput: CreateComponentOrderInput;
  CreateEventInput: CreateEventInput;
  CreateFeatureInput: CreateFeatureInput;
  CreateItemInput: CreateItemInput;
  CreateItemOrderInput: CreateItemOrderInput;
  CreateLabelInput: CreateLabelInput;
  CreateProjectInput: CreateProjectInput;
  CreateProjectOrderInput: CreateProjectOrderInput;
  CreateReminderInput: CreateReminderInput;
  CreateViewInput: CreateViewInput;
  CreateViewOrderInput: CreateViewOrderInput;
  CreateWeeklyGoalInput: CreateWeeklyGoalInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DeleteAreaInput: DeleteAreaInput;
  DeleteComponentInput: DeleteComponentInput;
  DeleteEventInput: DeleteEventInput;
  DeleteItemInput: DeleteItemInput;
  DeleteItemOrdersByComponentInput: DeleteItemOrdersByComponentInput;
  DeleteLabelInput: DeleteLabelInput;
  DeleteProjectInput: DeleteProjectInput;
  DeleteReminderFromItemInput: DeleteReminderFromItemInput;
  DeleteReminderInput: DeleteReminderInput;
  DeleteViewInput: DeleteViewInput;
  Event: ResolverTypeWrapper<EventEntity>;
  Feature: ResolverTypeWrapper<FeatureEntity>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Item: ResolverTypeWrapper<ItemEntity>;
  ItemOrder: ResolverTypeWrapper<ItemOrderEntity>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  Label: ResolverTypeWrapper< LabelEntity>;
  MigrateAreaOrderInput: MigrateAreaOrderInput;
  MigrateComponentInput: MigrateComponentInput;
  MigrateComponentOrderInput: MigrateComponentOrderInput;
  MigrateViewOrderInput: MigrateViewOrderInput;
  Mutation: ResolverTypeWrapper<{}>;
  PermanentDeleteInput: PermanentDeleteInput;
  Project: ResolverTypeWrapper<ProjectEntity>;
  ProjectOrder: ResolverTypeWrapper<ProjectOrderEntity>;
  ProjectsByAreaInput: ProjectsByAreaInput;
  ProjectsInput: ProjectsInput;
  Query: ResolverTypeWrapper<{}>;
  Reminder: ResolverTypeWrapper<ReminderEntity>;
  RenameAreaInput: RenameAreaInput;
  RenameItemInput: RenameItemInput;
  RenameLabelInput: RenameLabelInput;
  RenameProjectInput: RenameProjectInput;
  RenameViewInput: RenameViewInput;
  RestoreItemInput: RestoreItemInput;
  SetAreaOfItemInput: SetAreaOfItemInput;
  SetAreaOfProjectInput: SetAreaOfProjectInput;
  SetAreaOrderInput: SetAreaOrderInput;
  SetColourOfLabelInput: SetColourOfLabelInput;
  SetComponentOrderInput: SetComponentOrderInput;
  SetDescriptionOfAreaInput: SetDescriptionOfAreaInput;
  SetDueAtOfItemInput: SetDueAtOfItemInput;
  SetEmojiOfAreaInput: SetEmojiOfAreaInput;
  SetEndDateOfProjectInput: SetEndDateOfProjectInput;
  SetFeatureInput: SetFeatureInput;
  SetFeatureMetadataInput: SetFeatureMetadataInput;
  SetItemOrderInput: SetItemOrderInput;
  SetLabelOfInput: SetLabelOfInput;
  SetParametersOfComponentInput: SetParametersOfComponentInput;
  SetParentOfItemInput: SetParentOfItemInput;
  SetProjectOfItemInput: SetProjectOfItemInput;
  SetProjectOrderInput: SetProjectOrderInput;
  SetRepeatOfItemInput: SetRepeatOfItemInput;
  SetScheduledAtOfItemInput: SetScheduledAtOfItemInput;
  SetSnoozeOfItemInput: SetSnoozeOfItemInput;
  SetStartDateOfProjectInput: SetStartDateOfProjectInput;
  SetViewOrderInput: SetViewOrderInput;
  String: ResolverTypeWrapper<Scalars['String']>;
  UnCompleteItemInput: UnCompleteItemInput;
  View: ResolverTypeWrapper<ViewEntity>;
  ViewOrder: ResolverTypeWrapper<ViewOrderEntity>;
  WeeklyGoal: ResolverTypeWrapper<WeeklyGoalEntity>;
  setDescriptionOfProjectInput: SetDescriptionOfProjectInput;
  setEmojiOfProjectInput: SetEmojiOfProjectInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ActiveCalendarInput: ActiveCalendarInput;
  Area: AreaEntity;
  AreaOrder: AreaOrderEntity;
  Attendee: Attendee;
  AttendeeInput: AttendeeInput;
  Boolean: Scalars['Boolean'];
  BulkCreateItemOrdersInput: BulkCreateItemOrdersInput;
  Calendar: CalendarEntity;
  CloneComponentInput: CloneComponentInput;
  CloneItemInput: CloneItemInput;
  CompleteItemInput: CompleteItemInput;
  Component: ComponentEntity;
  ComponentOrder: ComponentOrderEntity;
  CreateAreaInput: CreateAreaInput;
  CreateAreaOrderInput: CreateAreaOrderInput;
  CreateCalendarInput: CreateCalendarInput;
  CreateComponentInput: CreateComponentInput;
  CreateComponentOrderInput: CreateComponentOrderInput;
  CreateEventInput: CreateEventInput;
  CreateFeatureInput: CreateFeatureInput;
  CreateItemInput: CreateItemInput;
  CreateItemOrderInput: CreateItemOrderInput;
  CreateLabelInput: CreateLabelInput;
  CreateProjectInput: CreateProjectInput;
  CreateProjectOrderInput: CreateProjectOrderInput;
  CreateReminderInput: CreateReminderInput;
  CreateViewInput: CreateViewInput;
  CreateViewOrderInput: CreateViewOrderInput;
  CreateWeeklyGoalInput: CreateWeeklyGoalInput;
  DateTime: Scalars['DateTime'];
  DeleteAreaInput: DeleteAreaInput;
  DeleteComponentInput: DeleteComponentInput;
  DeleteEventInput: DeleteEventInput;
  DeleteItemInput: DeleteItemInput;
  DeleteItemOrdersByComponentInput: DeleteItemOrdersByComponentInput;
  DeleteLabelInput: DeleteLabelInput;
  DeleteProjectInput: DeleteProjectInput;
  DeleteReminderFromItemInput: DeleteReminderFromItemInput;
  DeleteReminderInput: DeleteReminderInput;
  DeleteViewInput: DeleteViewInput;
  Event: EventEntity;
  Feature: FeatureEntity;
  Int: Scalars['Int'];
  Item: ItemEntity;
  ItemOrder: ItemOrderEntity;
  JSON: Scalars['JSON'];
  Label:  LabelEntity;
  MigrateAreaOrderInput: MigrateAreaOrderInput;
  MigrateComponentInput: MigrateComponentInput;
  MigrateComponentOrderInput: MigrateComponentOrderInput;
  MigrateViewOrderInput: MigrateViewOrderInput;
  Mutation: {};
  PermanentDeleteInput: PermanentDeleteInput;
  Project: ProjectEntity;
  ProjectOrder: ProjectOrderEntity;
  ProjectsByAreaInput: ProjectsByAreaInput;
  ProjectsInput: ProjectsInput;
  Query: {};
  Reminder: ReminderEntity;
  RenameAreaInput: RenameAreaInput;
  RenameItemInput: RenameItemInput;
  RenameLabelInput: RenameLabelInput;
  RenameProjectInput: RenameProjectInput;
  RenameViewInput: RenameViewInput;
  RestoreItemInput: RestoreItemInput;
  SetAreaOfItemInput: SetAreaOfItemInput;
  SetAreaOfProjectInput: SetAreaOfProjectInput;
  SetAreaOrderInput: SetAreaOrderInput;
  SetColourOfLabelInput: SetColourOfLabelInput;
  SetComponentOrderInput: SetComponentOrderInput;
  SetDescriptionOfAreaInput: SetDescriptionOfAreaInput;
  SetDueAtOfItemInput: SetDueAtOfItemInput;
  SetEmojiOfAreaInput: SetEmojiOfAreaInput;
  SetEndDateOfProjectInput: SetEndDateOfProjectInput;
  SetFeatureInput: SetFeatureInput;
  SetFeatureMetadataInput: SetFeatureMetadataInput;
  SetItemOrderInput: SetItemOrderInput;
  SetLabelOfInput: SetLabelOfInput;
  SetParametersOfComponentInput: SetParametersOfComponentInput;
  SetParentOfItemInput: SetParentOfItemInput;
  SetProjectOfItemInput: SetProjectOfItemInput;
  SetProjectOrderInput: SetProjectOrderInput;
  SetRepeatOfItemInput: SetRepeatOfItemInput;
  SetScheduledAtOfItemInput: SetScheduledAtOfItemInput;
  SetSnoozeOfItemInput: SetSnoozeOfItemInput;
  SetStartDateOfProjectInput: SetStartDateOfProjectInput;
  SetViewOrderInput: SetViewOrderInput;
  String: Scalars['String'];
  UnCompleteItemInput: UnCompleteItemInput;
  View: ViewEntity;
  ViewOrder: ViewOrderEntity;
  WeeklyGoal: WeeklyGoalEntity;
  setDescriptionOfProjectInput: SetDescriptionOfProjectInput;
  setEmojiOfProjectInput: SetEmojiOfProjectInput;
}>;

export type AreaResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Area'] = ResolversParentTypes['Area']> = ResolversObject<{
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emoji?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastUpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projects?: Resolver<Maybe<Array<Maybe<ResolversTypes['Project']>>>, ParentType, ContextType>;
  sortOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AreaOrderResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AreaOrder'] = ResolversParentTypes['AreaOrder']> = ResolversObject<{
  areaKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AttendeeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Attendee'] = ResolversParentTypes['Attendee']> = ResolversObject<{
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CalendarResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Calendar'] = ResolversParentTypes['Calendar']> = ResolversObject<{
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  events?: Resolver<Maybe<Array<Maybe<ResolversTypes['Event']>>>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastUpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ComponentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Component'] = ResolversParentTypes['Component']> = ResolversObject<{
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parameters?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['ComponentOrder'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  viewKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ComponentOrderResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ComponentOrder'] = ResolversParentTypes['ComponentOrder']> = ResolversObject<{
  componentKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EventResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = ResolversObject<{
  allDay?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  attendees?: Resolver<Maybe<Array<Maybe<ResolversTypes['Attendee']>>>, ParentType, ContextType>;
  calendar?: Resolver<Maybe<ResolversTypes['Calendar']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  recurrence?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FeatureResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Feature'] = ResolversParentTypes['Feature']> = ResolversObject<{
  enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Item'] = ResolversParentTypes['Item']> = ResolversObject<{
  area?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType>;
  children?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType>;
  completed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  completedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  dueAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType>;
  lastUpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  reminders?: Resolver<Maybe<Array<Maybe<ResolversTypes['Reminder']>>>, ParentType, ContextType>;
  repeat?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scheduledAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  snoozedUntil?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  sortOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['ItemOrder']>>>, ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ItemOrderResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ItemOrder'] = ResolversParentTypes['ItemOrder']> = ResolversObject<{
  componentKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['Item'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type LabelResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Label'] = ResolversParentTypes['Label']> = ResolversObject<{
  colour?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  bulkCreateItemOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['ItemOrder']>>>, ParentType, ContextType, RequireFields<MutationBulkCreateItemOrdersArgs, 'input'>>;
  cloneComponent?: Resolver<Maybe<ResolversTypes['Component']>, ParentType, ContextType, RequireFields<MutationCloneComponentArgs, 'input'>>;
  cloneItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationCloneItemArgs, 'input'>>;
  completeItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationCompleteItemArgs, 'input'>>;
  createArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationCreateAreaArgs, 'input'>>;
  createAreaOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType, RequireFields<MutationCreateAreaOrderArgs, 'input'>>;
  createCalendar?: Resolver<Maybe<ResolversTypes['Calendar']>, ParentType, ContextType, RequireFields<MutationCreateCalendarArgs, 'input'>>;
  createComponent?: Resolver<Maybe<ResolversTypes['Component']>, ParentType, ContextType, RequireFields<MutationCreateComponentArgs, 'input'>>;
  createComponentOrder?: Resolver<Maybe<ResolversTypes['ComponentOrder']>, ParentType, ContextType, RequireFields<MutationCreateComponentOrderArgs, 'input'>>;
  createEvent?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<MutationCreateEventArgs, 'input'>>;
  createFeature?: Resolver<Maybe<ResolversTypes['Feature']>, ParentType, ContextType, RequireFields<MutationCreateFeatureArgs, 'input'>>;
  createItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationCreateItemArgs, 'input'>>;
  createItemOrder?: Resolver<Maybe<ResolversTypes['ItemOrder']>, ParentType, ContextType, RequireFields<MutationCreateItemOrderArgs, 'input'>>;
  createLabel?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<MutationCreateLabelArgs, 'input'>>;
  createProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationCreateProjectArgs, 'input'>>;
  createProjectOrder?: Resolver<Maybe<ResolversTypes['ProjectOrder']>, ParentType, ContextType, RequireFields<MutationCreateProjectOrderArgs, 'input'>>;
  createReminder?: Resolver<Maybe<ResolversTypes['Reminder']>, ParentType, ContextType, RequireFields<MutationCreateReminderArgs, 'input'>>;
  createView?: Resolver<Maybe<ResolversTypes['View']>, ParentType, ContextType, RequireFields<MutationCreateViewArgs, 'input'>>;
  createViewOrder?: Resolver<Maybe<ResolversTypes['ViewOrder']>, ParentType, ContextType, RequireFields<MutationCreateViewOrderArgs, 'input'>>;
  createWeeklyGoal?: Resolver<Maybe<ResolversTypes['WeeklyGoal']>, ParentType, ContextType, RequireFields<MutationCreateWeeklyGoalArgs, 'input'>>;
  deleteArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationDeleteAreaArgs, 'input'>>;
  deleteComponent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteComponentArgs, 'input'>>;
  deleteEvent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteEventArgs, 'input'>>;
  deleteItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationDeleteItemArgs, 'input'>>;
  deleteItemOrdersByComponent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteItemOrdersByComponentArgs, 'input'>>;
  deleteLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteLabelArgs, 'input'>>;
  deleteProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationDeleteProjectArgs, 'input'>>;
  deleteReminder?: Resolver<Maybe<ResolversTypes['Reminder']>, ParentType, ContextType, RequireFields<MutationDeleteReminderArgs, 'input'>>;
  deleteReminderFromItem?: Resolver<Maybe<ResolversTypes['Reminder']>, ParentType, ContextType, RequireFields<MutationDeleteReminderFromItemArgs, 'input'>>;
  deleteView?: Resolver<Maybe<ResolversTypes['View']>, ParentType, ContextType, RequireFields<MutationDeleteViewArgs, 'input'>>;
  migrateAreaOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType, RequireFields<MutationMigrateAreaOrderArgs, 'input'>>;
  migrateComponent?: Resolver<Maybe<ResolversTypes['Component']>, ParentType, ContextType, RequireFields<MutationMigrateComponentArgs, 'input'>>;
  migrateComponentOrder?: Resolver<Maybe<ResolversTypes['ComponentOrder']>, ParentType, ContextType, RequireFields<MutationMigrateComponentOrderArgs, 'input'>>;
  migrateViewOrder?: Resolver<Maybe<ResolversTypes['ViewOrder']>, ParentType, ContextType, RequireFields<MutationMigrateViewOrderArgs, 'input'>>;
  permanentDeleteItem?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationPermanentDeleteItemArgs, 'input'>>;
  renameArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationRenameAreaArgs, 'input'>>;
  renameItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationRenameItemArgs, 'input'>>;
  renameLabel?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<MutationRenameLabelArgs, 'input'>>;
  renameProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationRenameProjectArgs, 'input'>>;
  renameView?: Resolver<Maybe<ResolversTypes['View']>, ParentType, ContextType, RequireFields<MutationRenameViewArgs, 'input'>>;
  restoreItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationRestoreItemArgs, 'input'>>;
  setActiveCalendar?: Resolver<Maybe<ResolversTypes['Calendar']>, ParentType, ContextType, RequireFields<MutationSetActiveCalendarArgs, 'input'>>;
  setAreaOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetAreaOfItemArgs, 'input'>>;
  setAreaOfProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationSetAreaOfProjectArgs, 'input'>>;
  setAreaOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType, RequireFields<MutationSetAreaOrderArgs, 'input'>>;
  setColourOfLabel?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<MutationSetColourOfLabelArgs, 'input'>>;
  setComponentOrder?: Resolver<Maybe<ResolversTypes['ComponentOrder']>, ParentType, ContextType, RequireFields<MutationSetComponentOrderArgs, 'input'>>;
  setDescriptionOfArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationSetDescriptionOfAreaArgs, 'input'>>;
  setDescriptionOfProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationSetDescriptionOfProjectArgs, 'input'>>;
  setDueAtOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetDueAtOfItemArgs, 'input'>>;
  setEmojiOfArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationSetEmojiOfAreaArgs, 'input'>>;
  setEmojiOfProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationSetEmojiOfProjectArgs, 'input'>>;
  setEndDateOfProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationSetEndDateOfProjectArgs, 'input'>>;
  setFeature?: Resolver<Maybe<ResolversTypes['Feature']>, ParentType, ContextType, RequireFields<MutationSetFeatureArgs, 'input'>>;
  setFeatureMetadata?: Resolver<Maybe<ResolversTypes['Feature']>, ParentType, ContextType, RequireFields<MutationSetFeatureMetadataArgs, 'input'>>;
  setItemOrder?: Resolver<Maybe<ResolversTypes['ItemOrder']>, ParentType, ContextType, RequireFields<MutationSetItemOrderArgs, 'input'>>;
  setLabelOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetLabelOfItemArgs, 'input'>>;
  setParametersOfComponent?: Resolver<Maybe<ResolversTypes['Component']>, ParentType, ContextType, RequireFields<MutationSetParametersOfComponentArgs, 'input'>>;
  setParentOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetParentOfItemArgs, 'input'>>;
  setProjectOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetProjectOfItemArgs, 'input'>>;
  setProjectOrder?: Resolver<Maybe<ResolversTypes['ProjectOrder']>, ParentType, ContextType, RequireFields<MutationSetProjectOrderArgs, 'input'>>;
  setRepeatOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetRepeatOfItemArgs, 'input'>>;
  setScheduledAtOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetScheduledAtOfItemArgs, 'input'>>;
  setSnoozeOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetSnoozeOfItemArgs, 'input'>>;
  setStartDateOfProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationSetStartDateOfProjectArgs, 'input'>>;
  setViewOrder?: Resolver<Maybe<ResolversTypes['ViewOrder']>, ParentType, ContextType, RequireFields<MutationSetViewOrderArgs, 'input'>>;
  unCompleteItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationUnCompleteItemArgs, 'input'>>;
}>;

export type ProjectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = ResolversObject<{
  area?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emoji?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastUpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<Maybe<ResolversTypes['ProjectOrder']>, ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectOrderResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ProjectOrder'] = ResolversParentTypes['ProjectOrder']> = ResolversObject<{
  projectKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  area?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<QueryAreaArgs, 'key'>>;
  areaOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType, RequireFields<QueryAreaOrderArgs, 'areaKey'>>;
  areaOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['AreaOrder']>>>, ParentType, ContextType>;
  areas?: Resolver<Maybe<Array<Maybe<ResolversTypes['Area']>>>, ParentType, ContextType>;
  calendar?: Resolver<Maybe<ResolversTypes['Calendar']>, ParentType, ContextType, RequireFields<QueryCalendarArgs, 'key'>>;
  calendars?: Resolver<Maybe<Array<Maybe<ResolversTypes['Calendar']>>>, ParentType, ContextType>;
  component?: Resolver<Maybe<ResolversTypes['Component']>, ParentType, ContextType, RequireFields<QueryComponentArgs, 'key'>>;
  componentOrder?: Resolver<Maybe<ResolversTypes['ComponentOrder']>, ParentType, ContextType, RequireFields<QueryComponentOrderArgs, 'componentKey'>>;
  componentOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['ComponentOrder']>>>, ParentType, ContextType>;
  components?: Resolver<Maybe<Array<Maybe<ResolversTypes['Component']>>>, ParentType, ContextType>;
  componentsByView?: Resolver<Maybe<Array<Maybe<ResolversTypes['Component']>>>, ParentType, ContextType, RequireFields<QueryComponentsByViewArgs, 'viewKey'>>;
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventArgs, 'key'>>;
  events?: Resolver<Maybe<Array<Maybe<ResolversTypes['Event']>>>, ParentType, ContextType>;
  eventsByCalendar?: Resolver<Maybe<Array<Maybe<ResolversTypes['Event']>>>, ParentType, ContextType, RequireFields<QueryEventsByCalendarArgs, 'calendarKey'>>;
  eventsForActiveCalendar?: Resolver<Maybe<Array<Maybe<ResolversTypes['Event']>>>, ParentType, ContextType>;
  feature?: Resolver<Maybe<ResolversTypes['Feature']>, ParentType, ContextType, RequireFields<QueryFeatureArgs, 'key'>>;
  featureByName?: Resolver<Maybe<ResolversTypes['Feature']>, ParentType, ContextType, RequireFields<QueryFeatureByNameArgs, 'name'>>;
  features?: Resolver<Maybe<Array<Maybe<ResolversTypes['Feature']>>>, ParentType, ContextType>;
  getActiveCalendar?: Resolver<Maybe<ResolversTypes['Calendar']>, ParentType, ContextType>;
  item?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<QueryItemArgs, 'key'>>;
  itemOrder?: Resolver<Maybe<ResolversTypes['ItemOrder']>, ParentType, ContextType, RequireFields<QueryItemOrderArgs, 'componentKey' | 'itemKey'>>;
  itemOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['ItemOrder']>>>, ParentType, ContextType>;
  itemOrdersByComponent?: Resolver<Maybe<Array<Maybe<ResolversTypes['ItemOrder']>>>, ParentType, ContextType, RequireFields<QueryItemOrdersByComponentArgs, 'componentKey'>>;
  itemOrdersByItem?: Resolver<Maybe<Array<Maybe<ResolversTypes['ItemOrder']>>>, ParentType, ContextType, RequireFields<QueryItemOrdersByItemArgs, 'itemKey'>>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType>;
  itemsByArea?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType, RequireFields<QueryItemsByAreaArgs, 'areaKey'>>;
  itemsByFilter?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType, RequireFields<QueryItemsByFilterArgs, 'componentKey' | 'filter'>>;
  itemsByParent?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType, RequireFields<QueryItemsByParentArgs, 'parentKey'>>;
  itemsByProject?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType, RequireFields<QueryItemsByProjectArgs, 'projectKey'>>;
  label?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<QueryLabelArgs, 'key'>>;
  labels?: Resolver<Maybe<Array<Maybe<ResolversTypes['Label']>>>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<QueryProjectArgs, 'key'>>;
  projectOrder?: Resolver<Maybe<ResolversTypes['ProjectOrder']>, ParentType, ContextType, RequireFields<QueryProjectOrderArgs, 'projectKey'>>;
  projectOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProjectOrder']>>>, ParentType, ContextType>;
  projects?: Resolver<Maybe<Array<Maybe<ResolversTypes['Project']>>>, ParentType, ContextType, Partial<QueryProjectsArgs>>;
  projectsByArea?: Resolver<Maybe<Array<Maybe<ResolversTypes['Project']>>>, ParentType, ContextType, RequireFields<QueryProjectsByAreaArgs, 'input'>>;
  reminder?: Resolver<Maybe<ResolversTypes['Reminder']>, ParentType, ContextType, RequireFields<QueryReminderArgs, 'key'>>;
  reminders?: Resolver<Maybe<Array<Maybe<ResolversTypes['Reminder']>>>, ParentType, ContextType>;
  remindersByItem?: Resolver<Maybe<Array<Maybe<ResolversTypes['Reminder']>>>, ParentType, ContextType, RequireFields<QueryRemindersByItemArgs, 'itemKey'>>;
  view?: Resolver<Maybe<ResolversTypes['View']>, ParentType, ContextType, RequireFields<QueryViewArgs, 'key'>>;
  viewOrder?: Resolver<Maybe<ResolversTypes['ViewOrder']>, ParentType, ContextType, RequireFields<QueryViewOrderArgs, 'viewKey'>>;
  viewOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['ViewOrder']>>>, ParentType, ContextType>;
  views?: Resolver<Maybe<Array<Maybe<ResolversTypes['View']>>>, ParentType, ContextType>;
  weeklyGoal?: Resolver<Maybe<ResolversTypes['WeeklyGoal']>, ParentType, ContextType, RequireFields<QueryWeeklyGoalArgs, 'key'>>;
  weeklyGoalByName?: Resolver<Maybe<ResolversTypes['WeeklyGoal']>, ParentType, ContextType, RequireFields<QueryWeeklyGoalByNameArgs, 'name'>>;
  weeklyGoals?: Resolver<Maybe<Array<Maybe<ResolversTypes['WeeklyGoal']>>>, ParentType, ContextType>;
}>;

export type ReminderResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Reminder'] = ResolversParentTypes['Reminder']> = ResolversObject<{
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  item?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastUpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  remindAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ViewResolvers<ContextType = Context, ParentType extends ResolversParentTypes['View'] = ResolversParentTypes['View']> = ResolversObject<{
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<Maybe<ResolversTypes['ViewOrder']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ViewOrderResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ViewOrder'] = ResolversParentTypes['ViewOrder']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  viewKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WeeklyGoalResolvers<ContextType = Context, ParentType extends ResolversParentTypes['WeeklyGoal'] = ResolversParentTypes['WeeklyGoal']> = ResolversObject<{
  goal?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  week?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  Area?: AreaResolvers<ContextType>;
  AreaOrder?: AreaOrderResolvers<ContextType>;
  Attendee?: AttendeeResolvers<ContextType>;
  Calendar?: CalendarResolvers<ContextType>;
  Component?: ComponentResolvers<ContextType>;
  ComponentOrder?: ComponentOrderResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Event?: EventResolvers<ContextType>;
  Feature?: FeatureResolvers<ContextType>;
  Item?: ItemResolvers<ContextType>;
  ItemOrder?: ItemOrderResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Label?: LabelResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Project?: ProjectResolvers<ContextType>;
  ProjectOrder?: ProjectOrderResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Reminder?: ReminderResolvers<ContextType>;
  View?: ViewResolvers<ContextType>;
  ViewOrder?: ViewOrderResolvers<ContextType>;
  WeeklyGoal?: WeeklyGoalResolvers<ContextType>;
}>;

