import { useEffect, useMemo, useState } from 'react'

import { QuickAddModal } from '@/components/quick-add/QuickAddModal'
import { ShortcutsModal } from '@/components/layout/ShortcutsModal'
import { api } from '@/lib/api-client'
import { toDateInputValue } from '@/lib/datetime'
import { useHotkeys } from '@/lib/hotkeys'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { Project } from '@/server/types'
import { Calendar, CalendarCheck, CheckCircle, InboxIcon, Pencil } from 'lucide-react'


const SIDEBAR_ITEMS: {link: string, icon: React.ReactNode, label: string}[] = [
  { link: '/', icon: <CalendarCheck className='w-5 h-5'/>, label: 'Today' },
  { link: '/inbox', icon: <InboxIcon className="w-5 h-5" />, label: 'Inbox' },
  { link: '/upcoming', icon: <Calendar className="w-5 h-5" />, label: 'Upcoming' },
  { link: '/completed', icon: <CheckCircle className="w-5 h-5" />, label: 'Completed' },
]

export function AppLayout(props: {
  title: string
  description?: string
  fullWidth?: boolean
  children: React.ReactNode
  onTaskCreated?: () => void | Promise<void>
}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectName, setProjectName] = useState('')
  const [projectEmoji, setProjectEmoji] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectStartAt, setProjectStartAt] = useState('')
  const [projectEndAt, setProjectEndAt] = useState('')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStartAt, setEditStartAt] = useState('')
  const [editEndAt, setEditEndAt] = useState('')
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const reloadProjects = async () => {
    const data = await api.listProjects()
    setProjects(data)
  }

  useEffect(() => {
    reloadProjects().catch(() => setProjects([]))
  }, [])

  const hotkeys = useMemo(
    () => ({
      'mod+k': () => setQuickAddOpen(true),
      q: () => setQuickAddOpen(true),
      'shift+?': () => setShortcutsOpen((prev) => !prev),
      escape: () => {
        setQuickAddOpen(false)
        setShortcutsOpen(false)
      },
    }),
    [],
  )

  useHotkeys(hotkeys)

  const createDateRangeInvalid =
    projectStartAt.length > 0 &&
    projectEndAt.length > 0 &&
    projectEndAt < projectStartAt

  const editDateRangeInvalid =
    editStartAt.length > 0 &&
    editEndAt.length > 0 &&
    editEndAt < editStartAt

  const addProject = async () => {
    const name = projectName.trim()
    if (!name || createDateRangeInvalid) {
      return
    }

    await api.createProject({
      name,
      emoji: projectEmoji.trim() || null,
      description: projectDescription.trim(),
      startAt: projectStartAt || null,
      endAt: projectEndAt || null,
    })
    setProjectName('')
    setProjectEmoji('')
    setProjectDescription('')
    setProjectStartAt('')
    setProjectEndAt('')
    await reloadProjects()
  }

  const startEditProject = (project: Project) => {
    setEditingProject(project)
    setEditName(project.name)
    setEditEmoji(project.emoji ?? '')
    setEditDescription(project.description)
    setEditStartAt(toDateInputValue(project.startAt))
    setEditEndAt(toDateInputValue(project.endAt))
  }

  const closeEditProject = () => {
    setEditingProject(null)
    setEditName('')
    setEditEmoji('')
    setEditDescription('')
    setEditStartAt('')
    setEditEndAt('')
  }

  const saveEditProject = async () => {
    if (!editingProject) {
      return
    }

    const name = editName.trim()
    if (!name || editDateRangeInvalid) {
      return
    }

    await api.updateProject(editingProject.id, {
      name,
      emoji: editEmoji.trim() || null,
      description: editDescription.trim(),
      startAt: editStartAt || null,
      endAt: editEndAt || null,
    })

    closeEditProject()
    await reloadProjects()
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h1 className="text-xl font-bold px-2 py-4">Finish Em</h1>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {SIDEBAR_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.link}>
                    <SidebarMenuButton asChild>
                    <a href={item.link}>
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects
                  .filter((project) => !project.isInbox)
                  .map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <div className="flex items-center gap-1">
                        <SidebarMenuButton asChild>
                          <a href={`/project/${project.id}`}>
                            {project.emoji ? (
                              <span className="text-base leading-none">{project.emoji}</span>
                            ) : (
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: project.color }}
                              />
                            )}
                            <span>{project.name}</span>
                          </a>
                        </SidebarMenuButton>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0"
                          onClick={() => startEditProject(project)}
                          aria-label={`Edit ${project.name}`}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </div>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupContent>
              <div className="space-y-2 px-2">
                <Input
                  placeholder="New project"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      addProject()
                    }
                  }}
                />
                <Input
                  placeholder="Emoji (optional)"
                  value={projectEmoji}
                  onChange={(event) => setProjectEmoji(event.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={projectDescription}
                  onChange={(event) => setProjectDescription(event.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={projectStartAt}
                    onChange={(event) => setProjectStartAt(event.target.value)}
                  />
                  <Input
                    type="date"
                    value={projectEndAt}
                    onChange={(event) => setProjectEndAt(event.target.value)}
                  />
                </div>
                {createDateRangeInvalid && (
                  <p className="text-sm text-red-600">End date cannot be before start date</p>
                )}
                <Button
                  type="button"
                  onClick={addProject}
                  variant="outline"
                  className="w-full"
                  disabled={createDateRangeInvalid}
                >
                  + Add project
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="space-y-2">
            <Button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              + Quick Add (Q)
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full"
            >
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className={props.fullWidth ? "min-w-0 overflow-x-hidden p-8" : "max-w-5xl mx-auto p-8"}>
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-zinc-900">{props.title}</h2>
            {props.description && <p className="mt-2 text-zinc-600">{props.description}</p>}
          </header>
          {props.children}
        </div>
      </SidebarInset>

      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreated={async () => {
          await reloadProjects()
          await props.onTaskCreated?.()
        }}
      />
      <Dialog open={editingProject !== null} onOpenChange={(open) => !open && closeEditProject()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Project name"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
            />
            <Input
              placeholder="Emoji (optional)"
              value={editEmoji}
              onChange={(event) => setEditEmoji(event.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={editStartAt}
                onChange={(event) => setEditStartAt(event.target.value)}
              />
              <Input
                type="date"
                value={editEndAt}
                onChange={(event) => setEditEndAt(event.target.value)}
              />
            </div>
            {editDateRangeInvalid && (
              <p className="text-sm text-red-600">End date cannot be before start date</p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeEditProject}>
                Cancel
              </Button>
              <Button type="button" onClick={saveEditProject} disabled={editDateRangeInvalid}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </SidebarProvider>
  )
}
