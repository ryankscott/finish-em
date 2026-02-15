const isoDateTime = {
  type: 'string',
  format: 'date-time',
} as const

const schemas = {
  Priority: {
    type: 'integer',
    enum: [1, 2, 3, 4],
  },
  TaskStatus: {
    type: 'string',
    enum: ['open', 'completed'],
  },
  GoalPeriod: {
    type: 'string',
    enum: ['daily', 'weekly'],
  },
  ReminderStatus: {
    type: 'string',
    enum: ['pending', 'fired', 'snoozed', 'dismissed'],
  },
  Project: {
    type: 'object',
    required: ['id', 'name', 'color', 'isInbox', 'createdAt', 'updatedAt'],
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      color: { type: 'string' },
      isInbox: { type: 'boolean' },
      createdAt: isoDateTime,
      updatedAt: isoDateTime,
    },
  },
  Task: {
    type: 'object',
    required: [
      'id',
      'projectId',
      'title',
      'notes',
      'priority',
      'scheduledAt',
      'dueAt',
      'dueTimezone',
      'recurrencePreset',
      'recurrenceRRule',
      'status',
      'completedAt',
      'createdAt',
      'updatedAt',
    ],
    properties: {
      id: { type: 'integer' },
      projectId: { type: 'integer' },
      title: { type: 'string' },
      notes: { type: 'string' },
      priority: { $ref: '#/components/schemas/Priority' },
      scheduledAt: { anyOf: [isoDateTime, { type: 'null' }] },
      dueAt: { anyOf: [isoDateTime, { type: 'null' }] },
      dueTimezone: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      recurrencePreset: {
        anyOf: [
          {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly', 'every_weekday'],
          },
          { type: 'null' },
        ],
      },
      recurrenceRRule: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      status: { $ref: '#/components/schemas/TaskStatus' },
      completedAt: { anyOf: [isoDateTime, { type: 'null' }] },
      createdAt: isoDateTime,
      updatedAt: isoDateTime,
    },
    examples: [
      {
        id: 10,
        projectId: 1,
        title: 'Plan sprint',
        notes: '',
        priority: 2,
        scheduledAt: '2026-02-16T09:00:00.000Z',
        dueAt: '2026-02-16T17:00:00.000Z',
        dueTimezone: 'America/New_York',
        recurrencePreset: 'weekly',
        recurrenceRRule: null,
        status: 'open',
        completedAt: null,
        createdAt: '2026-02-15T08:00:00.000Z',
        updatedAt: '2026-02-15T08:00:00.000Z',
      },
    ],
  },
  Reminder: {
    type: 'object',
    required: [
      'id',
      'taskId',
      'remindAt',
      'status',
      'snoozedUntil',
      'createdAt',
      'updatedAt',
    ],
    properties: {
      id: { type: 'integer' },
      taskId: { type: 'integer' },
      remindAt: isoDateTime,
      status: { $ref: '#/components/schemas/ReminderStatus' },
      snoozedUntil: { anyOf: [isoDateTime, { type: 'null' }] },
      createdAt: isoDateTime,
      updatedAt: isoDateTime,
    },
    examples: [
      {
        id: 5,
        taskId: 10,
        remindAt: '2026-02-16T16:30:00.000Z',
        status: 'pending',
        snoozedUntil: null,
        createdAt: '2026-02-15T08:00:00.000Z',
        updatedAt: '2026-02-15T08:00:00.000Z',
      },
    ],
  },
  Goal: {
    type: 'object',
    required: [
      'id',
      'periodType',
      'periodStart',
      'title',
      'done',
      'createdAt',
      'updatedAt',
    ],
    properties: {
      id: { type: 'integer' },
      periodType: { $ref: '#/components/schemas/GoalPeriod' },
      periodStart: { type: 'string', format: 'date' },
      title: { type: 'string' },
      done: { type: 'boolean' },
      createdAt: isoDateTime,
      updatedAt: isoDateTime,
    },
  },
  QuickAddParseResult: {
    type: 'object',
    properties: {
      raw: { type: 'string' },
      title: { type: 'string' },
      projectName: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      priority: {
        anyOf: [{ $ref: '#/components/schemas/Priority' }, { type: 'null' }],
      },
      dueAt: { anyOf: [isoDateTime, { type: 'null' }] },
      scheduledAt: { anyOf: [isoDateTime, { type: 'null' }] },
      dueTimezone: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      recurrencePreset: {
        anyOf: [
          {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly', 'every_weekday'],
          },
          { type: 'null' },
        ],
      },
      recurrenceRRule: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      warnings: {
        type: 'array',
        items: { type: 'string' },
      },
      source: { type: 'string', enum: ['deterministic', 'ai'] },
      confidence: { type: 'number' },
    },
    examples: [
      {
        raw: 'Submit report p1 #Work tomorrow every weekday',
        title: 'Submit report',
        projectName: 'Work',
        priority: 1,
        dueAt: '2026-02-16T09:00:00.000Z',
        scheduledAt: null,
        dueTimezone: 'America/New_York',
        recurrencePreset: 'every_weekday',
        recurrenceRRule: null,
        warnings: [],
        source: 'deterministic',
        confidence: 0.88,
      },
    ],
  },
}

