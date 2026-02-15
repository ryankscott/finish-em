export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <a href="/" className="font-semibold text-zinc-900">
          finish-em
        </a>
        <nav className="flex items-center gap-3 text-sm text-zinc-700">
          <a href="/">
            Today
          </a>
          <a href="/inbox">
            Inbox
          </a>
          <a href="/upcoming">
            Upcoming
          </a>
        </nav>
      </div>
    </header>
  )
}
