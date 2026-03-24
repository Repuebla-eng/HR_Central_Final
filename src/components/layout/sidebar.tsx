// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { navItems, bottomNavItems, NavItem } from '@/lib/nav-items';
import { Building } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  const renderNavItem = (item: NavItem) => {
    if (!role || !item.roles.includes(role)) {
      return null;
    }
    
    const isActive = pathname.startsWith(item.href);

    if (item.children) {
        const visibleChildren = item.children.filter(child => child.roles.includes(role));
        if (visibleChildren.length === 0) return null;

        return (
            <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                                    isActive && "bg-accent text-accent-foreground"
                                )}
                                >
                                <item.icon className="h-5 w-5" />
                                <span className="sr-only">{item.label}</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right">
                            {visibleChildren.map(child => (
                                <DropdownMenuItem key={child.href} asChild>
                                    <Link href={child.href}>{child.label}</Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        )
    }

    return (
      <Tooltip key={item.href}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
              isActive && "bg-accent text-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="sr-only">{item.label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
              >
                <Building className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">HR Central</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>
          {navItems.map(renderNavItem)}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          {bottomNavItems.map(renderNavItem)}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
