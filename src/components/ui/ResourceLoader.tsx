"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceLoaderProps {
  icon: string;
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: {
    container: "h-[40vh]",
    spinner: "h-10 w-10",
    icon: 16,
    text: "text-[10px]",
  },
  md: {
    container: "h-[60vh]",
    spinner: "h-16 w-16",
    icon: 24,
    text: "text-xs",
  },
  lg: {
    container: "h-[80vh]",
    spinner: "h-20 w-20",
    icon: 32,
    text: "text-sm",
  },
};

function getLucideIcon(name: string): React.ComponentType<{ size?: number; className?: string }> | null {
  const pascalCase = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return (LucideIcons as any)[pascalCase] || null;
}

export function ResourceLoader({ icon, label, size = "md", className }: ResourceLoaderProps) {
  const s = sizeMap[size];
  const IconComponent = getLucideIcon(icon);

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", s.container, className)}>
      <div className="relative">
        <div
          className={cn(
            "rounded-full border-4 border-primary/10 border-t-primary animate-spin",
            s.spinner
          )}
        />
        {IconComponent && (
          <IconComponent
            size={s.icon}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/40"
          />
        )}
      </div>
      <p
        className={cn(
          "text-muted-foreground font-bold animate-pulse uppercase tracking-widest",
          s.text
        )}
      >
        Carregando {label}...
      </p>
    </div>
  );
}
