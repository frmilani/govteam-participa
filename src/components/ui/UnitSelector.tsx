'use client'

import { useActiveUnit } from '@/contexts/UnitContext'
import { MapPin, ChevronDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

export function UnitSelector() {
  const { units, hasGlobalAccess, activeUnitId, activeUnit, setActiveUnitId, isMultiUnit } = useActiveUnit()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isMultiUnit) return null

  const label = activeUnit
    ? (activeUnit.unitAcronym || activeUnit.unitName)
    : 'Global'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1 border transition-all text-left",
          activeUnit
            ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
            : "border-border/50 bg-muted/30 hover:bg-muted/50"
        )}
      >
        {activeUnit
          ? <MapPin size={12} className="text-primary shrink-0" />
          : <Globe size={12} className="text-muted-foreground shrink-0" />
        }
        <span className={cn(
          "text-[10px] font-semibold uppercase tracking-wider max-w-[120px] truncate",
          activeUnit ? "text-primary" : "text-muted-foreground"
        )}>
          {label}
        </span>
        <ChevronDown size={10} className={cn(
          "text-muted-foreground transition-transform shrink-0",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-64 bg-card border border-border rounded-lg shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-200 max-h-72 overflow-y-auto">
          {hasGlobalAccess && (
            <button
              onClick={() => { setActiveUnitId(null); setIsOpen(false) }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors",
                !activeUnitId ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted/50 text-foreground"
              )}
            >
              <Globe size={14} className="shrink-0" />
              <div>
                <span className="block font-semibold text-xs">Global</span>
                <span className="block text-[10px] text-muted-foreground font-medium">Todas as unidades</span>
              </div>
            </button>
          )}
          {units.map(u => (
            <button
              key={u.unitId}
              onClick={() => { setActiveUnitId(u.unitId); setIsOpen(false) }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors",
                activeUnitId === u.unitId ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted/50 text-foreground"
              )}
            >
              <MapPin size={14} className="shrink-0" />
              <div className="min-w-0">
                <span className="block font-semibold text-xs truncate">
                  {u.unitAcronym ? `${u.unitAcronym} — ${u.unitName}` : u.unitName}
                </span>
                <span className="block text-[10px] text-muted-foreground font-medium">{u.roleName}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
