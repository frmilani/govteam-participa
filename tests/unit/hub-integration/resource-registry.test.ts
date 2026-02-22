/**
 * Unit Tests: Resource Registry (Prêmio Destaque Spoke)
 *
 * Tests the registration of Prêmio Destaque resources with Hub's HPAC system
 */

import { describe, it, expect } from 'vitest';
import { SPOKE_RESOURCES } from '@/lib/resource-registry';

describe('Resource Registry', () => {
  describe('SPOKE_RESOURCES Definition', () => {
    it('should define all Prêmio Destaque resources', () => {
      expect(SPOKE_RESOURCES).toBeDefined();
      expect(Array.isArray(SPOKE_RESOURCES)).toBe(true);
      expect(SPOKE_RESOURCES.length).toBeGreaterThan(0);
    });

    it('should have premio-destaque as spokeId for all resources', () => {
      SPOKE_RESOURCES.forEach(resource => {
        expect((resource as any).spokeId).toBe('premio-destaque');
      });
    });

    it('should define campaign resource', () => {
      const campaignResource = SPOKE_RESOURCES.find(r => r.resource === 'campaign');

      expect(campaignResource).toBeDefined();
      expect(campaignResource?.actions).toContain('create');
      expect(campaignResource?.actions).toContain('read');
      expect(campaignResource?.description).toBeDefined();
    });

    it('should define required actions for each resource', () => {
      SPOKE_RESOURCES.forEach(resource => {
        expect(resource.actions).toBeDefined();
        expect(Array.isArray(resource.actions)).toBe(true);
        expect(resource.actions.length).toBeGreaterThan(0);
        expect(resource.actions).toContain('read');
      });
    });

    it('should have descriptions for all resources', () => {
      SPOKE_RESOURCES.forEach(resource => {
        expect(resource.description).toBeDefined();
        expect(typeof resource.description).toBe('string');
        expect(resource.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Resource Validation', () => {
    it('should not have duplicate resources', () => {
      const resourceNames = SPOKE_RESOURCES.map(r => r.resource);
      const uniqueNames = new Set(resourceNames);

      expect(resourceNames.length).toBe(uniqueNames.size);
    });

    it('should have valid action names', () => {
      const validActions = ['create', 'read', 'update', 'delete', 'list', 'publish', 'vote'];

      SPOKE_RESOURCES.forEach(resource => {
        resource.actions.forEach(action => {
          expect(validActions).toContain(action);
        });
      });
    });

    it('should follow resource naming convention', () => {
      SPOKE_RESOURCES.forEach(resource => {
        expect(resource.resource).toBe(resource.resource.toLowerCase());
        expect(resource.resource).not.toContain(' ');
        expect(resource.resource).toMatch(/^[a-z0-9-]+$/);
      });
    });
  });
});