const paths = {
  '/api/projects': {
    get: {
      responses: {
        '200': {
          description: 'List projects',
          content: {
            'application/json': {
              schema: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
            },
          },
        },
      },
    },
    post: {
      responses: {
        '200': {
          description: 'Created project',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Project' },
            },
          },
        },
      },
    },
  },
  '/api/projects/{projectId}': {
    patch: { responses: { '200': { description: 'Updated project' } } },
    delete: { responses: { '200': { description: 'Deleted project' } } },
  },
  '/api/tasks': {
    get: {
      parameters: [
        {
          name: 'projectId',
          in: 'query',
          schema: { type: 'integer' },
        },
        {
          name: 'status',
          in: 'query',
          schema: { $ref: '#/components/schemas/TaskStatus' },
        },
        {
          name: 'from',
          in: 'query',
          schema: isoDateTime,
        },
        {
          name: 'to',
          in: 'query',
          schema: isoDateTime,
        },
        {
          name: 'priority',
          in: 'query',
          schema: { $ref: '#/components/schemas/Priority' },
        },
        {
          name: 'noDueDate',
          in: 'query',
          schema: { type: 'boolean' },
        },
      ],
      responses: {
        '200': {
          description: 'List tasks',
          content: {
            'application/json': {
              schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
            },
          },
        },
      },
    },
    post: { responses: { '200': { description: 'Created task' } } },
  },
  '/api/tasks/{taskId}': {
    patch: { responses: { '200': { description: 'Updated task' } } },
    delete: { responses: { '200': { description: 'Deleted task' } } },
  },
  '/api/tasks/{taskId}/complete': {
    post: { responses: { '200': { description: 'Completed task' } } },
  },
  '/api/tasks/{taskId}/uncomplete': {
    post: { responses: { '200': { description: 'Uncompleted task' } } },
  },
  '/api/tasks/{taskId}/reminders': {
    get: { responses: { '200': { description: 'List reminders' } } },
    post: { responses: { '200': { description: 'Created reminder' } } },
  },
  '/api/reminders/{reminderId}': {
    patch: { responses: { '200': { description: 'Updated reminder' } } },
    delete: { responses: { '200': { description: 'Deleted reminder' } } },
  },
  '/api/reminders/{reminderId}/snooze': {
    post: { responses: { '200': { description: 'Snoozed reminder' } } },
  },
  '/api/goals': {
    get: { responses: { '200': { description: 'List goals' } } },
    post: { responses: { '200': { description: 'Create goal' } } },
  },
  '/api/goals/{goalId}': {
    patch: { responses: { '200': { description: 'Update goal' } } },
    delete: { responses: { '200': { description: 'Delete goal' } } },
  },
  '/api/quick-add/parse': {
    post: {
      responses: {
        '200': {
          description: 'Parsed quick add',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/QuickAddParseResult' },
            },
          },
        },
      },
    },
  },
  '/api/quick-add/create': {
    post: { responses: { '200': { description: 'Create task from quick add' } } },
  },
  '/api/openapi.json': {
    get: { responses: { '200': { description: 'OpenAPI spec' } } },
  },
}

export function buildOpenApiSpec() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Finish Em Todo API',
      version: '1.0.0',
      description: 'Todoist-style API for tasks, projects, reminders, goals, and quick add.',
    },
    servers: [{ url: 'http://localhost:3000' }],
    paths,
    components: { schemas },
  }
}
