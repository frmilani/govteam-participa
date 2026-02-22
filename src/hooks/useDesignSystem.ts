"use client";

import { useEffect, useState } from "react";

interface DesignSystem {
    id: string;
    name?: string;
    version?: string;
    colors: Record<string, string>;
    spacing?: {
        radius?: string;
    };
    isPublic?: boolean;
}

export function useDesignSystem() {
    const [theme, setTheme] = useState<DesignSystem | null>(null);
    const [availableThemes, setAvailableThemes] = useState<DesignSystem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const applyTheme = (config: DesignSystem) => {
        // Separate keys into Universal (Brand) and Light-Only (Surface)
        // This ensures Dark Mode defaults (from Spoke's globals.css) are preserved for surfaces,
        // while allowing Semantic Brand colors to override both modes.
        const universalKeys = ['primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'accent', 'accent-foreground', 'ring', 'radius'];

        let cssUniversal = ":root {\n";
        let cssLightOnly = ":root:not(.dark) {\n"; // Only applies when .dark class is NOT present

        if (config.colors) {
            Object.entries(config.colors).forEach(([k, v]) => {
                if (universalKeys.includes(k) || k.startsWith('chart')) {
                    cssUniversal += `  --${k}: ${v};\n`;
                } else {
                    // Backgrounds, cards, popovers, borders, inputs -> Light Mode only
                    // In Dark Mode, we fall back to the Spoke's native dark theme
                    cssLightOnly += `  --${k}: ${v};\n`;
                }
            });
        }

        if (config.spacing?.radius) {
            cssUniversal += `  --radius: ${config.spacing.radius};\n`;
        }

        cssUniversal += "}\n";
        cssLightOnly += "}\n";

        // Inject into <style> tag
        const styleId = "dynamic-theme-styles";
        let styleEl = document.getElementById(styleId);

        if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }

        styleEl.textContent = cssUniversal + cssLightOnly;
        setTheme(config);
    };

    const fetchSystem = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch from local Spoke API (proxy), which communicates with Hub securely
            const res = await fetch(`/api/hub/theme`);

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to fetch theme: ${res.statusText}`);
            }

            const data = await res.json();

            // Handle array response
            const themes = Array.isArray(data) ? data : [data].filter(Boolean);
            setAvailableThemes(themes);

            // Default: Apply the first available theme if none selected
            if (themes.length > 0) {
                applyTheme(themes[0]);
            }
        } catch (e: any) {
            console.error("Failed to load design system", e);
            setError(e.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchSystem();
    }, []);

    return {
        theme,
        availableThemes,
        loading,
        error,
        refresh: fetchSystem,
        applyTheme
    };
}
