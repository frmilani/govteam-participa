'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface UserUnit {
  memberId: string
  unitId: string
  unitName: string
  unitAcronym: string | null
  parentId: string | null
  roleName: string
  roleId: string
}

interface UnitContextType {
  units: UserUnit[]
  hasGlobalAccess: boolean
  activeUnitId: string | null
  activeUnit: UserUnit | null
  setActiveUnitId: (unitId: string | null) => void
  isMultiUnit: boolean
}

const UnitContext = createContext<UnitContextType | undefined>(undefined)

const STORAGE_KEY = 'aios-active-unit'

interface UnitProviderProps {
  children: React.ReactNode
  units: UserUnit[]
  hasGlobalAccess: boolean
}

export function UnitProvider({ children, units, hasGlobalAccess }: UnitProviderProps) {
  const [activeUnitId, setActiveUnitIdState] = useState<string | null>(null)

  const isMultiUnit = units.length > 1 || hasGlobalAccess

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && (saved === 'global' || units.some(u => u.unitId === saved))) {
      setActiveUnitIdState(saved === 'global' ? null : saved)
    } else if (units.length === 1 && !hasGlobalAccess) {
      setActiveUnitIdState(units[0].unitId)
    }
  }, [units, hasGlobalAccess])

  const setActiveUnitId = useCallback((unitId: string | null) => {
    setActiveUnitIdState(unitId)
    localStorage.setItem(STORAGE_KEY, unitId ?? 'global')
  }, [])

  const activeUnit = activeUnitId
    ? units.find(u => u.unitId === activeUnitId) ?? null
    : null

  return (
    <UnitContext.Provider value={{
      units,
      hasGlobalAccess,
      activeUnitId,
      activeUnit,
      setActiveUnitId,
      isMultiUnit,
    }}>
      {children}
    </UnitContext.Provider>
  )
}

export function useActiveUnit() {
  const context = useContext(UnitContext)
  if (context === undefined) {
    throw new Error('useActiveUnit must be used within a UnitProvider')
  }
  return context
}
