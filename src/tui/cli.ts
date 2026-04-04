import type { ApiClient } from './api-client'
import { createDirectApi } from './direct-api'

type CliIo = {
  stdout: { write: (value: string) => void }
  stderr: { write: (value: string) => void }
}

type CliResult = {
  handled: boolean
  exitCode: number
}

type ParsedArgs = {
  positionals: string[]
  flags: Record<string, string | boolean>
}

const ROOT_HELP = `finish-em [command] [subcommand] [flags]

Commands:
  tui
  task
  project
  goal
  reminder
  settings
  help

Examples:
  finish-em task list
  finish-em task add "Ship release notes" --project-id 1 --priority 2
  finish-em project list --json
  finish-em help task
`

const HELP_BY_GROUP: Record<string, string> = {
  task: `finish-em task <subcommand> [flags]

Subcommands:
  list [--project-id <id>] [--status open|completed] [--blocked true|false] [--json]
  add <title> --project-id <id> [--notes <text>] [--priority <1-4>] [--blocked-reason <text>] [--json]
  update <task-id> [--title <text>] [--notes <text>] [--priority <1-4>] [--blocked-reason <text> | --clear-blocked] [--json]
  done <task-id> [--json]
  undone <task-id> [--json]
  delete <task-id> [--json]
`,
  project: `finish-em project <subcommand> [flags]

Subcommands:
  list [--json]
  add <name> [--emoji <emoji>] [--description <text>] [--color <hex>] [--json]
  update <project-id> [--name <text>] [--emoji <emoji>] [--description <text>] [--color <hex>] [--json]
  delete <project-id> [--json]
`,
  goal: `finish-em goal <subcommand> [flags]

Subcommands:
  list [--period-type daily|weekly] [--period-start <yyyy-mm-dd>] [--json]
  add <title> --period-type daily|weekly --period-start <yyyy-mm-dd> [--done true|false] [--json]
  update <goal-id> [--title <text>] [--done true|false] [--json]
  delete <goal-id> [--json]
`,
  reminder: `finish-em reminder <subcommand> [flags]

Subcommands:
  list --task-id <id> [--json]
  add --task-id <id> --remind-at <iso-date> [--json]
  delete <reminder-id> [--json]
`,
  settings: `finish-em settings <subcommand> [flags]

Subcommands:
  get [--json]
  set <key> <value> [--json]

Keys:
  timezone
`,
}

const parseArgs = (args: string[]): ParsedArgs => {
  const positionals: string[] = []
  const flags: Record<string, string | boolean> = {}

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index]

    if (token === '-h') {
      flags.help = true
      continue
    }

    if (!token.startsWith('--')) {
      positionals.push(token)
      continue
    }

    const withoutPrefix = token.slice(2)
    if (withoutPrefix.length === 0) {
      continue
    }

    const [rawKey, inlineValue] = withoutPrefix.split('=', 2)
    if (inlineValue !== undefined) {
      flags[rawKey] = inlineValue
      continue
    }

    const next = args[index + 1]
    if (next !== undefined && !next.startsWith('-')) {
      flags[rawKey] = next
      index += 1
      continue
    }

    flags[rawKey] = true
  }

  return { positionals, flags }
}

const isHelpFlag = (flags: Record<string, string | boolean>) =>
  flags.help === true || flags.h === true

const asString = (
  flags: Record<string, string | boolean>,
  key: string,
): string | undefined => {
  const value = flags[key]
  if (typeof value === 'string') {
    return value
  }
  return undefined
}

