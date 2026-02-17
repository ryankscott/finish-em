import { useEffect, useMemo, useState } from 'react'

import { QuickAddModal } from '@/components/quick-add/QuickAddModal'
import { ShortcutsModal } from '@/components/layout/ShortcutsModal'
import { api } from '@/lib/api-client'
import { useHotkeys } from '@/lib/hotkeys'
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
import { Calendar, CalendarCheck, CheckCircle, CheckCircle2, InboxIcon } from 'lucide-react'


const SIDEBAR_ITEMS: {link: string, icon: React.ReactNode, label: string}[] = [
  { link: '/', icon: <CalendarCheck className='w-5 h-5'/>, label: 'Today' },
  { link: '/inbox', icon: <InboxIcon className="w-5 h-5" />, label: 'Inbox' },
  { link: '/upcoming', icon: <Calendar className="w-5 h-5" />, label: 'Upcoming' },
  { link: '/completed', icon: <CheckCircle className="w-5 h-5" />, label: 'Completed' },
]

export function AppLayout(props: {
  title: string
  description?: string
  children: React.ReactNode
  onTaskCreated?: () => void | Promise<void>
}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectName, setProjectName] = useState('')
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
      '?': () => setShortcutsOpen(true),
      escape: () => {
        setQuickAddOpen(false)
        setShortcutsOpen(false)
      },
    }),
    [],
  )

  useHotkeys(hotkeys)

  const addProject = async () => {
    const name = projectName.trim()
    if (!name) {
      return
    }

    await api.createProject({ name })
    setProjectName('')
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
                      <SidebarMenuButton asChild>
                        <a href={`/project/${project.id}`}>
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <span>{project.name}</span>
                        </a>
                      </SidebarMenuButton>
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
                <Button
                  type="button"
                  onClick={addProject}
                  variant="outline"
                  className="w-full"
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
        <div className="max-w-5xl mx-auto p-8">
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
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </SidebarProvider>
  )
}
