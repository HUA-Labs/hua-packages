import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  InvisibleCaptcha,
  initInvisibleCaptcha,
  startCaptcha,
  stopCaptcha,
  checkCaptchaScore,
  validateCaptcha,
} from '../pro/captcha/invisible-captcha';

// Mock document for Node.js environment
const mockListeners: Record<string, Function[]> = {};

vi.stubGlobal('document', {
  addEventListener: (event: string, handler: Function) => {
    if (!mockListeners[event]) mockListeners[event] = [];
    mockListeners[event].push(handler);
  },
  removeEventListener: (event: string, handler: Function) => {
    if (mockListeners[event]) {
      mockListeners[event] = mockListeners[event].filter(h => h !== handler);
    }
  },
});

function triggerEvent(event: string, count: number = 1) {
  for (let i = 0; i < count; i++) {
    mockListeners[event]?.forEach(h => h());
  }
}

describe('InvisibleCaptcha', () => {
  let captcha: InvisibleCaptcha;

  beforeEach(() => {
    // Clear mock listeners
    Object.keys(mockListeners).forEach(key => delete mockListeners[key]);
    captcha = new InvisibleCaptcha();
  });

  it('should start and stop', () => {
    captcha.start();
    const behaviors = captcha.getCurrentBehaviors();
    expect(behaviors.timeSpent).toBeGreaterThanOrEqual(0);

    captcha.stop();
    const afterStop = captcha.getCurrentBehaviors();
    expect(afterStop.timeSpent).toBeGreaterThanOrEqual(0);
  });

  it('should track mouse movements', () => {
    captcha.start();
    triggerEvent('mousemove', 10);
    const behaviors = captcha.getCurrentBehaviors();
    expect(behaviors.mouseMovements).toBe(10);
    captcha.stop();
  });

  it('should track clicks', () => {
    captcha.start();
    triggerEvent('click', 3);
    const behaviors = captcha.getCurrentBehaviors();
    expect(behaviors.mouseClicks).toBe(3);
    captcha.stop();
  });

  it('should track keystrokes', () => {
    captcha.start();
    triggerEvent('keypress', 5);
    const behaviors = captcha.getCurrentBehaviors();
    expect(behaviors.keyStrokes).toBe(5);
    captcha.stop();
  });

  it('should calculate score', () => {
    captcha.start();
    triggerEvent('mousemove', 20);
    triggerEvent('click', 5);
    triggerEvent('keypress', 10);
    captcha.stop();

    const score = captcha.getScore();
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
    expect(['low', 'medium', 'high']).toContain(score.riskLevel);
    expect(score.confidence).toBeGreaterThanOrEqual(0);
    expect(score.confidence).toBeLessThanOrEqual(1);
  });

  it('should give low score for no interaction', () => {
    captcha.start();
    captcha.stop();

    const score = captcha.getScore();
    expect(score.score).toBeLessThan(50);
    expect(score.riskLevel).toBe('high');
  });

  it('should not double-start', () => {
    captcha.start();
    triggerEvent('click', 3);
    captcha.start(); // should be no-op
    const behaviors = captcha.getCurrentBehaviors();
    expect(behaviors.mouseClicks).toBe(3);
    captcha.stop();
  });

  it('should build interaction pattern', () => {
    captcha.start();
    triggerEvent('mousemove', 2);
    triggerEvent('keypress', 1);
    triggerEvent('click', 1);
    const behaviors = captcha.getCurrentBehaviors();
    expect(behaviors.interactionPattern).toBe('MMKC');
    captcha.stop();
  });

  // Scroll events:
  it('should track scroll events', () => {
    captcha.start();
    triggerEvent('scroll', 5);
    const behaviors = captcha.getCurrentBehaviors();
    expect(behaviors.scrollEvents).toBe(5);
    captcha.stop();
  });

  // Focus events:
  it('should track focus events', () => {
    captcha.start();
    triggerEvent('focusin', 3);
    const behaviors = captcha.getCurrentBehaviors();
    expect(behaviors.focusEvents).toBe(3);
    captcha.stop();
  });

  // Pattern penalty - repeated actions:
  it('should detect repetitive pattern', () => {
    captcha.start();
    triggerEvent('mousemove', 30); // MMMM...
    captcha.stop();
    const score = captcha.getScore();
    // Repetitive pattern should reduce score
    expect(score.reasons.length).toBeGreaterThan(0);
  });

  // Risk boundary 70:
  it('should return low risk for score >= 70', () => {
    captcha.start();
    // Simulate good human interaction
    triggerEvent('mousemove', 50);
    triggerEvent('click', 5);
    triggerEvent('keypress', 20);
    triggerEvent('scroll', 3);
    triggerEvent('focusin', 2);
    // Manually set time
    (captcha as any).startTime = Date.now() - 10000;
    captcha.stop();
    const score = captcha.getScore();
    expect(score.score).toBeGreaterThanOrEqual(70);
    expect(score.riskLevel).toBe('low');
  });

  // Risk boundary 40:
  it('should return medium risk for moderate interaction', () => {
    captcha.start();
    triggerEvent('mousemove', 10);
    triggerEvent('keypress', 3);
    (captcha as any).startTime = Date.now() - 3000;
    captcha.stop();
    const score = captcha.getScore();
    expect(score.riskLevel).not.toBe('high');
  });

  // Score capped between 0-100:
  it('should cap score between 0 and 100', () => {
    captcha.start();
    triggerEvent('mousemove', 200);
    triggerEvent('click', 100);
    triggerEvent('keypress', 100);
    (captcha as any).startTime = Date.now() - 60000;
    captcha.stop();
    const score = captcha.getScore();
    expect(score.score).toBeLessThanOrEqual(100);
    expect(score.score).toBeGreaterThanOrEqual(0);
  });

  // Stop without start:
  it('should handle stop without start gracefully', () => {
    captcha.stop();
    const behaviors = captcha.getCurrentBehaviors();
    expect(behaviors.timeSpent).toBe(0);
  });

  // Pattern truncation:
  it('should truncate long patterns', () => {
    captcha.start();
    // Generate > 50 events to trigger truncation
    triggerEvent('mousemove', 60);
    const behaviors = captcha.getCurrentBehaviors();
    expect(behaviors.interactionPattern.length).toBeLessThanOrEqual(50);
    captcha.stop();
  });

  // Confidence:
  it('should return higher confidence with more interaction', () => {
    const captcha1 = new InvisibleCaptcha();
    captcha1.start();
    captcha1.stop();
    const low = captcha1.getScore();

    const captcha2 = new InvisibleCaptcha();
    captcha2.start();
    triggerEvent('mousemove', 20);
    triggerEvent('keypress', 10);
    (captcha2 as any).startTime = Date.now() - 10000;
    captcha2.stop();
    const high = captcha2.getScore();

    expect(high.confidence).toBeGreaterThan(low.confidence);
  });

  // Global helpers:
  describe('global helpers', () => {
    it('initInvisibleCaptcha should create singleton', () => {
      // initInvisibleCaptcha creates/returns global instance
      const instance = initInvisibleCaptcha();
      expect(instance).toBeInstanceOf(InvisibleCaptcha);
    });

    it('stopCaptcha should return score', () => {
      startCaptcha();
      const score = stopCaptcha();
      expect(score).toBeDefined();
      expect(typeof score.score).toBe('number');
    });

    it('validateCaptcha should validate against minScore', () => {
      startCaptcha();
      // No interaction = low score
      const valid = validateCaptcha(50);
      expect(typeof valid).toBe('boolean');
    });

    it('checkCaptchaScore should return current score', () => {
      startCaptcha();
      const score = checkCaptchaScore();
      expect(score).toBeDefined();
      expect(typeof score.score).toBe('number');
    });
  });
});
