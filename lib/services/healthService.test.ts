import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  limit: vi.fn(),
  from: vi.fn(),
  getSession: vi.fn(),
  removeAllChannels: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mocks.from,
    auth: {
      getSession: mocks.getSession
    },
    removeAllChannels: mocks.removeAllChannels
  }))
}));

// Import real functions
import { healthCheck, attemptRecovery, serviceMonitor } from '../../lib/supabaseClient';

describe('Service Health Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful setup
    mocks.limit.mockResolvedValue({ data: [{ id: '1' }], error: null });
    mocks.select.mockReturnValue({ limit: mocks.limit });
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.getSession.mockResolvedValue({ data: { session: {} }, error: null });
  });

  describe('healthCheck', () => {
    it('should return healthy status when all services are working', async () => {
      const result = await healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.details.database).toBe(true);
      expect(result.details.auth).toBe(true);
      expect(result.details.network).toBe(true);
      expect(result.details.error).toBeUndefined();
    });

    it('should return degraded status when database fails but auth works', async () => {
      // Mock database failure
      mocks.limit.mockResolvedValue({ data: null, error: { message: 'Database error' } });

      const result = await healthCheck();

      expect(result.status).toBe('degraded');
      expect(result.details.database).toBe(false);
      expect(result.details.auth).toBe(true);
    });

    it('should return unavailable status when both services fail', async () => {
      // Mock both services failing
      mocks.limit.mockResolvedValue({ data: null, error: { message: 'Database error' } });
      mocks.getSession.mockResolvedValue({ data: { session: null }, error: { message: 'Auth error' } });

      const result = await healthCheck();

      expect(result.status).toBe('unavailable');
      expect(result.details.database).toBe(false);
      expect(result.details.auth).toBe(false);
      expect(result.details.error).toContain('Both database and auth services are unavailable');
    });

    it('should handle network errors gracefully', async () => {
      // Mock network failure
      mocks.from.mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await healthCheck();

      expect(result.status).toBe('unavailable');
      expect(result.details.network).toBe(false);
      expect(result.details.error).toContain('Network error');
    });
  });

  describe('attemptRecovery', () => {
    it('should attempt recovery successfully', async () => {
      // Mock successful recovery
      mocks.getSession.mockResolvedValue({ data: { session: {} }, error: null });

      const result = await attemptRecovery();

      expect(result).toBe(true);
      expect(mocks.removeAllChannels).toHaveBeenCalled();
    });

    it('should return false when recovery fails', async () => {
      // Mock failed recovery
      mocks.getSession.mockResolvedValue({ data: { session: null }, error: { message: 'Recovery failed' } });

      const result = await attemptRecovery();

      expect(result).toBe(false);
    });

    it('should handle recovery exceptions', async () => {
      // Mock exception during recovery
      mocks.getSession.mockImplementation(() => {
        throw new Error('Recovery exception');
      });

      const result = await attemptRecovery();

      expect(result).toBe(false);
    });
  });

  describe('serviceMonitor configuration', () => {
    it('should have correct default configuration', () => {
      expect(serviceMonitor.checkInterval).toBe(30000); // 30 seconds
      expect(serviceMonitor.thresholds.responseTime).toBe(5000); // 5 seconds
      expect(serviceMonitor.thresholds.consecutiveFailures).toBe(3);
      expect(serviceMonitor.thresholds.availability).toBe(0.95); // 95%
      expect(serviceMonitor.alerts.console).toBe(true);
      expect(serviceMonitor.alerts.email).toBe(true);
      expect(serviceMonitor.alerts.webhook).toBe(false);
    });
  });
});
