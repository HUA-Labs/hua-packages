/**
 * HUA Emotion Engine - 감정 사전 모듈
 * 
 * 서울대 434개 감정어를 기반으로 한 감정 좌표계 제공
 */

import * as fs from 'fs';
import * as path from 'path';
import { EmotionWord, EmotionCoordinates } from '../types/emotion';

export class EmotionLexicon {
  private words: Map<string, EmotionWord> = new Map();
  private normalizedWords: Map<string, EmotionCoordinates> = new Map();
  
  // 정규화 범위 (서울대 감정어 기준)
  private readonly VALENCE_RANGE = { min: 1.3, max: 6.1 };
  private readonly AROUSAL_RANGE = { min: 1.9, max: 6.6 };

  constructor(lexiconPath: string) {
    this.loadLexicon(lexiconPath);
  }

  /**
   * 감정 사전 로드
   */
  private loadLexicon(lexiconPath: string): void {
    try {
      const data = fs.readFileSync(lexiconPath, 'utf-8');
      const lines = data.split('\n').slice(1); // 헤더 제외

      for (const line of lines) {
        if (line.trim()) {
          const [word, prototypicality, familiarity, valence, arousal] = line.split(',');
          
          const emotionWord: EmotionWord = {
            word: word.trim(),
            prototypicality: parseFloat(prototypicality),
            familiarity: parseFloat(familiarity),
            valence: parseFloat(valence),
            arousal: parseFloat(arousal)
          };

          this.words.set(emotionWord.word, emotionWord);
          
          // 정규화된 좌표 계산
          const normalizedCoords = this.normalizeCoordinates(emotionWord.valence, emotionWord.arousal);
          this.normalizedWords.set(emotionWord.word, normalizedCoords);
        }
      }

      console.log(`✅ 감정 사전 로드 완료: ${this.words.size}개 단어`);
    } catch (error) {
      console.error('❌ 감정 사전 로드 실패:', error);
      throw new Error(`감정 사전을 로드할 수 없습니다: ${lexiconPath}`);
    }
  }

  /**
   * 좌표 정규화 (0~1 범위)
   */
  private normalizeCoordinates(valence: number, arousal: number): EmotionCoordinates {
    const normalizedValence = (valence - this.VALENCE_RANGE.min) / 
                             (this.VALENCE_RANGE.max - this.VALENCE_RANGE.min);
    const normalizedArousal = (arousal - this.AROUSAL_RANGE.min) / 
                              (this.AROUSAL_RANGE.max - this.AROUSAL_RANGE.min);

    return {
      valence: Math.max(0, Math.min(1, normalizedValence)),
      arousal: Math.max(0, Math.min(1, normalizedArousal))
    };
  }

  /**
   * 감정 단어 검색
   */
  getEmotionWord(word: string): EmotionWord | undefined {
    return this.words.get(word);
  }

  /**
   * 정규화된 감정 좌표 검색
   */
  getEmotionCoordinates(word: string): EmotionCoordinates | undefined {
    return this.normalizedWords.get(word);
  }

  /**
   * 모든 감정 단어 반환
   */
  getAllWords(): EmotionWord[] {
    return Array.from(this.words.values());
  }

  /**
   * 감정 단어 존재 여부 확인
   */
  hasWord(word: string): boolean {
    return this.words.has(word);
  }

  /**
   * 감정 사전 크기
   */
  getSize(): number {
    return this.words.size;
  }

  /**
   * 친숙도 기준으로 감정 단어 필터링
   */
  getWordsByFamiliarity(minFamiliarity: number = 3.0): EmotionWord[] {
    return Array.from(this.words.values())
      .filter(word => word.familiarity >= minFamiliarity)
      .sort((a, b) => b.familiarity - a.familiarity);
  }

  /**
   * 대표성 기준으로 감정 단어 필터링
   */
  getWordsByPrototypicality(minPrototypicality: number = 3.0): EmotionWord[] {
    return Array.from(this.words.values())
      .filter(word => word.prototypicality >= minPrototypicality)
      .sort((a, b) => b.prototypicality - a.prototypicality);
  }

  /**
   * 감정 좌표 범위 내 단어 검색
   */
  getWordsInRange(
    valenceRange: { min: number; max: number },
    arousalRange: { min: number; max: number }
  ): EmotionWord[] {
    return Array.from(this.words.values()).filter(word => {
      const coords = this.normalizedWords.get(word.word);
      if (!coords) return false;
      
      return coords.valence >= valenceRange.min && 
             coords.valence <= valenceRange.max &&
             coords.arousal >= arousalRange.min && 
             coords.arousal <= arousalRange.max;
    });
  }
}
