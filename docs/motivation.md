# Motivation

Personal task management applications are either too simplistic with their
offerings or implement some flavour of Agile / GTD philosophy. Emacs' `org-mode`, on
the other end of the spectrum, offers almost infinite customisation at the cost
of being very complex & only accessible to Emacs users.

The goal here is to distill the main workflows from GTD implementations within
`org-mode`, and package them as a stand alone application.

# Terminology

Most of these are pulled in either from GTD or `org-mode`, but they will
hopefully evolve in their own right while this document gets finalized.

#### Task

A unit of work that has an associated state. The state machine associated with a
task will be hard-coded to start with based on our opinion. A task starts as
`TODO`, and can be moved into `NEXT` when it's ready for work. There should be a
`DOING` state to indicate whe a task is currently being actioned, and a
`WAITING` state if the task is being actioned by someone else. A task should be
associated to a project as part of your daily workflow, and before it can be
actioned upon. A task should have a deadline.

Example model:
{
id: String (uuid),
createdAt: Date,
text: String,
statusID: String (assuming we have a status table),
projectId: String (uuid),
scheduledAt: Date,
dueAt: Date,
completed: Boolean,
completedAt: Date,
deleted: Boolean,
deletedAt: Date,
lastUpdatedAt: Date,
repeat: TBC (having been using RRULE),
parentId: String (uuid),
children: Array<String (uuid)>,
}

#### Event

An event with a scheduled time. Similar to a calendar event, this can be
associated with a project and have metadata associated with it.

#### Note

Self-explanatory, a piece of free-form text. Can have metadata.

Example model:
{
id: String (uuid),
createdAt: Date,
text: String,
projectId: String (uuid),
deleted: Boolean,
deletedAt: Date,
lastUpdatedAt: Date,
parentId: String (uuid)
}

#### Project

A project is a collection of tasks, events, and notes that has a clear
lifecycle. A project is considered stuck or on-hold if it doesn't have a clear,
actionable, and scheduled task to be completed `NEXT`. Projects can be
prioritized.

Example model:
{
id: String(uuid),
name: String,
deleted: Boolean,
description: String,
lastUpdatedAt: Date,
deleted: Boolean,
deletedAt: Date,
createdAt: Date,
rank: Number
}

#### View

A view is a custom filter + UI of tasks, events, and notes. The first few views
will be modeled around basic `org-mode` agenda views - daily view, weekly
review, monthly/quarterly view.

#### Status

A status indicates the possible state and transitions for a Task.

#### Tag
