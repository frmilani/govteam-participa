/**
 * API Client wrapper that automatically injects the active unit ID
 * from localStorage into all fetch requests as x-active-unit-id header.
 */

const STORAGE_KEY = 'aios-active-unit'

function getActiveUnitId(): string | null {
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved || saved === 'global') return null
  return saved
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const activeUnitId = getActiveUnitId()
  const headers = new Headers(init?.headers)

  if (activeUnitId) {
    headers.set('x-active-unit-id', activeUnitId)
  }

  return fetch(input, { ...init, headers })
}
