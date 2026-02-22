'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { getTemplateConfig, getAnimations, getButtonStyles, TemplateConfig, getThemeCSSVariables } from '@/lib/vote-templates';

interface VoteTemplateContextValue {
    // Template configuration
    template: TemplateConfig;
    animations: ReturnType<typeof getAnimations>;

    // Visual config from enquete
    primaryColor: string;
    logoUrl?: string;
    bannerUrl?: string;

    // Computed class helpers
    classes: {
        // Page & Layout
        pageWrapper: string;
        overlay: string;

        // Cards
        card: string;
        cardInner: string;

        // Banner
        banner: string;
        bannerOverlay: string;

        // Typography
        heading: string;
        text: string;
        muted: string;

        // Inputs
        input: string;
        inputLabel: string;

        // Progress
        progressWrapper: string;
        progressTrack: string;

        // Icons
        iconContainer: string;

        // Badges
        badge: string;
        successBadge: string;
    };

    // Button style generator
    buttonStyles: ReturnType<typeof getButtonStyles>;

    // CSS Variables
    cssVars: Record<string, string>;

    // Helpers
    isFullscreen: boolean;
    isDarkMode: boolean;
    hasGlassmorphism: boolean;
}

const VoteTemplateContext = createContext<VoteTemplateContextValue | null>(null);

interface VoteTemplateProviderProps {
    children: React.ReactNode;
    templateName?: string;
    primaryColor?: string;
    logoUrl?: string;
    bannerUrl?: string;
}

export function VoteTemplateProvider({
    children,
    templateName = 'default',
    primaryColor = '#4F46E5',
    logoUrl,
    bannerUrl,
}: VoteTemplateProviderProps) {
    const value = useMemo(() => {
        const template = getTemplateConfig(templateName);
        const animations = getAnimations(templateName);
        const buttonStyles = getButtonStyles(primaryColor, template);
        const cssVars = getThemeCSSVariables(template, primaryColor);

        return {
            template,
            animations,
            primaryColor,
            logoUrl,
            bannerUrl,

            classes: {
                // Page wrapper with gradient and texture
                pageWrapper: `min-h-screen ${template.pageBg} ${template.pageGradient || ''}`,

                // Overlay for fullscreen modals
                overlay: `fixed inset-0 z-[100] ${template.overlayBg} ${template.overlayBlur} flex items-center justify-center`,

                // Card container
                card: `${template.cardBg} ${template.cardBorder} ${template.cardShadow} ${template.cardRadius} ${template.cardGlow || ''} overflow-hidden`,
                cardInner: template.useDarkMode ? 'bg-white/5' : '',

                // Banner
                banner: `${template.bannerHeight} w-full relative overflow-hidden`,
                bannerOverlay: `absolute inset-0 ${template.bannerOverlay}`,

                // Typography
                heading: `${template.headingColor} ${template.headingFont || ''}`,
                text: template.textColor,
                muted: template.mutedColor,

                // Inputs
                input: `w-full h-14 px-5 ${template.inputBg} ${template.inputBorder} ${template.inputFocusBorder} ${template.inputText} ${template.inputPlaceholder} ${template.inputRadius} ${template.inputShadow || ''} font-medium transition-all duration-200 outline-none`,
                inputLabel: `text-xs font-bold uppercase tracking-widest mb-2 block ${template.mutedColor}`,

                // Progress
                progressWrapper: `${template.progressBg} ${template.progressGlow || ''}`,
                progressTrack: template.progressTrack,

                // Icons
                iconContainer: `${template.iconContainerBg} ${template.iconContainerBorder || ''} rounded-3xl flex items-center justify-center`,

                // Badges
                badge: `${template.badgeBg} ${template.badgeText} ${template.badgeBorder || ''} text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full`,
                successBadge: `${template.successBg} text-emerald-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full`,
            },

            buttonStyles,
            cssVars,

            isFullscreen: template.layout === 'fullscreen',
            isDarkMode: template.useDarkMode,
            hasGlassmorphism: template.useGlassmorphism,
        };
    }, [templateName, primaryColor, logoUrl, bannerUrl]);

    return (
        <VoteTemplateContext.Provider value={value}>
            <div style={value.cssVars as React.CSSProperties}>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    ${value.template.pageTexture === 'paper' ? `
                        .${value.template.cardBg.split(' ')[0]} {
                            position: relative;
                        }
                        .${value.template.cardBg.split(' ')[0]}::before {
                            content: "";
                            position: absolute;
                            inset: 0;
                            opacity: 0.4;
                            pointer-events: none;
                            background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
                            mix-blend-mode: multiply;
                        }
                    ` : ''}
                    ${value.template.pageTexture === 'noise' ? `
                        .${value.template.pageBg} {
                            position: relative;
                        }
                        .${value.template.pageBg}::before {
                            content: "";
                            position: absolute;
                            inset: 0;
                            opacity: 0.05;
                            pointer-events: none;
                            background-image: url("https://www.transparenttextures.com/patterns/stardust.png");
                        }
                    ` : ''}
                    ${value.template.pageTexture === 'dots' ? `
                        .${value.template.pageBg.split(' ')[0]} {
                            background-image: radial-gradient(#000000 1px, transparent 1px);
                            background-size: 20px 20px;
                            opacity: 1;
                        }
                    ` : ''}
                `}} />
                {children}
            </div>
        </VoteTemplateContext.Provider>
    );
}

export function useVoteTemplate() {
    const context = useContext(VoteTemplateContext);
    if (!context) {
        throw new Error('useVoteTemplate must be used within a VoteTemplateProvider');
    }
    return context;
}

/**
 * Hook for components that may be outside the provider
 * Returns default values if not in provider
 */
export function useVoteTemplateOptional() {
    const context = useContext(VoteTemplateContext);
    if (!context) {
        const template = getTemplateConfig('default');
        const animations = getAnimations('default');
        const primaryColor = '#4F46E5';
        const buttonStyles = getButtonStyles(primaryColor, template);

        return {
            template,
            animations,
            primaryColor,
            classes: {
                pageWrapper: `min-h-screen ${template.pageBg}`,
                overlay: 'fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm',
                card: `${template.cardBg} ${template.cardRadius} ${template.cardShadow}`,
                cardInner: '',
                banner: `${template.bannerHeight} w-full`,
                bannerOverlay: template.bannerOverlay,
                heading: template.headingColor,
                text: template.textColor,
                muted: template.mutedColor,
                input: `w-full h-14 px-5 ${template.inputBg} ${template.inputRadius}`,
                inputLabel: `text-xs font-bold uppercase tracking-widest mb-2 block ${template.mutedColor}`,
                progressWrapper: template.progressBg,
                progressTrack: template.progressTrack,
                iconContainer: template.iconContainerBg,
                badge: `${template.badgeBg} ${template.badgeText}`,
                successBadge: 'bg-emerald-100 text-emerald-600',
            },
            buttonStyles,
            cssVars: {},
            isFullscreen: false,
            isDarkMode: false,
            hasGlassmorphism: false,
        };
    }
    return context;
}
