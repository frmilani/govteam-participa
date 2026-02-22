/**
 * 🎨 Vote Template System - Premium Theme Engine
 * 
 * A comprehensive theming system for creating distinct voting experiences.
 * Each theme has its own personality, animations, and visual identity.
 */

export type VoteTemplate = 'premium' | 'modern' | 'minimal' | 'genz' | 'cyberpunk' | 'organic' | 'acid' | 'swiss' | 'default';

/**
 * Animation Presets for different template moods
 */
export const ANIMATIONS: Record<string, any> = {
    // Premium - Elegant, subtle, sophisticated
    premium: {
        pageEnter: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        },
        cardEnter: {
            initial: { opacity: 0, y: 30, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }
        },
        elementStagger: 0.08,
        buttonHover: { scale: 1.02, transition: { duration: 0.3 } },
        buttonTap: { scale: 0.98 },
        iconFloat: {
            animate: { y: [0, -8, 0] },
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
    },
    // Modern - Playful, bouncy, energetic
    modern: {
        pageEnter: {
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.5, type: "spring", stiffness: 200, damping: 20 }
        },
        cardEnter: {
            initial: { opacity: 0, y: 60, rotateX: 15 },
            animate: { opacity: 1, y: 0, rotateX: 0 },
            transition: { duration: 0.6, type: "spring", stiffness: 150, damping: 15 }
        },
        elementStagger: 0.05,
        buttonHover: { scale: 1.05, rotate: 1, transition: { duration: 0.2 } },
        buttonTap: { scale: 0.95, rotate: -1 },
        iconFloat: {
            animate: { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] },
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
    },
    // Gen Z - Neo-Brutalist, Pop, Bold
    genz: {
        pageEnter: {
            initial: { opacity: 0, scale: 1.1 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.4, type: "spring", bounce: 0.4 }
        },
        cardEnter: {
            initial: { opacity: 0, x: -100, rotate: -5 },
            animate: { opacity: 1, x: 0, rotate: 0 },
            transition: { duration: 0.5, type: "spring", bounce: 0.5 }
        },
        elementStagger: 0.1,
        buttonHover: {
            translateY: 4,
            translateX: 4,
            boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)',
            transition: { duration: 0.1 }
        },
        buttonTap: {
            translateY: 4,
            translateX: 4,
            boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)',
        },
        iconFloat: {
            animate: { rotate: [0, -5, 5, -5, 0] },
            transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
        }
    },
    // Cyberpunk - Glitch, Fast, Tech
    cyberpunk: {
        pageEnter: {
            initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
            animate: { opacity: 1, clipPath: 'inset(0 0 0 0)' },
            transition: { duration: 0.3, ease: "circOut" }
        },
        cardEnter: {
            initial: { opacity: 0, x: -20, scaleX: 0.1 },
            animate: { opacity: 1, x: 0, scaleX: 1 },
            transition: { duration: 0.4, type: "spring", stiffness: 300, damping: 20 }
        },
        elementStagger: 0.02, // Ultra fast
        buttonHover: {
            skewX: -10,
            scale: 1.05,
            transition: { duration: 0.1 }
        },
        buttonTap: { skewX: 10, scale: 0.95 },
        iconFloat: {
            animate: { opacity: [1, 0.5, 1, 0.8, 1], x: [0, 2, -2, 0] },
            transition: { duration: 0.2, repeat: Infinity, repeatDelay: 3 }
        }
    },
    // Organic - Fluid, Slow, Natural
    organic: {
        pageEnter: {
            initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
            animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
            transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } // Apple-like ease
        },
        cardEnter: {
            initial: { opacity: 0, scale: 0.95, y: 40 },
            animate: { opacity: 1, scale: 1, y: 0 },
            transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
        },
        elementStagger: 0.15, // Slow reveal
        buttonHover: {
            scale: 1.05,
            y: -2,
            transition: { duration: 0.8, ease: "easeOut" }
        },
        buttonTap: { scale: 0.98 },
        iconFloat: {
            animate: { y: [0, -15, 0], rotate: [0, 5, -5, 0] },
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
    },
    // Minimal - Subtle, refined, understated
    minimal: {
        pageEnter: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.4 }
        },
        cardEnter: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.3 }
        },
        elementStagger: 0.03,
        buttonHover: { scale: 1.01, transition: { duration: 0.2 } },
        buttonTap: { scale: 0.99 },
        iconFloat: {
            animate: { opacity: [1, 0.7, 1] },
            transition: { duration: 2, repeat: Infinity }
        }
    },
    // Default - Balanced
    default: {
        pageEnter: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.5 }
        },
        cardEnter: {
            initial: { opacity: 0, y: 20, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            transition: { duration: 0.4 }
        },
        elementStagger: 0.06,
        buttonHover: { scale: 1.03, transition: { duration: 0.2 } },
        buttonTap: { scale: 0.97 },
        iconFloat: {
            animate: { y: [0, -5, 0] },
            transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        }
    },
    // Acid - Mechanical, precise, sharp
    acid: {
        pageEnter: {
            initial: { opacity: 0, scale: 0.98, filter: 'blur(4px)' },
            animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
            transition: { duration: 0.3, ease: "circOut" }
        },
        cardEnter: {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.4, type: "spring", stiffness: 200, damping: 20 }
        },
        elementStagger: {
            animate: { opacity: 1, x: 0 },
            transition: { staggerChildren: 0.05 }
        },
        buttonHover: {
            scale: 1.0,
            x: 4,
            transition: { duration: 0.1, ease: "linear" }
        },
        buttonTap: { scale: 0.95 },
        iconFloat: {
            animate: { rotate: [0, 90, 180, 270, 360] },
            transition: { duration: 20, repeat: Infinity, ease: "linear" }
        }
    },
    // Swiss - Solid, structural, grid-like
    swiss: {
        pageEnter: {
            initial: { opacity: 0, y: 50 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        },
        cardEnter: {
            initial: { opacity: 0, y: 50 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        },
        elementStagger: {
            animate: { opacity: 1, y: 0 },
            transition: { staggerChildren: 0.1 }
        },
        buttonHover: {
            scale: 1.02,
            y: -2,
            transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
        },
        buttonTap: { scale: 0.98 },
        iconFloat: {
            animate: { y: [0, -10, 0] },
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
    }
};


export interface TemplateConfig {
    // Metadata
    name: string;
    description: string;
    mood: 'elegant' | 'energetic' | 'clean' | 'balanced' | 'bold' | 'neon' | 'natural' | 'tech-acid' | 'swiss';

    // Layout
    layout: 'fullscreen' | 'card' | 'floating';

    // Page Background
    pageBg: string;
    pageGradient?: string;
    pageTexture?: 'paper' | 'noise' | 'none' | 'dots';

    // Overlay for modals
    overlayBg: string;
    overlayBlur: string;

    // Card/Content Container
    cardBg: string;
    cardBorder: string;
    cardShadow: string;
    cardRadius: string;
    cardGlow?: string;

    // Banner/Header Area
    bannerOverlay: string;
    bannerHeight: string;

    // Typography
    headingColor: string;
    headingFont?: string;
    textColor: string;
    mutedColor: string;
    accentColor?: string;

    // Inputs
    inputBg: string;
    inputBorder: string;
    inputFocusBorder: string;
    inputText: string;
    inputPlaceholder: string;
    inputRadius: string;
    inputShadow?: string;

    // Buttons
    buttonRadius: string;
    buttonShadow: string;
    buttonGlow?: string;
    secondaryButtonBg: string;
    secondaryButtonText: string;
    secondaryButtonBorder: string;

    // Progress bar
    progressBg: string;
    progressTrack: string;
    progressGlow?: string;

    // Icons
    iconContainerBg: string;
    iconContainerBorder?: string;

    // Badges/Pills
    badgeBg: string;
    badgeText: string;
    badgeBorder?: string;

    // Decorative
    decorativeElements?: boolean;
    particleEffect?: boolean;

    // States
    successColor: string;
    successBg: string;
    warningColor: string;
    warningBg: string;

    // Dark mode flag
    useDarkMode: boolean;
    useGlassmorphism: boolean;
}

/**
 * 🥇 PREMIUM THEME
 * 
 * Luxury invitation aesthetic. Think: wedding invitation, gala event, 
 * high-end award ceremony. Sepia tones, gold accents, elegant typography.
 */
const PREMIUM_THEME: TemplateConfig = {
    name: 'Premium',
    description: 'Elegância de convite de luxo com tons sépia e acentos dourados',
    mood: 'elegant',

    // Fullscreen immersive layout
    layout: 'fullscreen',

    // Rich dark background with subtle warmth
    pageBg: 'bg-[#0a0908]',
    pageGradient: 'bg-gradient-to-b from-[#1a1614] via-[#0a0908] to-[#0d0b09]',
    pageTexture: 'paper',

    // Elegant overlay with blur
    overlayBg: 'bg-black/70',
    overlayBlur: 'backdrop-blur-2xl',

    // Warm sepia paper card with luxury feel
    cardBg: 'bg-gradient-to-br from-[#faf6f0] via-[#f5efe6] to-[#efe8dc]',
    cardBorder: 'border border-[#d4c5b0]/50',
    cardShadow: 'shadow-[0_25px_80px_-12px_rgba(0,0,0,0.5),0_0_40px_-8px_rgba(180,155,110,0.15)]',
    cardRadius: 'rounded-[2.5rem]',
    cardGlow: 'ring-1 ring-[#c9a962]/10',

    // Banner with dramatic overlay
    bannerOverlay: 'bg-gradient-to-t from-[#0a0908] via-[#0a0908]/40 to-transparent',
    bannerHeight: 'h-64',

    // Warm, elegant typography
    headingColor: 'text-[#2c2520]',
    headingFont: 'font-serif',
    textColor: 'text-[#5a4d40]',
    mutedColor: 'text-[#998a75]',
    accentColor: '#c9a962',

    // Elegant inputs with warm tones
    inputBg: 'bg-[#faf6f0]/50',
    inputBorder: 'border border-[#d4c5b0]',
    inputFocusBorder: 'focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962]',
    inputText: 'text-[#2c2520]',
    inputPlaceholder: 'placeholder:text-[#ae9d85]',
    inputRadius: 'rounded-xl',
    inputShadow: 'shadow-inner shadow-[#d4c5b0]/10',

    // Gold gradient buttons
    buttonRadius: 'rounded-2xl',
    buttonShadow: 'shadow-[0_10px_30px_-5px_rgba(201,169,98,0.3)]',
    buttonGlow: 'hover:shadow-[0_15px_40px_-5px_rgba(201,169,98,0.4)]',
    secondaryButtonBg: 'bg-transparent',
    secondaryButtonText: 'text-[#2c2520]',
    secondaryButtonBorder: 'border border-[#d4c5b0]',

    // Warm progress
    progressBg: 'bg-[#f5efe6]',
    progressTrack: 'bg-[#e8dece]',
    progressGlow: 'shadow-[0_0_15px_rgba(201,169,98,0.2)]',

    // Decorative icon containers
    iconContainerBg: 'bg-gradient-to-br from-[#c9a962] to-[#bfa05e]',
    iconContainerBorder: 'ring-4 ring-[#f5efe6]',

    // Elegant badges
    badgeBg: 'bg-[#c9a962]/10',
    badgeText: 'text-[#8b7335]',
    badgeBorder: 'border border-[#c9a962]/20',

    // Decorative flourishes
    decorativeElements: true,
    particleEffect: false,

    // States
    successColor: '#059669',
    successBg: 'bg-emerald-50',
    warningColor: '#c9a962',
    warningBg: 'bg-amber-50/80',

    useDarkMode: false,
    useGlassmorphism: false,
};

/**
 * 🚀 MODERN THEME
 * 
 * Gen-Z vibes. Bold gradients, vibrant colors, playful animations.
 * Think: Spotify Wrapped, TikTok, Instagram Stories.
 */
const MODERN_THEME: TemplateConfig = {
    name: 'Moderno',
    description: 'Vibrante e dinâmico para a geração conectada',
    mood: 'energetic',

    // Fullscreen colorful experience
    layout: 'fullscreen',

    // Vibrant gradient background
    pageBg: 'bg-[#0f0f23]',
    pageGradient: 'bg-gradient-to-br from-[#1a1a3e] via-[#0f0f23] to-[#1e1e4a]',
    pageTexture: 'noise',

    // Glassmorphism overlay
    overlayBg: 'bg-gradient-to-br from-violet-900/60 via-fuchsia-900/50 to-cyan-900/60',
    overlayBlur: 'backdrop-blur-3xl',

    // Glass card with gradient border
    cardBg: 'bg-white/95',
    cardBorder: 'border border-white/20',
    cardShadow: 'shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)]',
    cardRadius: 'rounded-[2rem]',
    cardGlow: 'ring-1 ring-white/10',

    // Gradient banner
    bannerOverlay: 'bg-gradient-to-t from-[#0f0f23] via-transparent to-transparent',
    bannerHeight: 'h-64',

    // Bold, modern typography
    headingColor: 'text-slate-900',
    textColor: 'text-slate-600',
    mutedColor: 'text-slate-400',
    accentColor: '#8b5cf6',

    // Modern rounded inputs
    inputBg: 'bg-white',
    inputBorder: 'border-2 border-slate-100',
    inputFocusBorder: 'focus:border-violet-500 focus:ring-4 focus:ring-violet-100',
    inputText: 'text-slate-900',
    inputPlaceholder: 'placeholder:text-slate-400',
    inputRadius: 'rounded-2xl',
    inputShadow: 'shadow-sm',

    // Gradient buttons
    buttonRadius: 'rounded-2xl',
    buttonShadow: 'shadow-[0_20px_40px_-10px_rgba(139,92,246,0.4)]',
    buttonGlow: 'hover:shadow-[0_25px_50px_-10px_rgba(139,92,246,0.5)]',
    secondaryButtonBg: 'bg-slate-50',
    secondaryButtonText: 'text-slate-700',
    secondaryButtonBorder: 'border-0',

    // Colorful progress
    progressBg: 'bg-white',
    progressTrack: 'bg-gradient-to-r from-slate-100 to-slate-200',
    progressGlow: 'shadow-[0_0_25px_rgba(139,92,246,0.4)]',

    // Gradient icon containers
    iconContainerBg: 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500',
    iconContainerBorder: 'ring-4 ring-violet-100',

    // Colored badges
    badgeBg: 'bg-gradient-to-r from-violet-50 to-fuchsia-50',
    badgeText: 'text-violet-700',

    // Fun decorations
    decorativeElements: true,
    particleEffect: true,

    // States
    successColor: '#10b981',
    successBg: 'bg-emerald-50',
    warningColor: '#f59e0b',
    warningBg: 'bg-amber-100',

    useDarkMode: false,
    useGlassmorphism: true,
};

/**
 * ⚡ GEN Z / NEO-BRUTALIST THEME
 * 
 * High contrast, bold borders, hard shadows. 
 * Pop aesthetic, very popular with younger demographics.
 */
const GENZ_THEME: TemplateConfig = {
    name: 'Gen Z (Neo-Pop)',
    description: 'Audacioso, alto contraste e sombras marcadas',
    mood: 'bold',

    layout: 'fullscreen',

    // Vibrant Yellow/Pop bg
    pageBg: 'bg-[#FFDE59]',
    pageGradient: 'bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]',
    pageTexture: 'dots',

    // Hard overlay
    overlayBg: 'bg-black/80',
    overlayBlur: 'backdrop-blur-none',

    // Card with hard shadow
    cardBg: 'bg-white',
    cardBorder: 'border-[3px] border-black',
    cardShadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    cardRadius: 'rounded-xl',
    cardGlow: 'ring-0',

    // Header
    bannerOverlay: 'bg-black/10',
    bannerHeight: 'h-56',

    // Bold typography
    headingColor: 'text-black font-black italic',
    headingFont: 'font-sans',
    textColor: 'text-black font-bold',
    mutedColor: 'text-black/60 font-medium',
    accentColor: '#000000',

    // Bold inputs
    inputBg: 'bg-white',
    inputBorder: 'border-[3px] border-black',
    inputFocusBorder: 'focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all',
    inputText: 'text-black font-bold',
    inputPlaceholder: 'placeholder:text-black/40',
    inputRadius: 'rounded-lg',
    inputShadow: 'shadow-none',

    // Neo-brutalist buttons
    buttonRadius: 'rounded-lg',
    buttonShadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black',
    buttonGlow: '',
    secondaryButtonBg: 'bg-white',
    secondaryButtonText: 'text-black',
    secondaryButtonBorder: 'border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',

    // Hard progress
    progressBg: 'bg-white border-[3px] border-black',
    progressTrack: 'bg-black/10',
    progressGlow: '',

    // Icon containers
    iconContainerBg: 'bg-[#FF914D]', // Vibrant Orange
    iconContainerBorder: 'border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',

    // Badges
    badgeBg: 'bg-[#7ED957]', // Vibrant Green
    badgeText: 'text-black font-black',
    badgeBorder: 'border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',

    // No fancy particles, just bold elements
    decorativeElements: true,
    particleEffect: false,

    // High contrast states
    successColor: '#7ED957',
    successBg: 'bg-[#7ED957]/20 border-[2px] border-black',
    warningColor: '#FFDE59',
    warningBg: 'bg-[#FFDE59]/20 border-[2px] border-black',

    useDarkMode: false,
    useGlassmorphism: false,
};

/**
 * ✨ MINIMAL THEME
 * 
 * Clean, focused, distraction-free. Pure white space, subtle interactions.
 * Think: Apple, Notion, Linear.
 */
const MINIMAL_THEME: TemplateConfig = {
    name: 'Minimalista',
    description: 'Limpo e focado para máxima clareza',
    mood: 'clean',

    layout: 'fullscreen',

    pageBg: 'bg-[#fafafa]',
    pageGradient: 'bg-gradient-to-b from-white to-[#f5f5f5]',
    pageTexture: 'none',

    overlayBg: 'bg-black/50',
    overlayBlur: 'backdrop-blur-sm',

    cardBg: 'bg-white',
    cardBorder: 'border border-slate-200/80',
    cardShadow: 'shadow-xl shadow-slate-200/50',
    cardRadius: 'rounded-3xl',

    bannerOverlay: 'bg-gradient-to-t from-white/90 to-transparent',
    bannerHeight: 'h-48',

    headingColor: 'text-slate-900',
    textColor: 'text-slate-600',
    mutedColor: 'text-slate-400',

    inputBg: 'bg-white',
    inputBorder: 'border border-slate-200',
    inputFocusBorder: 'focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10',
    inputText: 'text-slate-900',
    inputPlaceholder: 'placeholder:text-slate-400',
    inputRadius: 'rounded-xl',

    buttonRadius: 'rounded-xl',
    buttonShadow: 'shadow-lg shadow-slate-200',
    secondaryButtonBg: 'bg-slate-50',
    secondaryButtonText: 'text-slate-700',
    secondaryButtonBorder: 'border-0',

    progressBg: 'bg-white',
    progressTrack: 'bg-slate-100',

    iconContainerBg: 'bg-slate-900',

    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',

    decorativeElements: false,
    particleEffect: false,

    successColor: '#10b981',
    successBg: 'bg-emerald-50',
    warningColor: '#f59e0b',
    warningBg: 'bg-amber-50',

    useDarkMode: false,
    useGlassmorphism: false,
};

/**
 * 📋 DEFAULT THEME
 * 
 * Balanced, professional, works for everyone.
 */
const DEFAULT_THEME: TemplateConfig = {
    name: 'Padrão',
    description: 'Equilibrado e profissional',
    mood: 'balanced',

    layout: 'card',

    pageBg: 'bg-slate-50',
    pageGradient: 'bg-gradient-to-br from-slate-50 to-slate-100',
    pageTexture: 'none',

    overlayBg: 'bg-slate-900/80',
    overlayBlur: 'backdrop-blur-sm',

    cardBg: 'bg-white',
    cardBorder: 'border border-slate-100',
    cardShadow: 'shadow-2xl shadow-slate-200',
    cardRadius: 'rounded-[2.5rem]',

    bannerOverlay: 'bg-gradient-to-t from-black/40 to-transparent',
    bannerHeight: 'h-56',

    headingColor: 'text-slate-900',
    textColor: 'text-slate-600',
    mutedColor: 'text-slate-400',

    inputBg: 'bg-white',
    inputBorder: 'border border-slate-200',
    inputFocusBorder: 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100',
    inputText: 'text-slate-900',
    inputPlaceholder: 'placeholder:text-slate-400',
    inputRadius: 'rounded-xl',

    buttonRadius: 'rounded-2xl',
    buttonShadow: 'shadow-xl shadow-indigo-100',
    secondaryButtonBg: 'bg-slate-50',
    secondaryButtonText: 'text-slate-700',
    secondaryButtonBorder: 'border border-slate-200',

    progressBg: 'bg-white',
    progressTrack: 'bg-slate-100',

    iconContainerBg: 'bg-indigo-100',

    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',

    successColor: '#10b981',
    successBg: 'bg-emerald-100',
    warningColor: '#f59e0b',
    warningBg: 'bg-amber-100',

    useDarkMode: false,
    useGlassmorphism: false,
};

/**
 * 🌃 CYBERPUNK THEME (Neon / Futurista)
 * 
 * Inspired by Slush. Dark, high contrast, neon accents, glitchy feel.
 */
const CYBERPUNK_THEME: TemplateConfig = {
    name: 'Cyberpunk (Neon)',
    description: 'Futurista, dark mode com acentos neon e grade',
    mood: 'neon',

    layout: 'fullscreen',

    // Deep black with grid
    pageBg: 'bg-black',
    pageGradient: 'bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] [background-size:24px_24px]',
    pageTexture: 'none',

    // Tech overlay
    overlayBg: 'bg-black/90',
    overlayBlur: 'backdrop-blur-sm',

    // Sharp, tech card
    cardBg: 'bg-zinc-900/90',
    cardBorder: 'border border-cyan-500/50',
    cardShadow: 'shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]',
    cardRadius: 'rounded-none',
    cardGlow: 'ring-1 ring-cyan-500/20',

    bannerOverlay: 'bg-gradient-to-t from-black via-black/50 to-transparent',
    bannerHeight: 'h-64',

    // Tech typography
    headingColor: 'text-white',
    headingFont: 'font-mono',
    textColor: 'text-zinc-300',
    mutedColor: 'text-zinc-500',
    accentColor: '#06b6d4', // Cyan

    // Terminal inputs
    inputBg: 'bg-black',
    inputBorder: 'border border-zinc-700',
    inputFocusBorder: 'focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500',
    inputText: 'text-cyan-50 font-mono',
    inputPlaceholder: 'placeholder:text-zinc-700',
    inputRadius: 'rounded-none',
    inputShadow: 'shadow-none',

    // Neon buttons
    buttonRadius: 'rounded-none',
    buttonShadow: 'shadow-[4px_4px_0px_0px_#06b6d4]',
    buttonGlow: 'hover:shadow-[4px_4px_0px_0px_#d946ef] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all',
    secondaryButtonBg: 'bg-transparent',
    secondaryButtonText: 'text-cyan-500',
    secondaryButtonBorder: 'border border-cyan-500',

    // Tech progress
    progressBg: 'bg-zinc-900',
    progressTrack: 'bg-zinc-800',
    progressGlow: 'shadow-[0_0_10px_rgba(6,182,212,0.5)]',

    iconContainerBg: 'bg-zinc-900',
    iconContainerBorder: 'border border-cyan-500',

    badgeBg: 'bg-cyan-950/30',
    badgeText: 'text-cyan-400 font-mono',
    badgeBorder: 'border border-cyan-500/30',

    decorativeElements: true,
    particleEffect: true, // Maybe distinct particles?

    successColor: '#00ff9d', // Cyber green
    successBg: 'bg-[#00ff9d]/10 border border-[#00ff9d]/30',
    warningColor: '#facc15',
    warningBg: 'bg-yellow-900/20 border border-yellow-500/30',

    useDarkMode: true,
    useGlassmorphism: false,
};

/**
 * 🍃 ORGANIC THEME (Natural / Vands)
 * 
 * Inspired by Vands Lab. Soft, fluid, earth tones, extreme roundedness.
 */
const ORGANIC_THEME: TemplateConfig = {
    name: 'Orgânico (Natural)',
    description: 'Suave, fluido e tons terrosos',
    mood: 'natural',

    layout: 'fullscreen',

    // Soft Sage/Beige
    pageBg: 'bg-[#E6E8E6]',
    pageGradient: 'bg-gradient-to-br from-[#E6E8E6] via-[#f2efe9] to-[#E6E8E6]',
    pageTexture: 'noise',

    overlayBg: 'bg-[#2c332e]/40',
    overlayBlur: 'backdrop-blur-md',

    // Soft organic card
    cardBg: 'bg-[#f2efe9]/80',
    cardBorder: 'border border-white/40',
    cardShadow: 'shadow-[0_20px_40px_-10px_rgba(44,51,46,0.08)]',
    cardRadius: 'rounded-[3rem]', // Very round
    cardGlow: 'ring-1 ring-white/30',

    bannerOverlay: 'bg-gradient-to-t from-[#f2efe9] via-transparent to-transparent',
    bannerHeight: 'h-80',

    // Elegant sans
    headingColor: 'text-[#2c332e]',
    headingFont: 'font-sans',
    textColor: 'text-[#4A5D4F]',
    mutedColor: 'text-[#8fa394]',
    accentColor: '#4A5D4F',

    // Soft inputs
    inputBg: 'bg-white/60',
    inputBorder: 'border-0',
    inputFocusBorder: 'focus:ring-2 focus:ring-[#acc196]/50',
    inputText: 'text-[#2c332e]',
    inputPlaceholder: 'placeholder:text-[#8fa394]',
    inputRadius: 'rounded-2xl',
    inputShadow: 'shadow-inner shadow-[#acc196]/10',

    // Soft buttons
    buttonRadius: 'rounded-full',
    buttonShadow: 'shadow-[0_10px_20px_-5px_rgba(74,93,79,0.2)]',
    buttonGlow: 'hover:scale-[1.02] transition-transform duration-500 ease-out',
    secondaryButtonBg: 'bg-[#e3e6e3]',
    secondaryButtonText: 'text-[#4A5D4F]',
    secondaryButtonBorder: 'border-0',

    progressBg: 'bg-[#e3e6e3]',
    progressTrack: 'bg-[#d1d6d1]',

    iconContainerBg: 'bg-[#acc196]',

    badgeBg: 'bg-[#acc196]/20',
    badgeText: 'text-[#4A5D4F]',

    decorativeElements: true,
    particleEffect: false,

    successColor: '#4A5D4F',
    successBg: 'bg-[#acc196]/20',
    warningColor: '#d97706',
    warningBg: 'bg-amber-100/50',

    useDarkMode: false,
    useGlassmorphism: true,
};

export const ACID_THEME: TemplateConfig = {
    name: 'Acid Tech',
    description: 'Estilo Slush: Prata, Verde Ácido e Brutalismo Tecnológico.',
    mood: 'tech-acid',
    layout: 'fullscreen',

    // Page
    pageBg: 'bg-[#E0E0E0]',
    pageGradient: 'bg-[linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] [background-size:20px_20px]',
    pageTexture: 'noise',

    // Overlay
    overlayBg: 'bg-black/80',
    overlayBlur: 'backdrop-blur-sm',

    // Card
    cardBg: 'bg-[#F2F2F2]',
    cardBorder: 'border border-black',
    cardShadow: 'shadow-none',
    cardRadius: 'rounded-none',
    cardGlow: 'ring-1 ring-[#CCFF00]',

    // Banner
    bannerOverlay: 'bg-gradient-to-t from-[#E0E0E0] via-transparent to-[#CCFF00]/10',
    bannerHeight: 'h-64',

    // Typography
    headingColor: 'text-black',
    headingFont: 'font-sans uppercase tracking-tighter',
    textColor: 'text-black',
    mutedColor: 'text-gray-600',
    accentColor: '#CCFF00',

    // Inputs
    inputBg: 'bg-white',
    inputBorder: 'border border-black',
    inputFocusBorder: 'focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]',
    inputText: 'text-black',
    inputPlaceholder: 'placeholder:text-gray-500',
    inputRadius: 'rounded-none',
    inputShadow: 'shadow-none',

    // Buttons
    buttonRadius: 'rounded-none',
    buttonShadow: 'shadow-none',
    buttonGlow: 'hover:bg-[#CCFF00] hover:text-black transition-colors duration-100',
    secondaryButtonBg: 'bg-transparent',
    secondaryButtonText: 'text-black',
    secondaryButtonBorder: 'border border-black',

    // Progress
    progressBg: 'bg-gray-200',
    progressTrack: 'bg-[#CCFF00]',

    // Icons
    iconContainerBg: 'bg-black',
    iconContainerBorder: 'border border-[#CCFF00]',

    // Badges
    badgeBg: 'bg-[#CCFF00]/20',
    badgeText: 'text-black',
    badgeBorder: 'border border-[#CCFF00]',

    decorativeElements: true,
    particleEffect: false,

    successColor: '#CCFF00',
    successBg: 'bg-[#CCFF00]/20 border border-[#CCFF00]/50',
    warningColor: '#FF6600',
    warningBg: 'bg-[#FF6600]/20 border border-[#FF6600]/50',

    useDarkMode: false,
    useGlassmorphism: false,
};

export const SWISS_THEME: TemplateConfig = {
    name: 'Suíço Vanguard',
    description: 'Design Icônico: Precisão, Grade e o Vermelho Revolucionário.',
    mood: 'swiss',
    layout: 'fullscreen',

    // High-Contrast Red & White Page
    pageBg: 'bg-[#ffffff]',
    pageGradient: 'bg-[radial-gradient(#ff000022_2px,transparent_2px)] [background-size:32px_32px]',
    pageTexture: 'none',

    // Sharp Overlay
    overlayBg: 'bg-black/95',
    overlayBlur: 'backdrop-blur-none',

    // Post-Modern Swiss Card
    cardBg: 'bg-white',
    cardBorder: 'border-[3px] border-black',
    cardShadow: 'shadow-[16px_16px_0px_0px_#ff0000]',
    cardRadius: 'rounded-none',
    cardGlow: 'ring-1 ring-black/5',

    // Dramatic Header
    bannerOverlay: 'bg-gradient-to-t from-white via-transparent to-[#ff0000]/10',
    bannerHeight: 'h-80',

    // Bold Helvetica-style Typography
    headingColor: 'text-black',
    headingFont: 'font-sans font-black uppercase italic tracking-tighter',
    textColor: 'text-black font-bold',
    mutedColor: 'text-gray-500',
    accentColor: '#ff0000',

    // Structural Inputs
    inputBg: 'bg-white',
    inputBorder: 'border-[3px] border-black',
    inputFocusBorder: 'focus:shadow-[4px_4px_0px_0px_#ff0000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all',
    inputText: 'text-black font-bold',
    inputPlaceholder: 'placeholder:text-gray-400',
    inputRadius: 'rounded-none',
    inputShadow: 'shadow-none',

    // Brutal Buttons
    buttonRadius: 'rounded-none',
    buttonShadow: 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
    buttonGlow: 'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#ff0000] transition-all',
    secondaryButtonBg: 'bg-white',
    secondaryButtonText: 'text-black',
    secondaryButtonBorder: 'border-[3px] border-black',

    // Progress
    progressBg: 'bg-black/5',
    progressTrack: 'bg-[#ff0000]',

    // Icons
    iconContainerBg: 'bg-[#ff0000]',
    iconContainerBorder: 'border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',

    // Badges
    badgeBg: 'bg-[#ff0000]',
    badgeText: 'text-white font-black',
    badgeBorder: 'border-[2px] border-black',

    decorativeElements: true,
    particleEffect: false,

    successColor: '#10b981',
    successBg: 'bg-emerald-50 border-[2px] border-black',
    warningColor: '#ff0000',
    warningBg: 'bg-red-50 border-[2px] border-black',

    useDarkMode: false,
    useGlassmorphism: false,
};

export const TEMPLATES: Record<VoteTemplate, TemplateConfig> = {
    premium: PREMIUM_THEME,
    modern: MODERN_THEME,
    genz: GENZ_THEME,
    minimal: MINIMAL_THEME,
    default: DEFAULT_THEME,
    cyberpunk: CYBERPUNK_THEME,
    organic: ORGANIC_THEME,
    acid: ACID_THEME,
    swiss: SWISS_THEME,
};

/**
 * Type guard to check if a string is a valid template key
 */
export const isVoteTemplate = (key: string): key is VoteTemplate => {
    return key in TEMPLATES;
};

/**
 * Get template config by name, with fallback to default
 */
export function getTemplateConfig(template?: string): TemplateConfig {
    if (template && template in TEMPLATES) {
        return TEMPLATES[template as VoteTemplate];
    }
    return TEMPLATES.default;
}

/**
 * Get animation presets for a template
 */
export function getAnimations(template?: string) {
    if (template && template in ANIMATIONS) {
        return ANIMATIONS[template as VoteTemplate];
    }
    return ANIMATIONS.default;
}

/**
 * Generate button styles based on primary color and template
 */
export function getButtonStyles(primaryColor: string, template: TemplateConfig) {
    const isGold = template.mood === 'elegant';

    return {
        primary: {
            background: isGold
                ? `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)`
                : primaryColor,
            className: `${template.buttonRadius} ${template.buttonShadow} font-bold uppercase tracking-widest transition-all duration-300`,
            hoverEffect: template.buttonGlow || '',
        },
        secondary: {
            className: `${template.buttonRadius} ${template.secondaryButtonBg} ${template.secondaryButtonText} ${template.secondaryButtonBorder} font-bold uppercase tracking-widest transition-all duration-300`,
        }
    };
}

/**
 * Utility to adjust color brightness
 */
function adjustColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

/**
 * Get CSS custom properties for a theme
 */
export function getThemeCSSVariables(template: TemplateConfig, primaryColor: string) {
    const extractHex = (className: string) => {
        const match = className.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/);
        return match ? `#${match[1]}` : null;
    };

    const vars: Record<string, string> = {
        '--theme-primary': primaryColor,
        '--theme-accent': template.accentColor || primaryColor,
        '--theme-success': template.successColor,
        '--theme-warning': template.warningColor,
        '--primary': primaryColor,
        '--ring': primaryColor,
    };

    // Extract background from pageBg
    const bgHex = extractHex(template.pageBg);
    if (bgHex) {
        vars['--background'] = bgHex;
        vars['--color-background'] = bgHex;
    }

    // Extract foreground from textColor
    const fgHex = extractHex(template.textColor);
    if (fgHex) {
        vars['--foreground'] = fgHex;
        vars['--color-foreground'] = fgHex;
    }

    // Extract card background
    const cardHex = extractHex(template.cardBg);
    if (cardHex) {
        vars['--card'] = cardHex;
        vars['--color-card'] = cardHex;
    }

    // Extract border
    const borderHex = extractHex(template.cardBorder);
    if (borderHex) {
        vars['--border'] = borderHex;
        vars['--color-border'] = borderHex;
    }

    // Extract muted
    const mutedHex = extractHex(template.mutedColor);
    if (mutedHex) {
        vars['--muted-foreground'] = mutedHex;
        vars['--color-muted-foreground'] = mutedHex;
    }

    return vars;
}
