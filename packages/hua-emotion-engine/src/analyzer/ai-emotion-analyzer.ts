/**
 * AI 기반 감정 분석 (엔트로피/밀도 계산)
 * 
 * OpenAI의 감정 분석 결과를 활용하여 Shannon Entropy와 감정 밀도를 계산
 */

interface EmotionFlowItem {
  from: string;
  to: string;
  description: string;
}

interface AIEmotionMetrics {
  entropy: number;
  density: number;
  transitions: number;
  diversity: number;
  dominantEmotionRatio: number;
  dominantEmotion: string;
}

export class AIEmotionAnalyzer {
  /**
   * AI가 추출한 감정 흐름에서 메트릭 계산
   */
  analyzeEmotionFlow(emotionFlow: EmotionFlowItem[] | string[]): AIEmotionMetrics {
    // 감정 단어 추출
    const emotions: string[] = [];
    
    if (Array.isArray(emotionFlow) && emotionFlow.length > 0) {
      if (typeof emotionFlow[0] === 'string') {
        // 문자열 배열인 경우
        emotions.push(...(emotionFlow as string[]).map(e => this.extractEmotions(e)).flat());
      } else {
        // EmotionFlowItem 배열인 경우
        for (const item of emotionFlow as EmotionFlowItem[]) {
          if (item.from) emotions.push(...this.extractEmotions(item.from));
          if (item.to) emotions.push(...this.extractEmotions(item.to));
        }
      }
    }

    // 감정이 없으면 기본값 반환
    if (emotions.length === 0) {
      return {
        entropy: 0,
        density: 0,
        transitions: 0,
        diversity: 0,
        dominantEmotionRatio: 0,
        dominantEmotion: '분석 불가'
      };
    }

    // Shannon Entropy 계산
    const entropy = this.calculateEntropy(emotions);
    
    // 감정 다양성 (유니크 감정 수 / 전체 감정 수)
    const uniqueEmotions = new Set(emotions);
    const diversity = uniqueEmotions.size / emotions.length;
    
    // 지배적 감정 비율
    const dominantEmotionRatio = this.getDominantEmotionRatio(emotions);
    
    // 지배적 감정 추출
    const dominantEmotion = this.getDominantEmotion(emotions);
    
    // 전이 수 (실제 감정 흐름 아이템 수)
    const transitions = emotionFlow.length;

    return {
      entropy,
      density: emotions.length / 100, // 임시: 텍스트 길이 대비 (실제로는 텍스트 길이 필요)
      transitions,
      diversity,
      dominantEmotionRatio,
      dominantEmotion
    };
  }

  /**
   * AI 감정 흐름에서 감정 단어 추출 (정확한 방법)
   */
  private extractEmotions(text: string): string[] {
    // AI가 생성한 감정 흐름은 "감정1 → 감정2: 설명" 형태
    const emotions: string[] = [];
    
    // 화살표로 구분된 감정들만 추출
    const arrowPattern = /([가-힣]+)\s*→\s*([가-힣]+)/g;
    let match;
    while ((match = arrowPattern.exec(text)) !== null) {
      const fromEmotion = match[1].trim();
      const toEmotion = match[2].trim();
      
      // 감정 단어가 2자 이상이고 의미있는 단어인지 확인
      if (fromEmotion.length >= 2 && this.isValidEmotion(fromEmotion)) {
        emotions.push(fromEmotion);
      }
      if (toEmotion.length >= 2 && this.isValidEmotion(toEmotion)) {
        emotions.push(toEmotion);
      }
    }

    return emotions;
  }

  /**
   * 유효한 감정 단어인지 확인
   */
  private isValidEmotion(word: string): boolean {
    // 일반적인 명사나 조사는 제외
    const excludeWords = [
      '그때', '이때', '그것', '이것', '그런', '이런', '저런', '어떤',
      '그냥', '그저', '그러나', '그런데', '그리고', '그래서', '그러면',
      '오늘', '어제', '내일', '지금', '이제', '그때', '언제', '항상',
      '아침', '점심', '저녁', '새벽', '낮', '밤', '오전', '오후',
      '집', '회사', '학교', '카페', '식당', '병원', '공원',
      '엄마', '아빠', '부모', '가족', '친구', '선배', '후배', '동료',
      '마음', '생각', '기분', '느낌', '기억', '추억', '상태', '시간',
      '조쉬', '건우', '민수', '영희', '철수', '지성' // 일반적인 이름들
    ];
    
    return !excludeWords.includes(word) && word.length >= 2;
  }

  /**
   * Shannon Entropy 계산
   */
  private calculateEntropy(emotions: string[]): number {
    if (emotions.length === 0) return 0;

    const emotionCounts = new Map<string, number>();
    
    // 빈도 계산
    for (const emotion of emotions) {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
    }

    // 확률 분포
    const probabilities = Array.from(emotionCounts.values())
      .map(count => count / emotions.length);

    // Shannon Entropy
    let entropy = -probabilities
      .map(p => p > 0 ? p * Math.log2(p) : 0)
      .reduce((sum, e) => sum + e, 0);

    // 정규화 (0~1 범위로)
    const maxEntropy = Math.log2(emotionCounts.size);
    if (maxEntropy > 0) {
      entropy = entropy / maxEntropy;
    }

    return Math.max(0, entropy);
  }

  /**
   * 지배적 감정의 비율 계산
   */
  private getDominantEmotionRatio(emotions: string[]): number {
    if (emotions.length === 0) return 0;

    const emotionCounts = new Map<string, number>();
    
    for (const emotion of emotions) {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
    }

    const maxCount = Math.max(...Array.from(emotionCounts.values()));
    return maxCount / emotions.length;
  }

  /**
   * 가장 많이 나타나는 감정 추출
   */
  private getDominantEmotion(emotions: string[]): string {
    if (emotions.length === 0) return '분석 불가';

    const emotionCounts = new Map<string, number>();
    
    for (const emotion of emotions) {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
    }

    // 가장 많이 나타나는 감정 찾기
    let maxCount = 0;
    let dominantEmotion = '분석 불가';
    
    for (const [emotion, count] of emotionCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    }

    return dominantEmotion;
  }
}

