// src/components/layout/header.tsx
'use client';

import Link from 'next/link';
import {
  Settings,
  Building,
  PanelLeft,
  User,
  LogOut,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { navItems, NavItem } from '@/lib/nav-items';

export function Header() {
    const { user, role } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const pathname = usePathname();
    const [isSheetOpen, setSheetOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            toast({ variant: 'destructive', title: "Error signing out." });
        }
    };
    
    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    const renderMobileNavItem = (item: NavItem) => {
      if (!role || !item.roles.includes(role)) {
          return null;
      }
      const isActive = pathname.startsWith(item.href);

      if (item.children) {
        const visibleChildren = item.children.filter(child => child.roles.includes(role));
        if (visibleChildren.length === 0) return null;

        return (
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={item.href} className="border-b-0">
                    <AccordionTrigger className={cn(
                        "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground hover:no-underline",
                        isActive && "text-foreground"
                    )}>
                        <div className='flex items-center gap-4'>
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-4">
                        {visibleChildren.map(child => {
                            const isChildActive = pathname === child.href;
                            return (
                                <Link
                                    key={child.href}
                                    href={child.href}
                                    onClick={() => setSheetOpen(false)}
                                    className={cn(
                                        "block rounded-lg py-2 pl-8 pr-2 text-muted-foreground hover:text-foreground",
                                        isChildActive && "bg-accent text-accent-foreground"
                                    )}
                                >
                                    {child.label}
                                </Link>
                            )
                        })}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        )
      }


      return (
          <Link
              key={item.href}
              href={item.href}
              onClick={() => setSheetOpen(false)}
              className={cn(
                  "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                  isActive && "text-foreground"
              )}
          >
              <item.icon className="h-5 w-5" />
              {item.label}
          </Link>
      );
    }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="/dashboard"
              onClick={() => setSheetOpen(false)}
              className={cn(
                  "group flex h-10 shrink-0 items-center gap-2 rounded-full bg-primary px-4 text-lg font-semibold text-primary-foreground md:text-base"
              )}
            >
              <Building className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="font-bold">HR Central</span>
            </Link>
            {navItems.map(renderMobileNavItem)}
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Breadcrumbs or search bar can go here */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                <AvatarFallback>{getInitials(user?.displayName || user?.email)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.displayName || user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {user && <DropdownMenuItem onClick={() => router.push(`/employees/${user.uid}`)}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>}
          {role === 'admin' && <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
