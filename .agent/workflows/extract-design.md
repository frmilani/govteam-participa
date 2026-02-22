---
description: Extract design system and component specs from AI Studio wireframes
---

# /extract-design Workflow

## Overview
Reads wireframe code from AI Studio (or similar) and creates design system files.
This ensures all development follows the APPROVED visual design.

## Input Location

| Input | Path |
|-------|------|
| Wireframes | `.context/inputs/wireframes/` |

## Output Location

| Output | Path |
|--------|------|
| Design Tokens | `.context/design/design_tokens.json` |
| Component Specs | `.context/design/components.spec.md` |
| Screen Map | `.context/design/screen_map.md` |

## Prerequisites
- Wireframe folder must exist at `.context/inputs/wireframes/`
- Must contain React/TSX files with Tailwind classes

## Steps

### 1. Validate Input

Check `.context/inputs/wireframes/` exists and contains:
- `App.tsx` or `App.jsx`
- `components/` folder with `.tsx` files

If missing:
```
❌ Wireframes not found at .context/inputs/wireframes/
Please add your AI Studio export and try again.
```

### 2. Locate Component Files

Search for component files:
- `*.tsx` files in `components/` folder
- Main `App.tsx` for navigation structure

### 3. Extract Color Palette

Scan for Tailwind color classes and extract unique values:
- Background colors: `bg-*`
- Text colors: `text-*`
- Border colors: `border-*`
- Gradient definitions: `from-* to-* via-*`

Group into semantic categories:
- `primary`: Main brand colors
- `secondary`: Supporting colors
- `accent`: Highlight colors
- `neutral`: Grays and backgrounds
- `semantic`: Success, warning, error, info

### 4. Extract Typography

Scan for text styling patterns:
- Font sizes: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, etc.
- Font weights: `font-medium`, `font-semibold`, `font-bold`
- Line heights: `leading-*`
- Letter spacing: `tracking-*`

Map to usage contexts:
- `heading-1` through `heading-4`
- `body`, `body-sm`
- `caption`, `label`

### 5. Extract Spacing System

Identify consistent spacing patterns:
- Padding: `p-*`, `px-*`, `py-*`
- Margin: `m-*`, `mx-*`, `my-*`
- Gap: `gap-*`
- Border radius: `rounded-*`

### 6. Extract Component Inventory

List all distinct UI components found:
- Navigation (Sidebar, Header, NavButton)
- Cards (FlowCard, StatCard, DocumentCard)
- Forms (Input, Select, Button variants)
- Feedback (Modal, Toast, Loading states)
- Layout (Grid patterns, Container widths)

For each component, document:
- Name
- Variants (if any)
- Key Tailwind classes
- Interactive states (hover, focus, active)

### 7. Extract Screen Flow

From App.tsx or routing, map navigation structure:
- Available screens
- Transitions between screens
- Sidebar navigation items

### 8. Generate design_tokens.json

Create `.context/design/design_tokens.json`:

```json
{
  "meta": {
    "source": ".context/inputs/wireframes",
    "extractedAt": "YYYY-MM-DD",
    "version": "1.0"
  },
  "colors": {
    "primary": {
      "50": "#...",
      "500": "#...",
      "600": "#..."
    }
  },
  "typography": {
    "heading1": "text-3xl font-bold text-slate-900",
    "heading2": "text-2xl font-bold text-slate-900",
    "body": "text-base text-slate-600"
  },
  "spacing": {
    "container": "max-w-7xl mx-auto",
    "section": "mb-8",
    "card-padding": "p-6"
  },
  "borders": {
    "default": "border border-slate-200",
    "hover": "border-blue-300",
    "radius": {
      "sm": "rounded-lg",
      "md": "rounded-xl",
      "lg": "rounded-2xl"
    }
  },
  "shadows": {
    "sm": "shadow-sm",
    "md": "shadow-md",
    "lg": "shadow-lg"
  }
}
```

### 9. Generate components.spec.md

Create `.context/design/components.spec.md`:

```markdown
# Component Specification

## NavButton
**Source:** Wireframes.tsx line 343
**Usage:** Sidebar navigation items
**Classes:** `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg`
**States:**
- Default: `text-slate-600 hover:bg-white/60`
- Active: `bg-white text-blue-700 shadow-sm`
```

### 10. Generate screen_map.md

Create `.context/design/screen_map.md`:

```markdown
# Screen Map

## Screens
1. **dashboard** - Flow library grid
2. **input** - Form for flow parameters
3. **processing** - Agent execution visualization
4. **result** - Generated document preview

## Navigation
- Sidebar links to: dashboard, history, documents
- Flow: dashboard → input → processing → result
```

### 11. Update Design Manifest

Update `.context/design/README.md`:
- Change status from PENDING to HYDRATED
- Update item count
- Add extraction date

### 12. Commit
// turbo
```bash
git add .context/design/
git commit -m "docs: Extract design system from wireframes"
```

### 13. Report

```
✅ Design System Extracted

📁 Source: .context/inputs/wireframes/
📄 Files created:
   - .context/design/design_tokens.json
   - .context/design/components.spec.md
   - .context/design/screen_map.md

🎨 Extracted:
   - Colors: X palettes
   - Components: Y documented
   - Screens: Z mapped

🚀 Next Step: /hydrate-agents or /init-project
```
