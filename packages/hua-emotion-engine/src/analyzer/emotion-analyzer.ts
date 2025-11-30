/**
 * HUA Emotion Engine - 감정 분석 모듈
 * 
 * 감정의 기하학: 패턴을 측정하지만, AI가 해석을 선택하게 만드는 설계
 */

import { EmotionLexicon } from '../lexicon/emotion-lexicon';
import { 
  EmotionAnalysis, 
  EmotionCoordinates, 
  EmotionTransition, 
  EmotionCurve,
  EmotionWord 
} from '../types/emotion';

export class EmotionAnalyzer {
  private lexicon: EmotionLexicon;

  constructor(lexicon: EmotionLexicon) {
    this.lexicon = lexicon;
  }

  /**
   * 텍스트에서 감정 분석 수행
   */
  analyzeText(text: string): EmotionAnalysis {
    const sentences = this.splitIntoSentences(text);
    const rawEmotions: string[] = [];
    const coordinates: EmotionCoordinates[] = [];
    const transitions: EmotionTransition[] = [];

    // 각 문장에서 감정 추출
    for (const sentence of sentences) {
      const emotions = this.extractEmotionsFromSentence(sentence);
      rawEmotions.push(...emotions);
      
      for (const emotion of emotions) {
        const coords = this.lexicon.getEmotionCoordinates(emotion);
        if (coords) {
          coordinates.push(coords);
        }
      }
    }

    // 감정 전이 계산
    for (let i = 0; i < coordinates.length - 1; i++) {
      const transition = this.calculateTransition(coordinates[i], coordinates[i + 1]);
      transitions.push(transition);
    }

    // 평균 좌표 계산
    const averageCoordinates = this.calculateAverageCoordinates(coordinates);
    
    // 엔트로피 계산
    const entropy = this.calculateEntropy(rawEmotions);
    
    // 지배적 감정 찾기
    const dominantEmotion = this.findDominantEmotion(rawEmotions);
    
    // 감정 밀도 계산
    const emotionDensity = rawEmotions.length / text.length;
    
    // 시제 전환 수 계산
    const tenseChanges = this.countTenseChanges(text);
    
    // 1인칭 빈도 계산
    const firstPersonFreq = this.calculateFirstPersonFrequency(text);

    return {
      coordinates: averageCoordinates,
      entropy,
      dominantEmotion,
      emotionDensity,
      tenseChanges,
      firstPersonFreq,
      transitions,
      rawEmotions
    };
  }

  /**
   * 감정 곡선 생성
   */
  generateEmotionCurve(text: string): EmotionCurve {
    const sentences = this.splitIntoSentences(text);
    const timestamps: number[] = [];
    const coordinates: EmotionCoordinates[] = [];
    const emotions: string[] = [];
    const transitions: EmotionTransition[] = [];

    let currentTime = 0;
    const timeStep = 1000; // 1초 간격

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceEmotions = this.extractEmotionsFromSentence(sentence);
      
      for (const emotion of sentenceEmotions) {
        const coords = this.lexicon.getEmotionCoordinates(emotion);
        if (coords) {
          timestamps.push(currentTime);
          coordinates.push(coords);
          emotions.push(emotion);
        }
      }
      
      currentTime += timeStep;
    }

    // 전이 계산
    for (let i = 0; i < coordinates.length - 1; i++) {
      const transition = this.calculateTransition(coordinates[i], coordinates[i + 1]);
      transitions.push(transition);
    }

