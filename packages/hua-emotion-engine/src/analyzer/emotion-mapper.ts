/**
 * 감정 동의어/유사어 매핑 유틸리티
 */

import * as fs from 'fs';
import * as path from 'path';

export class EmotionMapper {
  private synonyms: Record<string, string[]> = {};

  constructor(synonymsPath?: string) {
    try {
      const filePath = synonymsPath || path.join(__dirname, '../../data/emotion_synonyms.json');
      const data = fs.readFileSync(filePath, 'utf-8');
      this.synonyms = JSON.parse(data);
    } catch (error) {
      console.warn('감정 동의어 파일 로드 실패, 빈 매핑 사용:', error);
    }
  }

  /**
   * 감정 단어를 사전에 있는 유사어로 매핑
   */
  mapToLexicon(emotion: string): string[] {
    // 정확히 일치하는 경우
    if (this.synonyms[emotion]) {
      return [emotion, ...this.synonyms[emotion]];
    }

    // 부분 일치 검색 (소문자 비교)
    const lowerEmotion = emotion.toLowerCase();
    for (const [key, values] of Object.entries(this.synonyms)) {
      if (key.toLowerCase().includes(lowerEmotion) || 
          values.some(v => v.toLowerCase().includes(lowerEmotion))) {
        return [key, ...values];
      }
    }

    // 매핑 실패 시 원본 반환
    return [emotion];
  }

  /**
   * 여러 감정을 배치 매핑
   */
  mapBatch(emotions: string[]): Map<string, string[]> {
    const result = new Map<string, string[]>();
    
    for (const emotion of emotions) {
      const mapped = this.mapToLexicon(emotion);
      result.set(emotion, mapped);
    }

    return result;
  }

  /**
   * AI가 추출한 감정을 사전 단어로 변환
   */
  findBestMatch(aiEmotion: string, lexicon: Set<string>): string | null {
    const candidates = this.mapToLexicon(aiEmotion);
    
    for (const candidate of candidates) {
      if (lexicon.has(candidate)) {
        return candidate;
      }
    }

    return null;
  }
}

