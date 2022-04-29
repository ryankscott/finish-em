import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
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
  DateTime: any;
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

export type BulkCreateItemOrdersInput = {
  componentKey: Scalars['String'];
  itemKeys: Array<InputMaybe<Scalars['String']>>;
};

export type ChangeDescriptionAreaInput = {
  description: Scalars['String'];
  key: Scalars['String'];
};

export type ChangeDescriptionProjectInput = {
  description: Scalars['String'];
  key: Scalars['String'];
};

export type CloneItemInput = {
  key: Scalars['String'];
};

export type CompleteItemInput = {
  key: Scalars['String'];
};

export type CreateAreaInput = {
  description?: InputMaybe<Scalars['String']>;
  key: Scalars['String'];
  name: Scalars['String'];
};

export type CreateAreaOrderInput = {
  areaKey: Scalars['String'];
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

export type DeleteAreaInput = {
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
  key: Scalars['String'];
  label?: Maybe<Label>;
  lastUpdatedAt?: Maybe<Scalars['DateTime']>;
  parent?: Maybe<Item>;
  project?: Maybe<Project>;
  reminders?: Maybe<Array<Maybe<Reminder>>>;
  repeat?: Maybe<Scalars['String']>;
  scheduledAt?: Maybe<Scalars['DateTime']>;
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

export type MigrateAreaInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deleted?: InputMaybe<Scalars['Boolean']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  description?: InputMaybe<Scalars['String']>;
  key: Scalars['String'];
  lastUpdatedAt?: InputMaybe<Scalars['DateTime']>;
  name?: InputMaybe<Scalars['String']>;
};

export type MigrateAreaOrderInput = {
  areaKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type MigrateItemInput = {
  areaKey?: InputMaybe<Scalars['String']>;
  completed?: InputMaybe<Scalars['Boolean']>;
  completedAt?: InputMaybe<Scalars['DateTime']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deleted?: InputMaybe<Scalars['Boolean']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  dueAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  labelKey?: InputMaybe<Scalars['String']>;
  lastUpdatedAt?: InputMaybe<Scalars['DateTime']>;
  parentKey?: InputMaybe<Scalars['String']>;
  projectKey?: InputMaybe<Scalars['String']>;
  repeat?: InputMaybe<Scalars['String']>;
  scheduledAt?: InputMaybe<Scalars['DateTime']>;
  text?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<Scalars['String']>;
};

export type MigrateItemOrderInput = {
  componentKey: Scalars['String'];
  itemKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type MigrateProjectInput = {
  areaKey?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  deleted?: InputMaybe<Scalars['Boolean']>;
  deletedAt?: InputMaybe<Scalars['DateTime']>;
  description?: InputMaybe<Scalars['String']>;
  endAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  lastUpdatedAt?: InputMaybe<Scalars['DateTime']>;
  name?: InputMaybe<Scalars['String']>;
  startAt?: InputMaybe<Scalars['DateTime']>;
};

export type MigrateProjectOrderInput = {
  projectKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  bulkCreateItemOrders?: Maybe<Scalars['String']>;
  changeDescriptionArea?: Maybe<Area>;
  changeDescriptionProject?: Maybe<Project>;
  cloneItem?: Maybe<Item>;
  completeItem?: Maybe<Item>;
  createArea?: Maybe<Area>;
  createAreaOrder?: Maybe<AreaOrder>;
  createItem?: Maybe<Item>;
  createItemOrder?: Maybe<ItemOrder>;
  createLabel?: Maybe<Label>;
  createProject?: Maybe<Project>;
  createProjectOrder?: Maybe<ProjectOrder>;
  createReminder?: Maybe<Reminder>;
  deleteArea?: Maybe<Area>;
  deleteItem?: Maybe<Item>;
  deleteItemOrdersByComponent?: Maybe<Scalars['String']>;
  deleteLabel?: Maybe<Scalars['String']>;
  deleteProject?: Maybe<Project>;
  deleteReminder?: Maybe<Reminder>;
  deleteReminderFromItem?: Maybe<Reminder>;
  migrateArea?: Maybe<Area>;
  migrateAreaOrder?: Maybe<AreaOrder>;
  migrateItem?: Maybe<Item>;
  migrateItemOrder?: Maybe<ItemOrder>;
  migrateProject?: Maybe<Project>;
  migrateProjectOrder?: Maybe<ProjectOrder>;
  permanentDeleteItem: Scalars['String'];
  renameArea?: Maybe<Area>;
  renameItem?: Maybe<Item>;
  renameLabel?: Maybe<Label>;
  renameProject?: Maybe<Project>;
  restoreItem?: Maybe<Item>;
  setAreaOfItem?: Maybe<Item>;
  setAreaOfProject?: Maybe<Project>;
  setAreaOrder?: Maybe<AreaOrder>;
  setColourOfLabel?: Maybe<Label>;
  setDueAtOfItem?: Maybe<Item>;
  setEmojiOfArea?: Maybe<Area>;
  setEmojiOfProject?: Maybe<Project>;
  setEndDateOfProject?: Maybe<Project>;
  setItemOrder?: Maybe<Scalars['String']>;
  setLabelOfItem?: Maybe<Item>;
  setParentOfItem?: Maybe<Item>;
  setProjectOfItem?: Maybe<Item>;
  setProjectOrder?: Maybe<ProjectOrder>;
  setRepeatOfItem?: Maybe<Item>;
  setScheduledAtOfItem?: Maybe<Item>;
  setStartDateOfProject?: Maybe<Project>;
  setTypeOfItem?: Maybe<Item>;
  unCompleteItem?: Maybe<Item>;
};


export type MutationBulkCreateItemOrdersArgs = {
  input: BulkCreateItemOrdersInput;
};


export type MutationChangeDescriptionAreaArgs = {
  input: ChangeDescriptionAreaInput;
};


export type MutationChangeDescriptionProjectArgs = {
  input: ChangeDescriptionProjectInput;
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


export type MutationDeleteAreaArgs = {
  input: DeleteAreaInput;
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


export type MutationMigrateAreaArgs = {
  input: MigrateAreaInput;
};


export type MutationMigrateAreaOrderArgs = {
  input: MigrateAreaOrderInput;
};


export type MutationMigrateItemArgs = {
  input: MigrateItemInput;
};


export type MutationMigrateItemOrderArgs = {
  input: MigrateItemOrderInput;
};


export type MutationMigrateProjectArgs = {
  input: MigrateProjectInput;
};


export type MutationMigrateProjectOrderArgs = {
  input: MigrateProjectOrderInput;
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


export type MutationRestoreItemArgs = {
  input: RestoreItemInput;
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


export type MutationSetItemOrderArgs = {
  input: SetItemOrderInput;
};


export type MutationSetLabelOfItemArgs = {
  input: SetLabelOfInput;
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


export type MutationSetStartDateOfProjectArgs = {
  input: SetStartDateOfProjectInput;
};


export type MutationSetTypeOfItemArgs = {
  input: SetTypeOfItemInput;
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
};


export type QueryAreaArgs = {
  key: Scalars['String'];
};


export type QueryAreaOrderArgs = {
  areaKey: Scalars['String'];
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

export type RestoreItemInput = {
  key: Scalars['String'];
};

export type SetAreaOfItemInput = {
  areaKey?: InputMaybe<Scalars['String']>;
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

export type SetDueAtOfItemInput = {
  dueAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
};

export type SetEmojiOfAreaInput = {
  emoji: Scalars['String'];
  key: Scalars['String'];
};

export type SetEndDateOfProjectInput = {
  endAt: Scalars['String'];
  key: Scalars['String'];
};

export type SetItemOrderInput = {
  componentKey: Scalars['String'];
  itemKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type SetLabelOfInput = {
  key: Scalars['String'];
  labelKey?: InputMaybe<Scalars['String']>;
};

export type SetParentOfItemInput = {
  key: Scalars['String'];
  parentKey?: InputMaybe<Scalars['String']>;
};

export type SetProjectOfItemInput = {
  key: Scalars['String'];
  projectKey?: InputMaybe<Scalars['String']>;
};

export type SetProjectOrderInput = {
  projectKey: Scalars['String'];
  sortOrder: Scalars['Int'];
};

export type SetRepeatOfItemInput = {
  key: Scalars['String'];
  repeat?: InputMaybe<Scalars['String']>;
};

export type SetScheduledAtOfItemInput = {
  key: Scalars['String'];
  scheduledAt?: InputMaybe<Scalars['DateTime']>;
};

export type SetStartDateOfProjectInput = {
  key: Scalars['String'];
  startAt: Scalars['String'];
};

export type SetTypeOfItemInput = {
  key: Scalars['String'];
  type: Scalars['String'];
};

export type UnCompleteItemInput = {
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
  Area: ResolverTypeWrapper<Area>;
  AreaOrder: ResolverTypeWrapper<AreaOrder>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  BulkCreateItemOrdersInput: BulkCreateItemOrdersInput;
  ChangeDescriptionAreaInput: ChangeDescriptionAreaInput;
  ChangeDescriptionProjectInput: ChangeDescriptionProjectInput;
  CloneItemInput: CloneItemInput;
  CompleteItemInput: CompleteItemInput;
  CreateAreaInput: CreateAreaInput;
  CreateAreaOrderInput: CreateAreaOrderInput;
  CreateItemInput: CreateItemInput;
  CreateItemOrderInput: CreateItemOrderInput;
  CreateLabelInput: CreateLabelInput;
  CreateProjectInput: CreateProjectInput;
  CreateProjectOrderInput: CreateProjectOrderInput;
  CreateReminderInput: CreateReminderInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DeleteAreaInput: DeleteAreaInput;
  DeleteItemInput: DeleteItemInput;
  DeleteItemOrdersByComponentInput: DeleteItemOrdersByComponentInput;
  DeleteLabelInput: DeleteLabelInput;
  DeleteProjectInput: DeleteProjectInput;
  DeleteReminderFromItemInput: DeleteReminderFromItemInput;
  DeleteReminderInput: DeleteReminderInput;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Item: ResolverTypeWrapper<Item>;
  ItemOrder: ResolverTypeWrapper<ItemOrder>;
  Label: ResolverTypeWrapper<Label>;
  MigrateAreaInput: MigrateAreaInput;
  MigrateAreaOrderInput: MigrateAreaOrderInput;
  MigrateItemInput: MigrateItemInput;
  MigrateItemOrderInput: MigrateItemOrderInput;
  MigrateProjectInput: MigrateProjectInput;
  MigrateProjectOrderInput: MigrateProjectOrderInput;
  Mutation: ResolverTypeWrapper<{}>;
  PermanentDeleteInput: PermanentDeleteInput;
  Project: ResolverTypeWrapper<Project>;
  ProjectOrder: ResolverTypeWrapper<ProjectOrder>;
  ProjectsByAreaInput: ProjectsByAreaInput;
  ProjectsInput: ProjectsInput;
  Query: ResolverTypeWrapper<{}>;
  Reminder: ResolverTypeWrapper<Reminder>;
  RenameAreaInput: RenameAreaInput;
  RenameItemInput: RenameItemInput;
  RenameLabelInput: RenameLabelInput;
  RenameProjectInput: RenameProjectInput;
  RestoreItemInput: RestoreItemInput;
  SetAreaOfItemInput: SetAreaOfItemInput;
  SetAreaOfProjectInput: SetAreaOfProjectInput;
  SetAreaOrderInput: SetAreaOrderInput;
  SetColourOfLabelInput: SetColourOfLabelInput;
  SetDueAtOfItemInput: SetDueAtOfItemInput;
  SetEmojiOfAreaInput: SetEmojiOfAreaInput;
  SetEndDateOfProjectInput: SetEndDateOfProjectInput;
  SetItemOrderInput: SetItemOrderInput;
  SetLabelOfInput: SetLabelOfInput;
  SetParentOfItemInput: SetParentOfItemInput;
  SetProjectOfItemInput: SetProjectOfItemInput;
  SetProjectOrderInput: SetProjectOrderInput;
  SetRepeatOfItemInput: SetRepeatOfItemInput;
  SetScheduledAtOfItemInput: SetScheduledAtOfItemInput;
  SetStartDateOfProjectInput: SetStartDateOfProjectInput;
  SetTypeOfItemInput: SetTypeOfItemInput;
  String: ResolverTypeWrapper<Scalars['String']>;
  UnCompleteItemInput: UnCompleteItemInput;
  setEmojiOfProjectInput: SetEmojiOfProjectInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Area: Area;
  AreaOrder: AreaOrder;
  Boolean: Scalars['Boolean'];
  BulkCreateItemOrdersInput: BulkCreateItemOrdersInput;
  ChangeDescriptionAreaInput: ChangeDescriptionAreaInput;
  ChangeDescriptionProjectInput: ChangeDescriptionProjectInput;
  CloneItemInput: CloneItemInput;
  CompleteItemInput: CompleteItemInput;
  CreateAreaInput: CreateAreaInput;
  CreateAreaOrderInput: CreateAreaOrderInput;
  CreateItemInput: CreateItemInput;
  CreateItemOrderInput: CreateItemOrderInput;
  CreateLabelInput: CreateLabelInput;
  CreateProjectInput: CreateProjectInput;
  CreateProjectOrderInput: CreateProjectOrderInput;
  CreateReminderInput: CreateReminderInput;
  DateTime: Scalars['DateTime'];
  DeleteAreaInput: DeleteAreaInput;
  DeleteItemInput: DeleteItemInput;
  DeleteItemOrdersByComponentInput: DeleteItemOrdersByComponentInput;
  DeleteLabelInput: DeleteLabelInput;
  DeleteProjectInput: DeleteProjectInput;
  DeleteReminderFromItemInput: DeleteReminderFromItemInput;
  DeleteReminderInput: DeleteReminderInput;
  Int: Scalars['Int'];
  Item: Item;
  ItemOrder: ItemOrder;
  Label: Label;
  MigrateAreaInput: MigrateAreaInput;
  MigrateAreaOrderInput: MigrateAreaOrderInput;
  MigrateItemInput: MigrateItemInput;
  MigrateItemOrderInput: MigrateItemOrderInput;
  MigrateProjectInput: MigrateProjectInput;
  MigrateProjectOrderInput: MigrateProjectOrderInput;
  Mutation: {};
  PermanentDeleteInput: PermanentDeleteInput;
  Project: Project;
  ProjectOrder: ProjectOrder;
  ProjectsByAreaInput: ProjectsByAreaInput;
  ProjectsInput: ProjectsInput;
  Query: {};
  Reminder: Reminder;
  RenameAreaInput: RenameAreaInput;
  RenameItemInput: RenameItemInput;
  RenameLabelInput: RenameLabelInput;
  RenameProjectInput: RenameProjectInput;
  RestoreItemInput: RestoreItemInput;
  SetAreaOfItemInput: SetAreaOfItemInput;
  SetAreaOfProjectInput: SetAreaOfProjectInput;
  SetAreaOrderInput: SetAreaOrderInput;
  SetColourOfLabelInput: SetColourOfLabelInput;
  SetDueAtOfItemInput: SetDueAtOfItemInput;
  SetEmojiOfAreaInput: SetEmojiOfAreaInput;
  SetEndDateOfProjectInput: SetEndDateOfProjectInput;
  SetItemOrderInput: SetItemOrderInput;
  SetLabelOfInput: SetLabelOfInput;
  SetParentOfItemInput: SetParentOfItemInput;
  SetProjectOfItemInput: SetProjectOfItemInput;
  SetProjectOrderInput: SetProjectOrderInput;
  SetRepeatOfItemInput: SetRepeatOfItemInput;
  SetScheduledAtOfItemInput: SetScheduledAtOfItemInput;
  SetStartDateOfProjectInput: SetStartDateOfProjectInput;
  SetTypeOfItemInput: SetTypeOfItemInput;
  String: Scalars['String'];
  UnCompleteItemInput: UnCompleteItemInput;
  setEmojiOfProjectInput: SetEmojiOfProjectInput;
}>;

export type AreaResolvers<ContextType = any, ParentType extends ResolversParentTypes['Area'] = ResolversParentTypes['Area']> = ResolversObject<{
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

export type AreaOrderResolvers<ContextType = any, ParentType extends ResolversParentTypes['AreaOrder'] = ResolversParentTypes['AreaOrder']> = ResolversObject<{
  areaKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type ItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['Item'] = ResolversParentTypes['Item']> = ResolversObject<{
  area?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType>;
  children?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType>;
  completed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  completedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  dueAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType>;
  lastUpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  reminders?: Resolver<Maybe<Array<Maybe<ResolversTypes['Reminder']>>>, ParentType, ContextType>;
  repeat?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scheduledAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  sortOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['ItemOrder']>>>, ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ItemOrderResolvers<ContextType = any, ParentType extends ResolversParentTypes['ItemOrder'] = ResolversParentTypes['ItemOrder']> = ResolversObject<{
  componentKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  item?: Resolver<ResolversTypes['Item'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LabelResolvers<ContextType = any, ParentType extends ResolversParentTypes['Label'] = ResolversParentTypes['Label']> = ResolversObject<{
  colour?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  bulkCreateItemOrders?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationBulkCreateItemOrdersArgs, 'input'>>;
  changeDescriptionArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationChangeDescriptionAreaArgs, 'input'>>;
  changeDescriptionProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationChangeDescriptionProjectArgs, 'input'>>;
  cloneItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationCloneItemArgs, 'input'>>;
  completeItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationCompleteItemArgs, 'input'>>;
  createArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationCreateAreaArgs, 'input'>>;
  createAreaOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType, RequireFields<MutationCreateAreaOrderArgs, 'input'>>;
  createItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationCreateItemArgs, 'input'>>;
  createItemOrder?: Resolver<Maybe<ResolversTypes['ItemOrder']>, ParentType, ContextType, RequireFields<MutationCreateItemOrderArgs, 'input'>>;
  createLabel?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<MutationCreateLabelArgs, 'input'>>;
  createProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationCreateProjectArgs, 'input'>>;
  createProjectOrder?: Resolver<Maybe<ResolversTypes['ProjectOrder']>, ParentType, ContextType, RequireFields<MutationCreateProjectOrderArgs, 'input'>>;
  createReminder?: Resolver<Maybe<ResolversTypes['Reminder']>, ParentType, ContextType, RequireFields<MutationCreateReminderArgs, 'input'>>;
  deleteArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationDeleteAreaArgs, 'input'>>;
  deleteItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationDeleteItemArgs, 'input'>>;
  deleteItemOrdersByComponent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteItemOrdersByComponentArgs, 'input'>>;
  deleteLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteLabelArgs, 'input'>>;
  deleteProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationDeleteProjectArgs, 'input'>>;
  deleteReminder?: Resolver<Maybe<ResolversTypes['Reminder']>, ParentType, ContextType, RequireFields<MutationDeleteReminderArgs, 'input'>>;
  deleteReminderFromItem?: Resolver<Maybe<ResolversTypes['Reminder']>, ParentType, ContextType, RequireFields<MutationDeleteReminderFromItemArgs, 'input'>>;
  migrateArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationMigrateAreaArgs, 'input'>>;
  migrateAreaOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType, RequireFields<MutationMigrateAreaOrderArgs, 'input'>>;
  migrateItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationMigrateItemArgs, 'input'>>;
  migrateItemOrder?: Resolver<Maybe<ResolversTypes['ItemOrder']>, ParentType, ContextType, RequireFields<MutationMigrateItemOrderArgs, 'input'>>;
  migrateProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationMigrateProjectArgs, 'input'>>;
  migrateProjectOrder?: Resolver<Maybe<ResolversTypes['ProjectOrder']>, ParentType, ContextType, RequireFields<MutationMigrateProjectOrderArgs, 'input'>>;
  permanentDeleteItem?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationPermanentDeleteItemArgs, 'input'>>;
  renameArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationRenameAreaArgs, 'input'>>;
  renameItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationRenameItemArgs, 'input'>>;
  renameLabel?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<MutationRenameLabelArgs, 'input'>>;
  renameProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationRenameProjectArgs, 'input'>>;
  restoreItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationRestoreItemArgs, 'input'>>;
  setAreaOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetAreaOfItemArgs, 'input'>>;
  setAreaOfProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationSetAreaOfProjectArgs, 'input'>>;
  setAreaOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType, RequireFields<MutationSetAreaOrderArgs, 'input'>>;
  setColourOfLabel?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<MutationSetColourOfLabelArgs, 'input'>>;
  setDueAtOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetDueAtOfItemArgs, 'input'>>;
  setEmojiOfArea?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<MutationSetEmojiOfAreaArgs, 'input'>>;
  setEmojiOfProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationSetEmojiOfProjectArgs, 'input'>>;
  setEndDateOfProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationSetEndDateOfProjectArgs, 'input'>>;
  setItemOrder?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationSetItemOrderArgs, 'input'>>;
  setLabelOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetLabelOfItemArgs, 'input'>>;
  setParentOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetParentOfItemArgs, 'input'>>;
  setProjectOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetProjectOfItemArgs, 'input'>>;
  setProjectOrder?: Resolver<Maybe<ResolversTypes['ProjectOrder']>, ParentType, ContextType, RequireFields<MutationSetProjectOrderArgs, 'input'>>;
  setRepeatOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetRepeatOfItemArgs, 'input'>>;
  setScheduledAtOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetScheduledAtOfItemArgs, 'input'>>;
  setStartDateOfProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<MutationSetStartDateOfProjectArgs, 'input'>>;
  setTypeOfItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationSetTypeOfItemArgs, 'input'>>;
  unCompleteItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<MutationUnCompleteItemArgs, 'input'>>;
}>;

export type ProjectResolvers<ContextType = any, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = ResolversObject<{
  area?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emoji?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['Item']>>>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastUpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<Maybe<ResolversTypes['ProjectOrder']>, ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectOrderResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectOrder'] = ResolversParentTypes['ProjectOrder']> = ResolversObject<{
  projectKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  area?: Resolver<Maybe<ResolversTypes['Area']>, ParentType, ContextType, RequireFields<QueryAreaArgs, 'key'>>;
  areaOrder?: Resolver<Maybe<ResolversTypes['AreaOrder']>, ParentType, ContextType, RequireFields<QueryAreaOrderArgs, 'areaKey'>>;
  areaOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['AreaOrder']>>>, ParentType, ContextType>;
  areas?: Resolver<Maybe<Array<Maybe<ResolversTypes['Area']>>>, ParentType, ContextType>;
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
}>;

export type ReminderResolvers<ContextType = any, ParentType extends ResolversParentTypes['Reminder'] = ResolversParentTypes['Reminder']> = ResolversObject<{
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

export type Resolvers<ContextType = any> = ResolversObject<{
  Area?: AreaResolvers<ContextType>;
  AreaOrder?: AreaOrderResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Item?: ItemResolvers<ContextType>;
  ItemOrder?: ItemOrderResolvers<ContextType>;
  Label?: LabelResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Project?: ProjectResolvers<ContextType>;
  ProjectOrder?: ProjectOrderResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Reminder?: ReminderResolvers<ContextType>;
}>;