    return {
      timestamps,
      coordinates,
      emotions,
      transitions
    };
  }

  /**
   * 문장 분할
   */
  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?。！？]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * 문장에서 감정 단어 추출
   */
  private extractEmotionsFromSentence(sentence: string): string[] {
    const emotions: string[] = [];
    const words = sentence.split(/\s+/);
    
    for (const word of words) {
      // 정확한 매치
      if (this.lexicon.hasWord(word)) {
        emotions.push(word);
        continue;
      }
      
      // 어미 변화 고려한 매치
      const baseWord = this.extractBaseWord(word);
      if (baseWord && this.lexicon.hasWord(baseWord)) {
        emotions.push(baseWord);
      }
    }
    
    return emotions;
  }

  /**
   * 어미 변화 제거하여 기본형 추출
   */
  private extractBaseWord(word: string): string | null {
    // 간단한 어미 제거 로직 (한국어 특성 고려)
    const endings = ['다', '하다', '되다', '있다', '없다', '이다'];
    
    for (const ending of endings) {
      if (word.endsWith(ending)) {
        return word.slice(0, -ending.length);
      }
    }
    
    return word;
  }

  /**
   * 감정 전이 계산
   */
  private calculateTransition(
    from: EmotionCoordinates, 
    to: EmotionCoordinates
  ): EmotionTransition {
    const deltaValence = to.valence - from.valence;
    const deltaArousal = to.arousal - from.arousal;
    
    const distance = Math.sqrt(deltaValence ** 2 + deltaArousal ** 2);
    const direction = Math.atan2(deltaArousal, deltaValence);
    const intensity = Math.abs(deltaValence) + Math.abs(deltaArousal);

    return {
      from,
      to,
      distance,
      direction,
      intensity
    };
  }

  /**
   * 평균 좌표 계산
   */
  private calculateAverageCoordinates(coordinates: EmotionCoordinates[]): EmotionCoordinates {
    if (coordinates.length === 0) {
      return { valence: 0.5, arousal: 0.5 }; // 중립
    }

    const sumValence = coordinates.reduce((sum, coord) => sum + coord.valence, 0);
    const sumArousal = coordinates.reduce((sum, coord) => sum + coord.arousal, 0);

    return {
      valence: sumValence / coordinates.length,
      arousal: sumArousal / coordinates.length
    };
  }

  /**
   * Shannon Entropy 계산
   */
  private calculateEntropy(emotions: string[]): number {
    if (emotions.length === 0) return 0;

    const emotionCounts = new Map<string, number>();
    
    // 감정 빈도 계산
    for (const emotion of emotions) {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
    }

    // 확률 분포 계산
    const probabilities = Array.from(emotionCounts.values())
      .map(count => count / emotions.length);

    // Shannon Entropy 계산
    const entropy = -probabilities
      .map(p => p > 0 ? p * Math.log2(p) : 0)
      .reduce((sum, entropy) => sum + entropy, 0);

    return entropy;
  }

  /**
   * 지배적 감정 찾기
   */
  private findDominantEmotion(emotions: string[]): string {
    if (emotions.length === 0) return '중립';

    const emotionCounts = new Map<string, number>();
    
    for (const emotion of emotions) {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
    }

    let maxCount = 0;
    let dominantEmotion = '중립';

    for (const [emotion, count] of emotionCounts) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    }

    return dominantEmotion;
  }

  /**
   * 시제 전환 수 계산
   */
  private countTenseChanges(text: string): number {
    // 간단한 시제 전환 패턴 감지
    const tensePatterns = [
      /했다|했었다|했을|했던/g,
      /한다|하고|하는|하니/g,
      /할|하겠|하겠다/g
    ];

    let changes = 0;
    const matches = text.match(new RegExp(tensePatterns.map(p => p.source).join('|'), 'g'));
    
    if (matches) {
      changes = matches.length;
    }

    return changes;
  }

  /**
   * 1인칭 빈도 계산
   */
  private calculateFirstPersonFrequency(text: string): number {
    const firstPersonWords = ['나', '내', '내가', '나는', '저', '제', '제가', '저는'];
    const words = text.split(/\s+/);
    
    let firstPersonCount = 0;
    for (const word of words) {
      if (firstPersonWords.includes(word)) {
        firstPersonCount++;
      }
    }

    return words.length > 0 ? firstPersonCount / words.length : 0;
  }
}
