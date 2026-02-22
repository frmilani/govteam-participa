"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    badgeText?: string;
    badgeIcon?: React.ElementType; // Optional icon for the badge
    breadcrumb?: string;
    children?: React.ReactNode; // For action buttons
    className?: string;
}

export function PageHeader({
    title,
    description,
    badgeText,
    badgeIcon: BadgeIcon,
    breadcrumb,
    children,
    className,
}: PageHeaderProps) {
    // Extract highlighted part of the title if wrapped in specific markers, 
    // but for now let's just assume the user might pass JSX or we style the whole thing.
    // Reviewing strict requirement: "Hub vai ser o padrão... Glossy Overlay"

    return (
        <div className={cn("relative overflow-hidden bg-card/50 backdrop-blur-xl rounded-xl border border-border p-8 shadow-2xl shadow-primary/5 group/header", className)}>
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    {/* Badge / Breadcrumb Area */}
                    {(badgeText || breadcrumb) && (
                        <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.3em] bg-primary/5 px-3 py-1 rounded-md border border-primary/10 w-fit">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            {badgeText || breadcrumb}
                        </div>
                    )}

                    <h1 className="text-3xl font-black text-foreground tracking-tight">
                        {title}
                    </h1>

                    {description && (
                        <div className="text-muted-foreground font-medium text-sm max-w-lg leading-relaxed">
                            {description}
                        </div>
                    )}
                </div>

                {/* Action Buttons Area */}
                {children && (
                    <div className="flex items-center gap-3">
                        {children}
                    </div>
                )}
            </div>

            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px] pointer-events-none group-hover/header:bg-primary/10 transition-colors duration-1000" />
        </div>
    );
}
