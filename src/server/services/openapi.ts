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
  AssistantSurface: {
    type: 'string',
    enum: ['ui', 'tui'],
  },
  AssistantRole: {
    type: 'string',
    enum: ['user', 'assistant', 'system'],
  },
  AssistantActionType: {
    type: 'string',
    enum: [
      'create_task',
      'update_task',
      'complete_task',
      'uncomplete_task',
      'delete_task',
      'create_project',
    ],
  },
  AssistantActionStatus: {
    type: 'string',
    enum: ['pending', 'executed', 'cancelled', 'failed'],
  },
  ReminderStatus: {
    type: 'string',
    enum: ['pending', 'fired', 'snoozed', 'dismissed'],
  },
  Project: {
    type: 'object',
    required: [
      'id',
      'name',
      'emoji',
      'description',
      'startAt',
      'endAt',
      'color',
      'isInbox',
      'createdAt',
      'updatedAt',
    ],
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      emoji: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      description: { type: 'string' },
      startAt: { anyOf: [{ type: 'string', format: 'date' }, { type: 'null' }] },
      endAt: { anyOf: [{ type: 'string', format: 'date' }, { type: 'null' }] },
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
      'parentTaskId',
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
      parentTaskId: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
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
        parentTaskId: null,
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
  AppSettings: {
    type: 'object',
    required: [
      'id',
      'timezone',
      'aiProvider',
      'aiBaseUrl',
      'aiModel',
      'hasAiApiKey',
      'aiApiKeyMasked',
      'createdAt',
      'updatedAt',
    ],
    properties: {
      id: { type: 'integer' },
      timezone: { type: 'string' },
      aiProvider: { type: 'string', enum: ['openai', 'lmstudio'] },
      aiBaseUrl: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      aiModel: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      hasAiApiKey: { type: 'boolean' },
      aiApiKeyMasked: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      createdAt: isoDateTime,
      updatedAt: isoDateTime,
    },
  },
  AssistantAction: {
    type: 'object',
    required: ['id', 'type', 'label', 'status', 'payload', 'resultMessage'],
    properties: {
      id: { type: 'string' },
      type: { $ref: '#/components/schemas/AssistantActionType' },
      label: { type: 'string' },
      status: { $ref: '#/components/schemas/AssistantActionStatus' },
      payload: { type: 'object', additionalProperties: true },
      resultMessage: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    },
  },
  AssistantMessage: {
    type: 'object',
    required: ['id', 'surface', 'role', 'content', 'actions', 'createdAt', 'updatedAt'],
    properties: {
      id: { type: 'integer' },
      surface: { $ref: '#/components/schemas/AssistantSurface' },
      role: { $ref: '#/components/schemas/AssistantRole' },
      content: { type: 'string' },
      actions: {
        type: 'array',
        items: { $ref: '#/components/schemas/AssistantAction' },
      },
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
  '/api/settings': {
    get: {
      responses: {
        '200': {
          description: 'Application settings',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AppSettings' },
            },
          },
        },
      },
    },
    patch: {
      responses: {
        '200': {
          description: 'Updated settings',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AppSettings' },
            },
          },
        },
      },
    },
  },
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
    get: {
      responses: {
        '200': {
          description: 'Project details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Project' },
            },
          },
        },
      },
    },
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
          name: 'parentTaskId',
          in: 'query',
          schema: { type: 'integer' },
        },
        {
          name: 'rootsOnly',
          in: 'query',
          schema: { type: 'boolean' },
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
  '/api/assistant': {
    get: {
      parameters: [
        {
          name: 'surface',
          in: 'query',
          schema: { $ref: '#/components/schemas/AssistantSurface' },
        },
      ],
      responses: {
        '200': {
          description: 'Assistant state',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['settings', 'messages'],
                properties: {
                  settings: { $ref: '#/components/schemas/AppSettings' },
                  messages: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AssistantMessage' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/assistant/chat': {
    post: {
      responses: {
        '200': {
          description: 'Assistant chat response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userMessage', 'assistantMessage'],
                properties: {
                  userMessage: { $ref: '#/components/schemas/AssistantMessage' },
                  assistantMessage: { $ref: '#/components/schemas/AssistantMessage' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/assistant/actions/decision': {
    post: {
      responses: {
        '200': {
          description: 'Assistant action result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { $ref: '#/components/schemas/AssistantMessage' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/assistant/messages': {
    delete: {
      responses: {
        '200': {
          description: 'Cleared assistant messages',
        },
      },
    },
  },
  '/api/openapi/json': {
    get: { responses: { '200': { description: 'OpenAPI spec' } } },
  },
  '/mcp': {
    post: {
      summary: 'Model Context Protocol (MCP) Server',
      description: 'JSON-RPC 2.0 endpoint for MCP tools and resources. Exposes CRUD operations for tasks, projects, goals, and reminders.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'JSON-RPC 2.0 request',
              properties: {
                jsonrpc: { type: 'string', enum: ['2.0'] },
                id: { type: ['string', 'number'] },
                method: { type: 'string', enum: ['tools/list', 'tools/call', 'resources/list', 'resources/read'] },
                params: { type: 'object' },
              },
              required: ['jsonrpc', 'method'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'JSON-RPC 2.0 response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'JSON-RPC 2.0 response with MCP tools and resources',
                properties: {
                  jsonrpc: { type: 'string', enum: ['2.0'] },
                  id: { type: ['string', 'number'] },
                  result: { type: 'object' },
                  error: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
  },
}

export function buildOpenApiSpec() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Finish Em Todo API',
      version: '1.0.0',
      description:
        'Todoist-style API for tasks, projects, reminders, goals, quick add, and assistant chat.',
    },
    servers: [{ url: 'http://localhost:3000' }],
    paths,
    components: { schemas },
  }
}
