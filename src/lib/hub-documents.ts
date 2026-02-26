/**
 * AIOS Document Engine — Premio-Destaque Spoke Helper
 * 
 * Provides functions to interact with the Hub's Document Engine API.
 * Uses spoke auth (x-spoke-id + x-spoke-secret + x-organization-id).
 */

const HUB_URL = process.env.HUB_INTERNAL_URL || process.env.HUB_URL;

function spokeHeaders(organizationId?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-spoke-id': process.env.HUB_CLIENT_ID || 'participa',
    'x-spoke-secret': process.env.HUB_CLIENT_SECRET || '',
  };
  if (organizationId) headers['x-organization-id'] = organizationId;
  return headers;
}

export class DocumentEngineError extends Error {
  status: number;
  details: unknown;

  constructor(status: number, details: unknown) {
    const msg = typeof details === 'object' && details !== null && 'error' in details
      ? (details as { error: string }).error
      : 'Document Engine error';
    super(msg);
    this.name = 'DocumentEngineError';
    this.status = status;
    this.details = details;
  }
}

async function hubFetch<T>(path: string, options: RequestInit & { organizationId?: string } = {}): Promise<T> {
  const { organizationId, ...fetchOptions } = options;
  const url = `${HUB_URL}${path}`;

  const res = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...spokeHeaders(organizationId),
      ...(fetchOptions.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new DocumentEngineError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Templates ───────────────────────────────────────────

export interface TemplateListItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  spokeId: string | null;
  version: number;
}

export async function listTemplates(
  organizationId: string,
  filters?: { category?: string; spokeId?: string }
): Promise<{ templates: TemplateListItem[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.spokeId) params.set('spokeId', filters.spokeId);
  return hubFetch(`/api/v1/documents/templates?${params}`, { organizationId });
}

// ─── Generation ──────────────────────────────────────────

export interface GenerateParams {
  organizationId: string;
  templateId: string;
  inputs: Record<string, unknown>;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, unknown>;
}

export interface GenerateResult {
  documentId: string;
  fileName: string;
  storageUrl: string;
  fileSizeBytes: number;
}

export async function generateDocument(params: GenerateParams): Promise<GenerateResult> {
  return hubFetch('/api/v1/documents/generate', {
    method: 'POST',
    organizationId: params.organizationId,
    body: JSON.stringify({
      templateId: params.templateId,
      inputs: params.inputs,
      referenceId: params.referenceId,
      referenceType: params.referenceType,
      metadata: params.metadata,
    }),
  });
}

export async function previewDocument(
  organizationId: string,
  templateId: string,
  inputs: Record<string, unknown>
): Promise<Buffer> {
  const url = `${HUB_URL}/api/v1/documents/preview`;
  const res = await fetch(url, {
    method: 'POST',
    headers: spokeHeaders(organizationId),
    body: JSON.stringify({ templateId, inputs }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new DocumentEngineError(res.status, body);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ─── Documents ───────────────────────────────────────────

export async function listDocuments(
  organizationId: string,
  filters?: { spokeId?: string; templateId?: string; referenceType?: string }
): Promise<{ documents: unknown[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.spokeId) params.set('spokeId', filters.spokeId);
  if (filters?.templateId) params.set('templateId', filters.templateId);
  if (filters?.referenceType) params.set('referenceType', filters.referenceType);
  return hubFetch(`/api/v1/documents?${params}`, { organizationId });
}

export async function deleteDocument(organizationId: string, documentId: string): Promise<void> {
  return hubFetch(`/api/v1/documents/${documentId}`, {
    method: 'DELETE',
    organizationId,
  });
}