const asNumber = (
  flags: Record<string, string | boolean>,
  key: string,
): number | undefined => {
  const value = asString(flags, key)
  if (value === undefined) {
    return undefined
  }
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric value for --${key}`)
  }
  return parsed
}

const asBoolean = (
  flags: Record<string, string | boolean>,
  key: string,
): boolean | undefined => {
  const value = flags[key]
  if (value === undefined) {
    return undefined
  }
  if (typeof value === 'boolean') {
    return value
  }
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`Invalid boolean value for --${key}. Expected true or false`)
}

const printResult = (
  io: CliIo,
  value: unknown,
  options: { json: boolean; human: string | null },
) => {
  if (options.json) {
    io.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
    return
  }

  if (options.human !== null) {
    io.stdout.write(`${options.human}\n`)
    return
  }

  io.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}

const formatTaskList = (
  tasks: Array<{
    id: number
    status: string
    priority: number
    title: string
    blockedReason?: string | null
  }>,
) => {
  if (tasks.length === 0) return 'No tasks found.'
  return tasks
    .map((task) => {
      const blocked = task.blockedReason ? ` blocked:${task.blockedReason}` : ''
      return `[${task.id}] ${task.status} p${task.priority} ${task.title}${blocked}`
    })
    .join('\n')
}

const formatProjectList = (projects: Array<{ id: number; name: string; isInbox: boolean }>) => {
  if (projects.length === 0) return 'No projects found.'
  return projects
    .map((project) => `[${project.id}] ${project.name}${project.isInbox ? ' (inbox)' : ''}`)
    .join('\n')
}

const formatGoalList = (goals: Array<{ id: number; done: boolean; title: string; periodType: string; periodStart: string }>) => {
  if (goals.length === 0) return 'No goals found.'
  return goals
    .map((goal) => `[${goal.id}] ${goal.done ? 'done' : 'open'} ${goal.periodType} ${goal.periodStart} ${goal.title}`)
    .join('\n')
}

const formatReminderList = (
  reminders: Array<{ id: number; taskId: number; status: string; remindAt: string }>,
) => {
  if (reminders.length === 0) return 'No reminders found.'
  return reminders
    .map((reminder) => `[${reminder.id}] task=${reminder.taskId} ${reminder.status} remindAt=${reminder.remindAt}`)
    .join('\n')
}

const requirePositional = (positionals: string[], index: number, label: string): string => {
  const value = positionals[index]
  if (!value) {
    throw new Error(`Missing required argument: ${label}`)
  }
  return value
}

async function runTaskCommand(args: string[], api: ApiClient, io: CliIo) {
  const { positionals, flags } = parseArgs(args)
  const subcommand = positionals[0]
  const outputJson = flags.json === true

  if (!subcommand || subcommand === 'help' || isHelpFlag(flags)) {
    io.stdout.write(`${HELP_BY_GROUP.task}\n`)
    return
  }

  if (subcommand === 'list') {
    const tasks = await api.listTasks({
      projectId: asNumber(flags, 'project-id'),
      status: asString(flags, 'status') as 'open' | 'completed' | undefined,
      blocked: asBoolean(flags, 'blocked'),
    })
    printResult(io, tasks, { json: outputJson, human: formatTaskList(tasks) })
    return
  }

  if (subcommand === 'add') {
    const title = requirePositional(positionals, 1, 'title')
    const projectId = asNumber(flags, 'project-id')
    if (!projectId) throw new Error('Missing required flag: --project-id')
    const task = await api.createTask({
      title,
      projectId,
      notes: asString(flags, 'notes'),
      priority: asNumber(flags, 'priority') as 1 | 2 | 3 | 4 | undefined,
      blockedReason: asString(flags, 'blocked-reason') ?? undefined,
    })
    printResult(io, task, {
      json: outputJson,
      human: `Created task [${task.id}] ${task.title}`,
    })
    return
  }

  if (subcommand === 'update') {
    const taskId = Number.parseInt(requirePositional(positionals, 1, 'task-id'), 10)
    const clearBlocked = flags['clear-blocked'] === true
    const task = await api.updateTask(taskId, {
      title: asString(flags, 'title'),
      notes: asString(flags, 'notes'),
      priority: asNumber(flags, 'priority') as 1 | 2 | 3 | 4 | undefined,
      blockedReason: clearBlocked ? null : asString(flags, 'blocked-reason') ?? undefined,
    })
    printResult(io, task, {
      json: outputJson,
      human: `Updated task [${task.id}] ${task.title}`,
    })
    return
  }

  if (subcommand === 'done') {
    const taskId = Number.parseInt(requirePositional(positionals, 1, 'task-id'), 10)
    const task = await api.completeTask(taskId)
    printResult(io, task, {
      json: outputJson,
      human: `Completed task [${task.id}] ${task.title}`,
    })
    return
  }

  if (subcommand === 'undone') {
    const taskId = Number.parseInt(requirePositional(positionals, 1, 'task-id'), 10)
    const task = await api.uncompleteTask(taskId)
    printResult(io, task, {
      json: outputJson,
      human: `Reopened task [${task.id}] ${task.title}`,
    })
    return
  }

  if (subcommand === 'delete') {
    const taskId = Number.parseInt(requirePositional(positionals, 1, 'task-id'), 10)
    await api.deleteTask(taskId)
    printResult(io, { ok: true, taskId }, {
      json: outputJson,
      human: `Deleted task ${taskId}`,
    })
    return
  }

  throw new Error(`Unknown task subcommand: ${subcommand}`)
}

async function runProjectCommand(args: string[], api: ApiClient, io: CliIo) {
  const { positionals, flags } = parseArgs(args)
  const subcommand = positionals[0]
  const outputJson = flags.json === true

  if (!subcommand || subcommand === 'help' || isHelpFlag(flags)) {
    io.stdout.write(`${HELP_BY_GROUP.project}\n`)
    return
  }

  if (subcommand === 'list') {
    const projects = await api.listProjects()
    printResult(io, projects, { json: outputJson, human: formatProjectList(projects) })
    return
  }

  if (subcommand === 'add') {
    const name = requirePositional(positionals, 1, 'name')
    const project = await api.createProject({
      name,
      emoji: asString(flags, 'emoji') ?? null,
      description: asString(flags, 'description'),
      color: asString(flags, 'color'),
    })
    printResult(io, project, {
      json: outputJson,
      human: `Created project [${project.id}] ${project.name}`,
    })
    return
  }

  if (subcommand === 'update') {
    const projectId = Number.parseInt(requirePositional(positionals, 1, 'project-id'), 10)
    const project = await api.updateProject(projectId, {
      name: asString(flags, 'name'),
      emoji: asString(flags, 'emoji'),
      description: asString(flags, 'description'),
      color: asString(flags, 'color'),
    })
    printResult(io, project, {
      json: outputJson,
      human: `Updated project [${project.id}] ${project.name}`,
    })
    return
  }

  if (subcommand === 'delete') {
    const projectId = Number.parseInt(requirePositional(positionals, 1, 'project-id'), 10)
    await api.deleteProject(projectId)
    printResult(io, { ok: true, projectId }, {
      json: outputJson,
      human: `Deleted project ${projectId}`,
    })
    return
  }

  throw new Error(`Unknown project subcommand: ${subcommand}`)
}

async function runGoalCommand(args: string[], api: ApiClient, io: CliIo) {
  const { positionals, flags } = parseArgs(args)
  const subcommand = positionals[0]
  const outputJson = flags.json === true

  if (!subcommand || subcommand === 'help' || isHelpFlag(flags)) {
    io.stdout.write(`${HELP_BY_GROUP.goal}\n`)
    return
  }

  if (subcommand === 'list') {
    const goals = await api.listGoals({
      periodType: asString(flags, 'period-type') as 'daily' | 'weekly' | undefined,
      periodStart: asString(flags, 'period-start'),
    })
    printResult(io, goals, { json: outputJson, human: formatGoalList(goals) })
    return
  }

  if (subcommand === 'add') {
    const title = requirePositional(positionals, 1, 'title')
    const periodType = asString(flags, 'period-type') as 'daily' | 'weekly' | undefined
    const periodStart = asString(flags, 'period-start')
    if (!periodType || !periodStart) {
      throw new Error('Missing required flags: --period-type and --period-start')
    }
    const goal = await api.createGoal({
      title,
      periodType,
      periodStart,
      done: asBoolean(flags, 'done'),
    })
    printResult(io, goal, { json: outputJson, human: `Created goal [${goal.id}] ${goal.title}` })
    return
  }

  if (subcommand === 'update') {
    const goalId = Number.parseInt(requirePositional(positionals, 1, 'goal-id'), 10)
    const goal = await api.updateGoal(goalId, {
      title: asString(flags, 'title'),
      done: asBoolean(flags, 'done'),
    })
    printResult(io, goal, { json: outputJson, human: `Updated goal [${goal.id}] ${goal.title}` })
    return
  }

  if (subcommand === 'delete') {
    const goalId = Number.parseInt(requirePositional(positionals, 1, 'goal-id'), 10)
    await api.deleteGoal(goalId)
    printResult(io, { ok: true, goalId }, { json: outputJson, human: `Deleted goal ${goalId}` })
    return
  }

  throw new Error(`Unknown goal subcommand: ${subcommand}`)
}

async function runReminderCommand(args: string[], api: ApiClient, io: CliIo) {
  const { positionals, flags } = parseArgs(args)
  const subcommand = positionals[0]
  const outputJson = flags.json === true

  if (!subcommand || subcommand === 'help' || isHelpFlag(flags)) {
    io.stdout.write(`${HELP_BY_GROUP.reminder}\n`)
    return
  }

  if (subcommand === 'list') {
    const taskId = asNumber(flags, 'task-id')
    if (!taskId) throw new Error('Missing required flag: --task-id')
    const reminders = await api.listTaskReminders(taskId)
    printResult(io, reminders, { json: outputJson, human: formatReminderList(reminders) })
    return
  }

  if (subcommand === 'add') {
    const taskId = asNumber(flags, 'task-id')
    const remindAt = asString(flags, 'remind-at')
    if (!taskId || !remindAt) {
      throw new Error('Missing required flags: --task-id and --remind-at')
    }
    const reminder = await api.createReminder(taskId, { remindAt })
    printResult(io, reminder, {
      json: outputJson,
      human: `Created reminder [${reminder.id}] for task ${reminder.taskId}`,
    })
    return
  }

  if (subcommand === 'delete') {
    const reminderId = Number.parseInt(requirePositional(positionals, 1, 'reminder-id'), 10)
    await api.deleteReminder(reminderId)
    printResult(io, { ok: true, reminderId }, {
      json: outputJson,
      human: `Deleted reminder ${reminderId}`,
    })
    return
  }

  throw new Error(`Unknown reminder subcommand: ${subcommand}`)
}

async function runSettingsCommand(args: string[], api: ApiClient, io: CliIo) {
  const { positionals, flags } = parseArgs(args)
  const subcommand = positionals[0]
  const outputJson = flags.json === true

  if (!subcommand || subcommand === 'help' || isHelpFlag(flags)) {
    io.stdout.write(`${HELP_BY_GROUP.settings}\n`)
    return
  }

  if (subcommand === 'get') {
    const settings = await api.getSettings()
    printResult(io, settings, {
      json: outputJson,
      human: `timezone=${settings.timezone}`,
    })
    return
  }

  if (subcommand === 'set') {
    const key = requirePositional(positionals, 1, 'key')
    const value = requirePositional(positionals, 2, 'value')
    const patch: Parameters<ApiClient['updateSettings']>[0] = {}
    if (key === 'timezone') patch.timezone = value
    else throw new Error(`Unknown settings key: ${key}`)

    const settings = await api.updateSettings(patch)
    printResult(io, settings, {
      json: outputJson,
      human: `Updated settings: ${key}`,
    })
    return
  }

  throw new Error(`Unknown settings subcommand: ${subcommand}`)
}

export async function runCli(
  argv: string[],
  input: { api?: ApiClient; io?: CliIo } = {},
): Promise<CliResult> {
  const api = input.api ?? createDirectApi()
  const io = input.io ?? { stdout: process.stdout, stderr: process.stderr }

  if (argv.length === 0) {
    return { handled: false, exitCode: 0 }
  }

  const rootParsed = parseArgs(argv)
  const command = rootParsed.positionals[0]

  if (!command) {
    if (isHelpFlag(rootParsed.flags)) {
      io.stdout.write(ROOT_HELP)
      return { handled: true, exitCode: 0 }
    }
    return { handled: false, exitCode: 0 }
  }

  if (command === 'help') {
    const maybeGroup = rootParsed.positionals[1]
    if (maybeGroup && HELP_BY_GROUP[maybeGroup]) {
      io.stdout.write(`${HELP_BY_GROUP[maybeGroup]}\n`)
      return { handled: true, exitCode: 0 }
    }
    io.stdout.write(ROOT_HELP)
    return { handled: true, exitCode: 0 }
  }

  if (command === 'tui') {
    return { handled: false, exitCode: 0 }
  }

  try {
    const rest = argv.slice(1)
    if (command === 'task') await runTaskCommand(rest, api, io)
    else if (command === 'project') await runProjectCommand(rest, api, io)
    else if (command === 'goal') await runGoalCommand(rest, api, io)
    else if (command === 'reminder') await runReminderCommand(rest, api, io)
    else if (command === 'settings') await runSettingsCommand(rest, api, io)
    else throw new Error(`Unknown command: ${command}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (argv.includes('--json')) {
      io.stderr.write(`${JSON.stringify({ error: message }, null, 2)}\n`)
    } else {
      io.stderr.write(`CLI error: ${message}\n`)
    }
    return { handled: true, exitCode: 1 }
  }

  return { handled: true, exitCode: 0 }
}
