"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  LayoutDashboard,
  FolderTree,
  Store,
  Users,
  MessageSquare,
  Bell,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { AppLauncher } from '@/components/ui/AppLauncher';
import { useAuth } from '@/hooks/use-auth';
import { UnitSelector } from '@/components/ui/UnitSelector';

const routeMap: Record<string, { title: string, icon: any }> = {
  '/admin': { title: 'Dashboard', icon: LayoutDashboard },
  '/admin/segmentos': { title: 'Segmentos', icon: FolderTree },
  '/admin/estabelecimentos': { title: 'Estabelecimentos', icon: Store },
  '/admin/leads': { title: 'Leads', icon: Users },
  '/admin/enquetes': { title: 'Enquetes', icon: MessageSquare },
};

export function AdminHeader() {
  const pathname = usePathname();
  const { organizationId, organizationName } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => setMounted(true), []);

  let currentRoute = routeMap[pathname] || { title: 'Admin', icon: LayoutDashboard };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-container-desktop shrink-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground/60">
            <Link href="/admin" className="hover:text-primary transition-colors">
              <LayoutDashboard size={14} />
            </Link>
            <ChevronRight size={12} className="opacity-40" />
          </div>
          <div className="flex items-center gap-2">
            {currentRoute.icon && <currentRoute.icon size={16} className="text-primary/80" />}
            <h1 className="text-sm font-bold text-foreground uppercase tracking-widest">{currentRoute.title}</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-muted/30 rounded-md px-2.5 py-1 border border-border/50">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2"></span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{organizationName || "Participa"}</span>
        </div>

        <UnitSelector />

        <div className="flex items-center gap-2">
          {organizationId && (
            <>
              <AppLauncher organizationId={organizationId} />
              <div className="h-4 w-px bg-border/50 mx-2" />
            </>
          )}

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all group"
          >
            {!mounted ? <Laptop size={18} /> : theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all relative group">
            <Bell size={18} className="group-hover:scale-105 transition-transform" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-destructive rounded-full border-2 border-card"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
