import { cn } from '@/lib/cn'
import { NavShell } from '@/components/nav-shell'
import { type NavConfig, getMainNavConfig } from '@/lib/nav-config'

type SiteHeaderProps = {
  config?: NavConfig
}

export async function SiteHeader({ config }: SiteHeaderProps = {}) {
  const resolvedConfig: NavConfig = config ?? getMainNavConfig()
  const variant = resolvedConfig.headerVariant

  return (
    <header className="sticky top-0 z-50 w-full pb-0 sm:px-6 sm:pt-2">
      <div
        className={cn(
          'nav-glass container mx-auto flex h-12 max-w-5xl items-center justify-between border-b px-5 sm:rounded-lg sm:border',
          variant === 'subdomain'
            ? 'border-border/40 bg-background sm:bg-background/95'
            : 'border-border/30 bg-card sm:border-transparent sm:bg-card/95 dark:sm:bg-card/95',
        )}
      >
        <NavShell config={resolvedConfig} />
      </div>
    </header>
  )
}
