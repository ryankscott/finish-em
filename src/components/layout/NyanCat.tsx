import { useQuery } from '@tanstack/react-query'
import { isToday, parseISO } from 'date-fns'

import { api } from '@/lib/api-client'

/** Full rainbow at this many tasks completed today */
const MILESTONE = 10

export function NyanCat() {
  const { data: completedToday = 0 } = useQuery({
    queryKey: ['tasks', 'nyan-cat'],
    queryFn: async () => {
      const tasks = await api.listTasks({ status: 'completed' })
      return tasks.filter(
        (t) => t.completedAt && isToday(parseISO(t.completedAt)),
      ).length
    },
    refetchInterval: 10_000,
  })

  const fillPercent = Math.min((completedToday / MILESTONE) * 100, 100)
  const hasProgress = completedToday > 0

  return (
    <div className="border-t bg-zinc-50 px-3 py-2">
      <div className="relative h-6 overflow-hidden rounded-full bg-zinc-200">
        {/* Rainbow trail */}
        <div
          className="nyan-rainbow absolute left-0 top-0 h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${fillPercent}%` }}
        />

        {/* Cat at the tip of the rainbow */}
        {hasProgress && (
          <div
            className="nyan-cat-bob pointer-events-none absolute top-1/2 -translate-y-1/2 text-base leading-none"
            style={{ left: `calc(${fillPercent}% - 1.25rem)` }}
          >
            🐱
          </div>
        )}

        {/* Stars behind the cat */}
        {hasProgress && fillPercent > 15 && (
          <>
            <span
              className="nyan-star pointer-events-none absolute top-1/2 -translate-y-1/2 text-[0.55rem] text-yellow-200 opacity-80"
              style={{ left: `${fillPercent * 0.4}%` }}
            >
              ★
            </span>
            <span
              className="nyan-star-delay pointer-events-none absolute top-1/2 -translate-y-1/2 text-[0.55rem] text-yellow-200 opacity-80"
              style={{ left: `${fillPercent * 0.65}%` }}
            >
              ✦
            </span>
          </>
        )}

        {/* Count label */}
        <div className="absolute inset-0 flex items-center justify-end pr-3">
          <span className={`text-xs font-medium ${hasProgress ? 'text-zinc-100 drop-shadow' : 'text-zinc-400'}`}>
            {completedToday === 0
              ? 'Complete a task to summon the cat'
              : completedToday === 1
                ? '1 task done today'
                : `${completedToday} tasks done today`}
          </span>
        </div>
      </div>
    </div>
  )
}
