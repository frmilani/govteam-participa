/**
 * HPAC Permission Helper for Premio-Destaque Spoke (SDK Wrapper)
 * 
 * This file wraps the official @frmilani/hub-permissions SDK to provide
 * the specific interface and additional helpers used throughout the spoke.
 */

import { HubPermissions } from '@frmilani/hub-permissions'
export * from '@frmilani/hub-permissions'

const HUB_URL = process.env.HUB_INTERNAL_URL || process.env.HUB_URL || 'http://localhost:3000'
const SPOKE_ID = process.env.HUB_CLIENT_ID || 'participa'
const SPOKE_SECRET = process.env.HUB_CLIENT_SECRET || ''

// Singleton instance
export const perms = new HubPermissions({
  hubUrl: HUB_URL,
  spokeId: SPOKE_ID,
  spokeSecret: SPOKE_SECRET,
  cacheTTL: 300,
})

/**
 * Compatibility wrapper for checkPermission
 */
export async function checkPermission(
  userId: string,
  organizationId: string,
  resource: string,
  action: string,
  options?: { unitId?: string; resourceId?: string }
) {
  return perms.check(userId, {
    resource,
    action,
    unitId: options?.unitId,
    resourceId: options?.resourceId
  }, organizationId)
}

import { NextResponse } from 'next/server'

/**
 * Compatibility wrapper for auditLog
 */
export async function auditLog(entry: any) {
  return perms.audit(entry)
}

/**
 * Helper to return a standardized HPAC denied response
 */
export function hpacDeniedResponse(resource: string, action: string, reason?: string) {
  return NextResponse.json(
    {
      code: 'HPAC_DENIED',
      error: 'Você não tem permissão para realizar esta ação.',
      details: { resource, action, reason: reason || 'Nenhuma política de acesso foi configurada para permitir esta ação.' }
    },
    { status: 403 }
  );
}

/**
 * Spoke-specific helper: Fetch User Units (not in SDK yet)
 * This calls a different Hub API than the permissions check.
 */
export async function fetchMyUnits(
  userId: string,
  organizationId: string
): Promise<any> {
  try {
    const url = `${HUB_URL}/api/v1/members/me/units?userId=${encodeURIComponent(userId)}&organizationId=${encodeURIComponent(organizationId)}`
    const res = await fetch(url, {
      headers: {
        'x-spoke-id': SPOKE_ID,
        'x-spoke-secret': SPOKE_SECRET,
        'x-organization-id': organizationId,
      },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`[HPAC] fetchMyUnits failed: ${res.status}`, errorData);
      return { userId, organizationId, units: [], hasGlobalAccess: false, totalMembers: 0 }
    }

    return await res.json()
  } catch (error) {
    console.error(`[HPAC] fetchMyUnits error:`, error)
    return { userId, organizationId, units: [], hasGlobalAccess: false, totalMembers: 0 }
  }
}
