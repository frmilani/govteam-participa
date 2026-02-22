"use client";

import React, { useRef, useId, useEffect } from 'react';

export interface ThemeConfig {
    cssVariables?: Record<string, string>;
    radius?: string;
}

interface ThemeProviderProps {
    themeConfig?: ThemeConfig;
    children: React.ReactNode;
}

/**
 * ThemeProvider local — replica do componente do form-renderer.
 * Injeta CSS variables num scope isolado via <style> tag dinâmica.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ themeConfig, children }) => {
    const scopeRef = useRef<HTMLDivElement>(null);
    const uniqueId = useId();
    const styleId = `form-theme-${uniqueId.replace(/:/g, '-')}`;

    useEffect(() => {
        if (!themeConfig || !themeConfig.cssVariables || !scopeRef.current) {
            return;
        }

        const scopeSelector = `[data-form-theme-scope="${styleId}"]`;

        const cssVariables = Object.entries(themeConfig.cssVariables)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n    ');

        const radius = themeConfig.radius || '0.5rem';

        const scopedCss = `
${scopeSelector} {
    ${cssVariables}
    --radius: ${radius};
}`;

        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }

        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.innerHTML = scopedCss;
        document.head.appendChild(styleElement);

        return () => {
            const style = document.getElementById(styleId);
            if (style) {
                style.remove();
            }
        };
    }, [themeConfig, styleId]);

    return (
        <div
            ref={scopeRef}
            data-form-theme-scope={styleId}
            style={{ display: 'contents' }}
        >
            {children}
        </div>
    );
};
