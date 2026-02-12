/**
 * Invisible CAPTCHA - Behavioral bot detection
 *
 * Browser-only module that tracks user interactions
 * (mouse, keyboard, scroll, focus) to detect bots.
 */

export interface CaptchaBehavior {
  mouseMovements: number;
  mouseClicks: number;
  keyStrokes: number;
  scrollEvents: number;
  focusEvents: number;
  timeSpent: number;
  interactionPattern: string;
  suspiciousActions: string[];
}

export interface CaptchaScore {
  score: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
}

export class InvisibleCaptcha {
  private startTime: number;
  private behaviors: CaptchaBehavior;
  private isActive: boolean = false;
  private eventListeners: (() => void)[] = [];

  constructor() {
    this.startTime = Date.now();
    this.behaviors = {
      mouseMovements: 0,
      mouseClicks: 0,
      keyStrokes: 0,
      scrollEvents: 0,
      focusEvents: 0,
      timeSpent: 0,
      interactionPattern: '',
      suspiciousActions: [],
    };
  }

  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.startTime = Date.now();
    this.behaviors = {
      mouseMovements: 0,
      mouseClicks: 0,
      keyStrokes: 0,
      scrollEvents: 0,
      focusEvents: 0,
      timeSpent: 0,
      interactionPattern: '',
      suspiciousActions: [],
    };

