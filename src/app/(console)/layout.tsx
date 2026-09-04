import { AppShell } from '../../shell/AppShell'

// The shell lives here rather than on the document so it survives navigation
// between console pages - only the screen under it re-renders - while `/login`,
// which is outside this group, renders without it.
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
