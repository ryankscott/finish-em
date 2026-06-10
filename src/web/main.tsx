import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppShell } from './components/AppShell'
import { HotkeyProvider } from './lib/hotkeys'
import { UiProvider } from './state/ui'
import {
  BlockedView,
  CompletedView,
  DeletedView,
  InboxView,
  OverdueView,
  PriorityView,
  ProjectView,
  SearchView,
  TodayView,
} from './views/SimpleViews'
import { RemindersView } from './views/RemindersView'
import { SettingsView } from './views/SettingsView'
import { UpcomingView } from './views/UpcomingView'
import './styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchInterval: 30_000,
      staleTime: 5_000,
    },
  },
})

const rootRoute = createRootRoute({ component: AppShell })

const routes = [
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: () => {
      throw redirect({ to: '/today' })
    },
  }),
  createRoute({ getParentRoute: () => rootRoute, path: '/today', component: TodayView }),
  createRoute({ getParentRoute: () => rootRoute, path: '/inbox', component: InboxView }),
  createRoute({ getParentRoute: () => rootRoute, path: '/upcoming', component: UpcomingView }),
  createRoute({ getParentRoute: () => rootRoute, path: '/overdue', component: OverdueView }),
  createRoute({ getParentRoute: () => rootRoute, path: '/blocked', component: BlockedView }),
  createRoute({ getParentRoute: () => rootRoute, path: '/priority', component: PriorityView }),
  createRoute({ getParentRoute: () => rootRoute, path: '/completed', component: CompletedView }),
  createRoute({ getParentRoute: () => rootRoute, path: '/deleted', component: DeletedView }),
  createRoute({ getParentRoute: () => rootRoute, path: '/reminders', component: RemindersView }),
  createRoute({ getParentRoute: () => rootRoute, path: '/settings', component: SettingsView }),
  createRoute({ getParentRoute: () => rootRoute, path: '/search', component: SearchView }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/projects/$projectId',
    component: ProjectView,
  }),
]

const router = createRouter({ routeTree: rootRoute.addChildren(routes) })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HotkeyProvider>
        <UiProvider>
          <RouterProvider router={router} />
        </UiProvider>
      </HotkeyProvider>
    </QueryClientProvider>
  </StrictMode>,
)
