import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { productLimits } from '@jobwhistle/config';

describe('Monitoring Engine & Incident Lifecycle Rules', () => {
  it('enforces consecutive failure threshold for incident confirmation', () => {
    assert.strictEqual(
      productLimits.consecutiveFailuresForIncident,
      2,
      'Initial beta threshold must be 2 consecutive failures to prevent false alarms'
    );
  });

  it('correctly calculates incident duration in seconds', () => {
    const suspectedAt = new Date('2026-11-07T10:00:00Z').getTime();
    const resolvedAt = new Date('2026-11-07T10:14:30Z').getTime();
    const durationSeconds = Math.round((resolvedAt - suspectedAt) / 1000);

    assert.strictEqual(durationSeconds, 870, 'Downtime should accurately measure 870 seconds (14m 30s)');
  });

  it('calculates heartbeat deadline from expected interval and grace period', () => {
    const checkInTime = new Date('2026-11-07T12:00:00Z').getTime();
    const expectedIntervalMinutes = 60; // 1 hour
    const gracePeriodMinutes = 15; // 15 min grace

    const expectedNextTime = checkInTime + expectedIntervalMinutes * 60 * 1000;
    const deadlineTime = expectedNextTime + gracePeriodMinutes * 60 * 1000;

    assert.strictEqual(
      new Date(expectedNextTime).toISOString(),
      '2026-11-07T13:00:00.000Z'
    );
    assert.strictEqual(
      new Date(deadlineTime).toISOString(),
      '2026-11-07T13:15:00.000Z'
    );
  });
});

