/**
 * Vitest Setup File - Prêmio Destaque Spoke
 * Runs before all test suites
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_premio';
process.env.AUTH_SECRET = 'test-secret-for-testing-only';
// process.env.NODE_ENV = 'test'; (Read-only at build time)
process.env.HUB_URL = 'http://localhost:3000';
process.env.HUB_CLIENT_ID = 'premio-destaque';
process.env.HUB_CLIENT_SECRET = 'test-client-secret';
process.env.HUB_API_KEY = 'test-api-key';

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    campaign: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    vote: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    nominee: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    award: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  })),
}));

// Mock NextAuth
vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn(),
}));

// Mock Hub Permissions
vi.mock('@/lib/hub-permissions', () => ({
  checkPermission: vi.fn(),
  applyFieldMask: vi.fn((data) => data),
  applyFieldMaskToArray: vi.fn((data) => data),
  buildUnitScopeWhere: vi.fn(() => ({})),
  auditLog: vi.fn(),
}));

// Mock Resource Registry
vi.mock('@/lib/resource-registry', () => ({
  SPOKE_RESOURCES: [
    {
      spokeId: 'premio-destaque',
      resource: 'campaign',
      actions: ['create', 'read', 'update', 'delete'],
      description: 'Campanhas de premiação',
    },
  ],
  registerResources: vi.fn(),
}));

console.log('✅ Test environment initialized (Prêmio Destaque Spoke)');
