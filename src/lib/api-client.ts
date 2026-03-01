/**
 * API Client wrapper that automatically injects the active unit ID
 * from localStorage into all fetch requests as x-active-unit-id header.
 * 
 * Also handles HPAC 403 responses by dispatching a global event to open
 * the AccessDeniedModal.
 */

const STORAGE_KEY = 'aios-active-unit'

function getActiveUnitId(): string | null {
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved || saved === 'global') return null
  return saved
}

// ─── Custom Event ─────────────────────────────────────────────────

export interface HpacDeniedEventDetail {
  resource?: string
  action?: string
  reason?: string
}

export const HPAC_DENIED_EVENT = 'hpac:denied'

function dispatchHpacDenied(detail: HpacDeniedEventDetail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(HPAC_DENIED_EVENT, { detail }))
  }
}

// ─── Response wrapper ────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  /** Whether request succeeded (2xx) */
  ok: boolean
  /** HTTP status code */
  status: number
  /** Whether the 403 was an HPAC denial (modal already shown) */
  denied: boolean
  /** Parse response body as JSON */
  json(): Promise<T>
  /** Raw Response object */
  raw: Response
}

async function wrapResponse<T = unknown>(response: Response): Promise<ApiResponse<T>> {
  let denied = false

  if (response.status === 403) {
    try {
      const cloned = response.clone()
      const body = await cloned.json()
      if (body?.code === 'HPAC_DENIED') {
        denied = true
        dispatchHpacDenied({
          resource: body?.details?.resource,
          action: body?.details?.action,
          reason: body?.details?.reason || body?.error,
        })
      }
    } catch {
      // Not JSON — let it pass through as a regular 403
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    denied,
    json: () => response.json() as Promise<T>,
    raw: response,
  }
}

// ─── Client Methods ──────────────────────────────────────────────

export async function apiFetch<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  const activeUnitId = getActiveUnitId()
  const headers = new Headers(init?.headers)

  if (activeUnitId) {
    headers.set('x-active-unit-id', activeUnitId)
  }

  const response = await fetch(input, { ...init, headers })
  return wrapResponse<T>(response)
}

async function get<T = unknown>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, { ...init, method: 'GET' })
}

async function post<T = unknown>(url: string, body?: unknown, init?: RequestInit): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    ...init,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

async function put<T = unknown>(url: string, body?: unknown, init?: RequestInit): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    ...init,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

async function patch<T = unknown>(url: string, body?: unknown, init?: RequestInit): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    ...init,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

async function del<T = unknown>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, { ...init, method: 'DELETE' })
}

export const api = {
  fetch: apiFetch,
  get,
  post,
  put,
  patch,
  del,
} as const
