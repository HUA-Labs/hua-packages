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
   * 문장 분할 (감정 단위 고려)
   */
  private splitIntoSentences(text: string): string[] {
    // 1차: 문장 부호로 분할
    const sentences = text
      .split(/[.!?。！？\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    // 2차: 긴 문장은 접속사/쉼표로 세분화 (감정 변화 감지)
    const refined: string[] = [];
    for (const sentence of sentences) {
      if (sentence.length > 50) {
        // 긴 문장은 접속사로 분할
        const chunks = sentence.split(/,|\s(그래서|그런데|하지만|그러나|그리고|그렇지만|근데)\s/);
        refined.push(...chunks.filter(c => c && c.length > 5));
      } else {
        refined.push(sentence);
      }
    }
    
    return refined;
  }

  /**
   * 문장에서 감정 단어 추출
   */
  private extractEmotionsFromSentence(sentence: string): string[] {
    const emotions: string[] = [];
    const words = sentence.split(/\s+/);
    
    // 제외할 일반 단어 (감정이 아닌 것)
    const excludeWords = ['한', '할', '함', '합', '해', '하', '이', '가', '을', '를', '은', '는'];
    
    // 조사 목록
    const particles = ['을', '를', '이', '가', '은', '는', '에', '에서', '로', '으로', '와', '과', '의', '도', '만', '부터', '까지', '처럼', '같이', '보다', '하고', '랑'];
    
    for (const word of words) {
      // 제외 단어는 스킵
      if (excludeWords.includes(word)) {
        continue;
      }
      
      // "한 시간", "한 40분" 같은 패턴 제외
      if (word === '한' || word.startsWith('한')) {
        continue;
      }
      
      // 정확한 매치
      if (this.lexicon.hasWord(word)) {
        emotions.push(word);
        continue;
      }
      
      // 조사 제거 후 매치
      let wordWithoutParticle = word;
      for (const particle of particles) {
        if (word.endsWith(particle) && word.length > particle.length) {
          wordWithoutParticle = word.substring(0, word.length - particle.length);
          if (this.lexicon.hasWord(wordWithoutParticle)) {
            emotions.push(wordWithoutParticle);
            break;
          }
        }
      }
      
      // 조사 제거 후 매칭되었으면 다음 단어로
      if (wordWithoutParticle !== word && this.lexicon.hasWord(wordWithoutParticle)) {
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
    // 한국어 형용사/동사 어미 패턴
    const patterns = [
      // 종결어미
      /[아어여]요?$/,      // 해요, 했어요, 했어
      /습니다$/,           // 합니다
      /ㅂ니다$/,           // 슬픕니다
      /네요?$/,            // 하네요, 하네
      
      // 관형형 어미
      /[은는을를]$/,       // 슬픈, 기쁜
      /ㄴ$/,              // 좋은 → 좋
      
      // 연결어미
      /[고서]$/,          // 슬프고, 기뻐서
      /지만$/,            // 슬프지만
      /아서|어서$/,        // 슬퍼서, 기뻐서
      
      // 기본형
      /다$/,              // 슬프다
      /하다$/,            // 사랑하다
      /스럽다$/,          // 사랑스럽다
      /롭다$/,            // 즐겁다
    ];
    
    let baseWord = word;
    
    // 패턴 매칭으로 어미 제거
    for (const pattern of patterns) {
      const match = baseWord.match(pattern);
      if (match) {
        baseWord = baseWord.replace(pattern, '');
        
        // 불규칙 활용 처리
        if (baseWord.endsWith('ㅂ')) {
          baseWord = baseWord.slice(0, -1) + '습'; // 어렵 → 어렵다
        } else if (baseWord.endsWith('ㄹ')) {
          baseWord = baseWord.slice(0, -1) + 'ㄹ'; // 즐겁 → 즐겁다  
        }
        
        // 사전 형태로 변환 (다 붙이기)
        if (!baseWord.endsWith('다')) {
          const withDa = baseWord + '다';
          if (this.lexicon.hasWord(withDa)) {
            return withDa;
          }
        }
        
        return baseWord;
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
    let entropy = -probabilities
      .map(p => p > 0 ? p * Math.log2(p) : 0)
      .reduce((sum, entropy) => sum + entropy, 0);

    // 지배적 감정 보정: 단일 감정이 60% 이상이면 엔트로피 하향 조정
    const maxProbability = Math.max(...probabilities);
    if (maxProbability >= 0.6) {
      // 지배적 감정의 비율에 따라 엔트로피 감소
      const dominanceFactor = (maxProbability - 0.6) / 0.4; // 0.6~1.0 → 0~1
      entropy = entropy * (1 - dominanceFactor * 0.5); // 최대 50% 감소
      
      // 단일 감정이 80% 이상이면 1.0 이하로 제한
      if (maxProbability >= 0.8) {
        entropy = Math.min(entropy, 1.0);
      }
    }

    return Math.max(0, entropy); // 음수 방지
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