    this.attachEventListeners();
  }

  stop(): void {
    if (!this.isActive) return;

    this.isActive = false;
    this.behaviors.timeSpent = Date.now() - this.startTime;
    this.detachEventListeners();
  }

  getScore(): CaptchaScore {
    const score = this.calculateScore();
    const confidence = this.calculateConfidence();
    const riskLevel = this.getRiskLevel(score);
    const reasons = this.getReasons(score);

    return { score, confidence, riskLevel, reasons };
  }

  private attachEventListeners(): void {
    if (typeof document === 'undefined') return;

    const mouseMoveHandler = () => {
      this.behaviors.mouseMovements++;
      this.addToPattern('M');
    };

    const mouseClickHandler = () => {
      this.behaviors.mouseClicks++;
      this.addToPattern('C');
    };

    const keyPressHandler = () => {
      this.behaviors.keyStrokes++;
      this.addToPattern('K');
    };

    const scrollHandler = () => {
      this.behaviors.scrollEvents++;
      this.addToPattern('S');
    };

    const focusHandler = () => {
      this.behaviors.focusEvents++;
      this.addToPattern('F');
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('click', mouseClickHandler);
    document.addEventListener('keypress', keyPressHandler);
    document.addEventListener('scroll', scrollHandler);
    document.addEventListener('focusin', focusHandler);

    this.eventListeners = [
      () => document.removeEventListener('mousemove', mouseMoveHandler),
      () => document.removeEventListener('click', mouseClickHandler),
      () => document.removeEventListener('keypress', keyPressHandler),
      () => document.removeEventListener('scroll', scrollHandler),
      () => document.removeEventListener('focusin', focusHandler),
    ];
  }

  private detachEventListeners(): void {
    this.eventListeners.forEach(removeListener => removeListener());
    this.eventListeners = [];
  }

  private addToPattern(action: string): void {
    this.behaviors.interactionPattern += action;

    if (this.behaviors.interactionPattern.length > 50) {
      this.behaviors.interactionPattern = this.behaviors.interactionPattern.slice(-30);
    }
  }

  private calculateScore(): number {
    let score = 50;

    const timeScore = Math.min(this.behaviors.timeSpent / 1000, 10) * 5;
    score += timeScore;

    const mouseScore = Math.min(this.behaviors.mouseMovements / 10, 15);
    score += mouseScore;

    const clickScore = Math.min(this.behaviors.mouseClicks * 5, 10);
    score += clickScore;

    const keyScore = Math.min(this.behaviors.keyStrokes * 3, 10);
    score += keyScore;

    const scrollScore = Math.min(this.behaviors.scrollEvents * 2, 5);
    score += scrollScore;

    const focusScore = Math.min(this.behaviors.focusEvents * 2, 5);
    score += focusScore;

    const patternScore = this.analyzePattern();
    score += patternScore;

    const penalty = this.calculatePenalty();
    score -= penalty;

    return Math.max(0, Math.min(100, score));
  }

  private analyzePattern(): number {
    const pattern = this.behaviors.interactionPattern;
    let score = 0;

    if (pattern.includes('MKC') || pattern.includes('KMF')) score += 5;
    if (pattern.includes('SC') || pattern.includes('FS')) score += 3;

    if (pattern.match(/(.)\1{4,}/)) score -= 10;
    if (pattern.match(/[MKCSF]{10,}/)) score -= 15;

    return score;
  }

  private calculatePenalty(): number {
    let penalty = 0;

    if (this.behaviors.timeSpent < 2000) penalty += 20;
    if (this.behaviors.timeSpent < 1000) penalty += 30;

    if (this.behaviors.mouseMovements < 5) penalty += 15;
    if (this.behaviors.keyStrokes < 3) penalty += 10;

    if (this.behaviors.mouseMovements > 100) penalty += 10;
    if (this.behaviors.keyStrokes > 50) penalty += 10;

    const pattern = this.behaviors.interactionPattern;
    if (pattern.match(/[MKCSF]{20,}/)) penalty += 20;

    return penalty;
  }

  private calculateConfidence(): number {
    const timeConfidence = Math.min(this.behaviors.timeSpent / 5000, 1);
    const interactionConfidence = Math.min(
      (this.behaviors.mouseMovements + this.behaviors.keyStrokes) / 20,
      1
    );

    return (timeConfidence + interactionConfidence) / 2;
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 70) return 'low';
    if (score >= 40) return 'medium';
    return 'high';
  }

  private getReasons(score: number): string[] {
    const reasons: string[] = [];

    if (this.behaviors.timeSpent < 2000) {
      reasons.push('페이지 체류 시간이 너무 짧습니다');
    }

    if (this.behaviors.mouseMovements < 5) {
      reasons.push('마우스 움직임이 부족합니다');
    }

    if (this.behaviors.keyStrokes < 3) {
      reasons.push('키보드 입력이 부족합니다');
    }

    if (this.behaviors.interactionPattern.match(/(.)\1{4,}/)) {
      reasons.push('의심스러운 반복 패턴이 감지되었습니다');
    }

    if (score < 30) {
      reasons.push('전반적인 상호작용이 부족합니다');
    }

    return reasons;
  }

  getCurrentBehaviors(): CaptchaBehavior {
    return {
      ...this.behaviors,
      timeSpent: this.isActive ? Date.now() - this.startTime : this.behaviors.timeSpent,
    };
  }
}

// Global instance helpers
let globalCaptcha: InvisibleCaptcha | null = null;

export const initInvisibleCaptcha = (): InvisibleCaptcha => {
  if (!globalCaptcha) {
    globalCaptcha = new InvisibleCaptcha();
  }
  return globalCaptcha;
};

export const startCaptcha = (): void => {
  const captcha = initInvisibleCaptcha();
  captcha.start();
};

export const stopCaptcha = (): CaptchaScore => {
  if (!globalCaptcha) {
    return {
      score: 0,
      confidence: 0,
      riskLevel: 'high',
      reasons: ['CAPTCHA가 초기화되지 않았습니다'],
    };
  }

  globalCaptcha.stop();
  return globalCaptcha.getScore();
};

export const checkCaptchaScore = (): CaptchaScore => {
  if (!globalCaptcha) {
    return {
      score: 0,
      confidence: 0,
      riskLevel: 'high',
      reasons: ['CAPTCHA가 초기화되지 않았습니다'],
    };
  }

  return globalCaptcha.getScore();
};

export const validateCaptcha = (minScore: number = 50): boolean => {
  const score = checkCaptchaScore();
  return score.score >= minScore && score.riskLevel !== 'high';
};
