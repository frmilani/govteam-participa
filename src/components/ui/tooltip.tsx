"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
}

export const Tooltip = ({ children, delayDuration }: { children: React.ReactNode, delayDuration?: number }) => {
    return <div className="relative group">{children}</div>
}

export const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
    return <div className="cursor-pointer">{children}</div>
}

export const TooltipContent = ({ children, className, side }: { children: React.ReactNode, className?: string, side?: string }) => {
    return (
        <div className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-lg bg-slate-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl",
            className
        )}>
            {children}
        </div>
    )
}
