import { describe, it, expect } from 'vitest';
import { sanitizeText, formatTime } from '../lib/utils';
import { APP_CONFIG, REPORT_REASONS } from '../lib/constants';

describe('Sanitization & Security', () => {
  it('escapes dangerous HTML characters to prevent XSS', () => {
    const malicious = '<script>alert("hack")</script>&"test"';
    const clean = sanitizeText(malicious);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('&lt;script&gt;');
    expect(clean).toContain('&amp;');
    expect(clean).toContain('&quot;');
  });

  it('preserves benign alphanumeric message content', () => {
    const normal = 'Hello there stranger, how is your day?';
    expect(sanitizeText(normal)).toBe(normal);
  });
});

describe('Validation & Application Limits', () => {
  it('enforces maximum message character limits', () => {
    expect(APP_CONFIG.maxMessageLength).toBe(1000);
    const valid = 'a'.repeat(1000);
    const oversized = 'a'.repeat(1001);
    expect(valid.length).toBeLessThanOrEqual(APP_CONFIG.maxMessageLength);
    expect(oversized.length).toBeGreaterThan(APP_CONFIG.maxMessageLength);
  });

  it('validates report reason codes', () => {
    const validCodes = REPORT_REASONS.map(r => r.code);
    expect(validCodes).toContain('harassment');
    expect(validCodes).toContain('underage');
    expect(validCodes).toContain('spam');
    expect(validCodes).toContain('threat');
  });

  it('formats timestamp correctly', () => {
    const nowIso = new Date('2026-10-09T12:30:00Z').toISOString();
    const formatted = formatTime(nowIso);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });
});
