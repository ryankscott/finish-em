export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: string;
  JSON: any;
};

export type ActiveCalendarInput = {
  key: Scalars["String"];
};

export type Area = {
  __typename?: "Area";
  createdAt?: Maybe<Scalars["DateTime"]>;
  deleted?: Maybe<Scalars["Boolean"]>;
  deletedAt?: Maybe<Scalars["DateTime"]>;
  description?: Maybe<Scalars["String"]>;
  emoji?: Maybe<Scalars["String"]>;
  items?: Maybe<Array<Maybe<Item>>>;
  key: Scalars["String"];
  lastUpdatedAt?: Maybe<Scalars["DateTime"]>;
  name?: Maybe<Scalars["String"]>;
  projects?: Maybe<Array<Maybe<Project>>>;
  sortOrder?: Maybe<AreaOrder>;
};

export type AreaOrder = {
  __typename?: "AreaOrder";
  areaKey: Scalars["String"];
  sortOrder: Scalars["Int"];
};

export type Attendee = {
  __typename?: "Attendee";
  email: Scalars["String"];
  name?: Maybe<Scalars["String"]>;
};

export type Calendar = {
  __typename?: "Calendar";
  active?: Maybe<Scalars["Boolean"]>;
  createdAt?: Maybe<Scalars["DateTime"]>;
  deleted?: Maybe<Scalars["Boolean"]>;
  deletedAt?: Maybe<Scalars["DateTime"]>;
  events?: Maybe<Array<Maybe<Event>>>;
  key: Scalars["String"];
  lastUpdatedAt?: Maybe<Scalars["DateTime"]>;
  name: Scalars["String"];
};

export type Component = {
  __typename?: "Component";
  key: Scalars["String"];
  location: Scalars["String"];
  parameters?: Maybe<Scalars["String"]>;
  sortOrder: ComponentOrder;
  type: Scalars["String"];
  viewKey: Scalars["String"];
};

export type ComponentOrder = {
  __typename?: "ComponentOrder";
  componentKey: Scalars["String"];
  sortOrder: Scalars["Int"];
};

export type Event = {
  __typename?: "Event";
  allDay?: Maybe<Scalars["Boolean"]>;
  attendees?: Maybe<Array<Maybe<Attendee>>>;
  calendar?: Maybe<Calendar>;
  createdAt?: Maybe<Scalars["DateTime"]>;
  description?: Maybe<Scalars["String"]>;
  endAt?: Maybe<Scalars["DateTime"]>;
  key: Scalars["String"];
  location?: Maybe<Scalars["String"]>;
  recurrence?: Maybe<Scalars["String"]>;
  startAt?: Maybe<Scalars["DateTime"]>;
  title: Scalars["String"];
};

export type Feature = {
  __typename?: "Feature";
  enabled?: Maybe<Scalars["Boolean"]>;
  key: Scalars["String"];
  metadata?: Maybe<Scalars["JSON"]>;
  name: Scalars["String"];
};

export type Item = {
  __typename?: "Item";
  area?: Maybe<Area>;
  children?: Maybe<Array<Maybe<Item>>>;
  completed?: Maybe<Scalars["Boolean"]>;
  completedAt?: Maybe<Scalars["DateTime"]>;
  createdAt?: Maybe<Scalars["DateTime"]>;
  deleted?: Maybe<Scalars["Boolean"]>;
  deletedAt?: Maybe<Scalars["DateTime"]>;
  dueAt?: Maybe<Scalars["DateTime"]>;
  id: Scalars["String"];
  key: Scalars["String"];
  label?: Maybe<Label>;
  lastUpdatedAt?: Maybe<Scalars["DateTime"]>;
  parent?: Maybe<Item>;
  project?: Maybe<Project>;
  reminders?: Maybe<Array<Maybe<Reminder>>>;
  repeat?: Maybe<Scalars["String"]>;
  scheduledAt?: Maybe<Scalars["DateTime"]>;
  snoozedUntil?: Maybe<Scalars["DateTime"]>;
  sortOrders?: Maybe<Array<Maybe<ItemOrder>>>;
  text?: Maybe<Scalars["String"]>;
  type?: Maybe<Scalars["String"]>;
};

export type ItemOrder = {
  __typename?: "ItemOrder";
  componentKey: Scalars["String"];
  item: Item;
  sortOrder: Scalars["Int"];
};

export type Label = {
  __typename?: "Label";
  colour?: Maybe<Scalars["String"]>;
  key: Scalars["String"];
  name?: Maybe<Scalars["String"]>;
};

export type Project = {
  __typename?: "Project";
  area?: Maybe<Area>;
  createdAt?: Maybe<Scalars["DateTime"]>;
  deleted?: Maybe<Scalars["Boolean"]>;
  deletedAt?: Maybe<Scalars["DateTime"]>;
  description?: Maybe<Scalars["String"]>;
  emoji?: Maybe<Scalars["String"]>;
  endAt?: Maybe<Scalars["DateTime"]>;
  id: Scalars["String"];
  items?: Maybe<Array<Maybe<Item>>>;
  key: Scalars["String"];
  lastUpdatedAt?: Maybe<Scalars["DateTime"]>;
  name: Scalars["String"];
  sortOrder?: Maybe<ProjectOrder>;
  startAt?: Maybe<Scalars["DateTime"]>;
};

export type ProjectOrder = {
  __typename?: "ProjectOrder";
  projectKey: Scalars["String"];
  sortOrder: Scalars["Int"];
};

export type Reminder = {
  __typename?: "Reminder";
  createdAt?: Maybe<Scalars["DateTime"]>;
  deleted?: Maybe<Scalars["Boolean"]>;
  deletedAt?: Maybe<Scalars["DateTime"]>;
  item?: Maybe<Item>;
  key: Scalars["String"];
  lastUpdatedAt?: Maybe<Scalars["DateTime"]>;
  remindAt?: Maybe<Scalars["DateTime"]>;
  text: Scalars["String"];
};

export type View = {
  __typename?: "View";
  createdAt?: Maybe<Scalars["DateTime"]>;
  deleted: Scalars["Boolean"];
  deletedAt?: Maybe<Scalars["DateTime"]>;
  icon: Scalars["String"];
  id: Scalars["String"];
  key: Scalars["String"];
  name: Scalars["String"];
  sortOrder?: Maybe<ViewOrder>;
  type: Scalars["String"];
};

export type ViewOrder = {
  __typename?: "ViewOrder";
  id: Scalars["String"];
  sortOrder: Scalars["Int"];
  viewKey: Scalars["String"];
};

export type WeeklyGoal = {
  __typename?: "WeeklyGoal";
  goal?: Maybe<Scalars["String"]>;
  key: Scalars["String"];
  week: Scalars["String"];
};
