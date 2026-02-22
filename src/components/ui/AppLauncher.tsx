"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpokeApp {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  color: string;
  isActive: boolean;
}

interface AppLauncherProps {
  organizationId: string;
  className?: string;
}

// Helper para renderizar ícone (emoji ou Lucide)
function renderIcon(iconName: string, size: number = 24) {
  // Se for emoji (caractere unicode), retorna direto
  if (/[\p{Emoji}]/u.test(iconName)) {
    return <span className="text-2xl">{iconName}</span>;
  }

  // Se for nome de ícone Lucide, renderiza o componente
  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent) {
    return <IconComponent size={size} />;
  }

  // Fallback: retorna emoji padrão
  return <span className="text-2xl">📦</span>;
}

export function AppLauncher({ organizationId, className }: AppLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apps, setApps] = useState<SpokeApp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && apps.length === 0) {
      fetchAvailableSpokes();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAvailableSpokes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/hub/spokes?organizationId=${organizationId}`);

      if (!response.ok) {
        throw new Error('Falha ao carregar aplicações');
      }

      const data = await response.json();
      setApps(Array.isArray(data) ? data : (data.spokes || []));
    } catch (err) {
      console.error('[AppLauncher] Erro ao buscar spokes:', err);
      setError('Não foi possível carregar as aplicações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppClick = (app: SpokeApp) => {
    if (app.url === window.location.origin) {
      setIsOpen(false);
      return;
    }

    window.location.href = app.url;
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-xl hover:bg-accent transition-all relative group",
          isOpen && "bg-accent",
          className
        )}
        aria-label="Abrir menu de aplicações"
      >
        {/* 9 Dots Icon (3x3 Grid) */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-muted-foreground group-hover:text-foreground transition-colors"
        >
          <circle cx="4" cy="4" r="1.5" fill="currentColor" />
          <circle cx="10" cy="4" r="1.5" fill="currentColor" />
          <circle cx="16" cy="4" r="1.5" fill="currentColor" />
          <circle cx="4" cy="10" r="1.5" fill="currentColor" />
          <circle cx="10" cy="10" r="1.5" fill="currentColor" />
          <circle cx="16" cy="10" r="1.5" fill="currentColor" />
          <circle cx="4" cy="16" r="1.5" fill="currentColor" />
          <circle cx="10" cy="16" r="1.5" fill="currentColor" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        </svg>

        {/* Badge de notificação (opcional) */}
        {apps.length > 1 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full text-[10px] text-white font-bold flex items-center justify-center">
            {apps.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-20 right-8 z-50 w-[420px] bg-card rounded-3xl shadow-2xl border border-border overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-foreground tracking-tight">
                    Aplicações
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    Navegue entre os sistemas contratados
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 max-h-[500px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                ) : apps.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma aplicação disponível
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {apps.map((app) => (
                      <motion.button
                        key={app.id}
                        onClick={() => handleAppClick(app)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "relative p-4 rounded-2xl border-2 transition-all text-left group",
                          app.url === window.location.origin
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30 bg-card hover:shadow-md"
                        )}
                      >
                        {/* Icon */}
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                          app.color
                        )}>
                          {renderIcon(app.icon, 24)}
                        </div>

                        {/* App Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground leading-tight">
                              {app.name}
                            </h4>
                            {app.url !== window.location.origin && (
                              <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                            {app.description}
                          </p>
                        </div>

                        {/* Current App Badge */}
                        {app.url === window.location.origin && (
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                              Atual
                            </span>
                          </div>
                        )}

                        {/* Inactive Badge */}
                        {!app.isActive && (
                          <div className="absolute inset-0 bg-muted/80 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-xs font-bold text-muted-foreground">
                              Em breve
                            </span>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border bg-muted/30">
                <p className="text-xs text-muted-foreground text-center font-medium">
                  Gerenciado por{' '}
                  <a
                    href={process.env.NEXT_PUBLIC_HUB_URL || '#'}
                    className="text-primary hover:underline font-bold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    FormBuilder Hub
                  </a>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
