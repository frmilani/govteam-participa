"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderTree,
  Store,
  Users,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Palette,
  Megaphone,
  Smartphone,
  ClipboardList
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useSidebar } from '@/components/providers/sidebar-context';

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
}

const SidebarItem = ({ href, icon: Icon, label, isCollapsed }: SidebarItemProps) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-all relative group",
        active
          ? "bg-primary/10 text-primary font-bold"
          : "text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <div className={cn("shrink-0 transition-transform", active ? "text-primary" : "group-hover:text-foreground")}>
        <Icon size={18} />
      </div>
      {!isCollapsed && <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300">{label}</span>}

      {isCollapsed && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
          {label}
        </div>
      )}
    </Link>
  );
};

interface ModuleHeaderProps {
  giantLetter: string;
  restOfWord: string;
  colorClass: string;
  isCollapsed: boolean;
}

const ModuleHeader = ({ giantLetter, restOfWord, colorClass, isCollapsed }: ModuleHeaderProps) => {
  // ESTADO 1: MENU COLAPSADO (Mostra apenas a letra ícone centralizada/alinhada)
  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center mb-8 px-2 pt-6">
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <span className={cn("font-black text-4xl leading-none tracking-tighter transition-all duration-300", colorClass)}>
            {giantLetter}
          </span>
          {/* Acento da Marca (Ponto Verde) */}
          <div className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-emerald-500 rounded-[2px] shadow-sm animate-in fade-in zoom-in duration-500"></div>
        </div>
      </div>
    );
  }

  // ESTADO 2: MENU EXPANDIDO (Drop Cap unida ao resto da palavra)
  return (
    <div className="flex items-baseline justify-start mb-8 px-6 pt-6">
      {/* Container da Letra Gigante (Drop Cap) */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <span className={cn("font-black text-4xl leading-none tracking-tighter transition-all duration-300", colorClass)}>
          {giantLetter}
        </span>
        {/* Acento da Marca (Ponto Verde) flutuando no canto superior direito da letra */}
        <div className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-emerald-500 rounded-[2px] shadow-sm animate-in fade-in zoom-in duration-500"></div>
      </div>

      {/* Resto do Nome do Módulo */}
      <span className="font-black text-2xl tracking-tight text-gray-800 dark:text-gray-100 ml-[2px] truncate transition-all duration-300">
        {restOfWord}
      </span>
    </div>
  );
};

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { data: session } = useSession();

  return (
    <aside className={cn(
      "bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-5 h-6 w-6 bg-card border border-border rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-xs z-50 focus:outline-none"
      >
        {isCollapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
      </button>

      {/* Logo Section em Estilo Drop Cap */}
      <Link href="/admin" className="block group">
        <ModuleHeader
          giantLetter="P"
          restOfWord="articipa"
          colorClass="text-primary"
          isCollapsed={isCollapsed}
        />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <SidebarItem href="/admin" icon={LayoutDashboard} label="Dashboard" isCollapsed={isCollapsed} />
        <SidebarItem href="/admin/segmentos" icon={FolderTree} label="Segmentos" isCollapsed={isCollapsed} />
        <SidebarItem href="/admin/templates" icon={ClipboardList} label="Templates" isCollapsed={isCollapsed} />
        <SidebarItem href="/admin/estabelecimentos" icon={Store} label="Participantes" isCollapsed={isCollapsed} />
        <SidebarItem href="/admin/leads" icon={Users} label="Leads" isCollapsed={isCollapsed} />
        <SidebarItem href="/admin/enquetes" icon={MessageSquare} label="Enquetes" isCollapsed={isCollapsed} />
        <SidebarItem href="/admin/campanhas" icon={Megaphone} label="Campanhas" isCollapsed={isCollapsed} />
        <SidebarItem href="/admin/whatsapp" icon={Smartphone} label="WhatsApp" isCollapsed={isCollapsed} />
        <SidebarItem href="/admin/theme" icon={Palette} label="Temas" isCollapsed={isCollapsed} />
      </nav>

      {/* Brand Logo Section */}
      <div className={cn(
        "py-4 mt-auto flex justify-center items-center transition-all duration-300 group/brand cursor-default",
        isCollapsed ? "px-2" : "px-8"
      )}>
        <img
          src="/logo-branco.png"
          alt="GovTeam Logo"
          className={cn(
            "w-auto dark:block hidden transition-all duration-500 transform group-hover/brand:scale-110 group-hover/brand:brightness-125 filter drop-shadow-sm group-hover/brand:drop-shadow-md",
            isCollapsed ? "max-h-8" : "max-h-20"
          )}
        />
        <img
          src="/logo-branco2.png"
          alt="GovTeam Logo"
          className={cn(
            "w-auto dark:hidden block transition-all duration-500 transform group-hover/brand:scale-110 group-hover/brand:brightness-110 filter drop-shadow-sm group-hover/brand:drop-shadow-md",
            isCollapsed ? "max-h-8" : "max-h-20"
          )}
        />
      </div>

      {/* User Footer */}
      <div className="p-4 mt-auto border-t border-border/50">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-lg transition-colors",
          isCollapsed ? "justify-center" : "bg-muted/30"
        )}>
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/50">
            <User size={16} />
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-foreground truncate">{session?.user?.name || 'Admin'}</p>
                <p className="text-[10px] text-muted-foreground truncate font-medium">{session?.user?.email}</p>
              </div>
              <button
                onClick={async () => {
                  const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:3000';
                  const hubLogoutUrl = `${hubUrl}/auth/logout?callbackUrl=${window.location.origin}`;

                  console.log("[LOGOUT] Clearing local session and redirecting to Hub:", hubLogoutUrl);

                  // Limpa no Spoke sem redirecionar automaticamente
                  await signOut({ redirect: false });

                  // Força o navegador a ir para o logout do Hub
                  window.location.href = hubLogoutUrl;
                }}
                className="text-muted-foreground hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
        {isCollapsed && (
          <button
            onClick={async () => {
              const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:3000';
              const hubLogoutUrl = `${hubUrl}/auth/logout?callbackUrl=${window.location.origin}`;

              await signOut({ redirect: false });
              window.location.href = hubLogoutUrl;
            }}
            className="w-full mt-2 p-3 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all flex justify-center"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
