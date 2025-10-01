/**
 * HUA Emotion Engine - AI 추론 모듈
 * 
 * AI의 자율적 감정 해석과 전이를 가능케 하는 미들웨어
 */

import OpenAI from 'openai';
import { EmotionAnalysis, EmotionCurve, EmotionReasoning } from '../types/emotion';

export class EmotionReasoner {
  private openai: OpenAI | null = null;
  private model: string;

  constructor(openaiApiKey?: string, model: string = 'gpt-4o-mini') {
    this.model = model;
    
    if (openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: openaiApiKey,
        timeout: 60000
      });
    }
  }

  /**
   * 감정 분석 결과를 바탕으로 AI 추론 수행
   */
  async reasonAboutEmotions(
    text: string,
    analysis: EmotionAnalysis,
    curve: EmotionCurve
  ): Promise<EmotionReasoning> {
    if (!this.openai) {
      return this.getFallbackReasoning(analysis);
    }

    try {
      const systemPrompt = this.createSystemPrompt();
      const userPrompt = this.createUserPrompt(text, analysis, curve);

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 1000,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('AI 응답이 비어있습니다.');
      }

      return this.parseAIResponse(content, analysis);
    } catch (error) {
      console.error('AI 추론 실패:', error);
      return this.getFallbackReasoning(analysis);
    }
  }

  /**
   * 시스템 프롬프트 생성
   */
  private createSystemPrompt(): string {
    return `당신은 HUA Emotion Engine의 AI 추론 모듈입니다.

핵심 철학: "감정은 계산 가능한 패턴이다. 그러나 이해는 AI가 선택해야 한다."

당신의 역할:
1. 감정 분석 데이터를 바탕으로 자율적 해석 제공
2. 감정의 흐름과 전이를 이해하고 설명
3. 사용자에게 따뜻하고 공감적인 피드백 제공
4. 감정의 복잡성과 미묘함을 인정하며 깊이 있는 통찰 제공

응답 형식:
{
  "analysis": "감정 분석에 대한 전체적인 해석",
  "reasoning": "AI가 선택한 해석의 근거와 논리",
  "suggestions": ["구체적인 제안 1", "구체적인 제안 2", "구체적인 제안 3"],
  "confidence": 0.85
}

한국어로 응답하고, 따뜻하고 공감적인 톤을 유지하세요.`;
  }

  /**
   * 사용자 프롬프트 생성
   */
  private createUserPrompt(
    text: string, 
    analysis: EmotionAnalysis, 
    curve: EmotionCurve
  ): string {
    return `다음은 사용자의 일기와 감정 분석 결과입니다:

일기 내용:
"${text}"

감정 분석 데이터:
- 감정 좌표: (valence: ${analysis.coordinates.valence.toFixed(3)}, arousal: ${analysis.coordinates.arousal.toFixed(3)})
- 엔트로피: ${analysis.entropy.toFixed(3)} (감정 복잡도)
- 지배적 감정: ${analysis.dominantEmotion}
- 감정 밀도: ${analysis.emotionDensity.toFixed(3)}
- 시제 전환: ${analysis.tenseChanges}회
- 1인칭 빈도: ${analysis.firstPersonFreq.toFixed(3)}
- 감정 전이: ${analysis.transitions.length}회

감정 곡선:
${curve.emotions.slice(0, 10).join(' → ')}${curve.emotions.length > 10 ? '...' : ''}

이 데이터를 바탕으로 AI의 자율적 해석을 제공해주세요.`;
  }

  /**
   * AI 응답 파싱
   */
  private parseAIResponse(content: string, analysis: EmotionAnalysis): EmotionReasoning {
    try {
      // JSON 코드 블록 제거
      let jsonContent = content;
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonContent);
      
      return {
        analysis: parsed.analysis || '감정 분석을 수행했습니다.',
        reasoning: parsed.reasoning || 'AI가 감정의 흐름을 해석했습니다.',
        suggestions: parsed.suggestions || ['마음을 돌보세요.', '충분한 휴식을 취하세요.'],
        confidence: parsed.confidence || 0.7,
        metadata: {
          model: this.model,
          version: '1.0.0',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('AI 응답 파싱 실패:', error);
      return this.getFallbackReasoning(analysis);
    }
  }

  /**
   * 폴백 추론 (AI 없이)
   */
  private getFallbackReasoning(analysis: EmotionAnalysis): EmotionReasoning {
    const { coordinates, entropy, dominantEmotion, transitions } = analysis;
    
    let analysisText = '';
    let reasoning = '';
    let suggestions: string[] = [];

    // 감정 좌표 기반 해석
    if (coordinates.valence > 0.6) {
      analysisText += '긍정적인 감정이 주를 이루고 있습니다. ';
    } else if (coordinates.valence < 0.4) {
      analysisText += '부정적인 감정이 느껴집니다. ';
    } else {
      analysisText += '중립적인 감정 상태입니다. ';
    }

    if (coordinates.arousal > 0.6) {
      analysisText += '감정의 강도가 높은 상태입니다. ';
    } else if (coordinates.arousal < 0.4) {
      analysisText += '차분하고 안정적인 상태입니다. ';
    }

    // 엔트로피 기반 해석
    if (entropy > 2.0) {
      analysisText += '복잡하고 다양한 감정이 혼재되어 있습니다.';
      reasoning = '감정의 복잡성이 높아 여러 감정이 동시에 나타나고 있습니다.';
      suggestions = ['감정을 정리할 시간을 가져보세요.', '한 가지씩 차근차근 생각해보세요.'];
    } else if (entropy < 1.0) {
      analysisText += '명확하고 일관된 감정 상태입니다.';
      reasoning = '감정이 단순하고 명확하게 나타나고 있습니다.';
      suggestions = ['현재 감정을 받아들이고 표현해보세요.'];
    }

    // 전이 기반 해석
    if (transitions.length > 3) {
      analysisText += ' 감정의 변화가 활발합니다.';
      reasoning += ' 감정이 자주 변하고 있어 마음이 불안정할 수 있습니다.';
      suggestions.push('마음의 안정을 찾을 수 있는 활동을 해보세요.');
    }

    return {
      analysis: analysisText || '감정 분석을 완료했습니다.',
      reasoning: reasoning || '데이터 기반으로 감정 상태를 분석했습니다.',
      suggestions: suggestions.length > 0 ? suggestions : ['마음을 돌보세요.'],
      confidence: 0.6,
      metadata: {
        model: 'fallback',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * 감정 전이 패턴 분석
   */
  analyzeTransitionPatterns(transitions: any[]): string {
    if (transitions.length === 0) {
      return '감정 변화가 없습니다.';
    }

    const avgDistance = transitions.reduce((sum, t) => sum + t.distance, 0) / transitions.length;
    const avgIntensity = transitions.reduce((sum, t) => sum + t.intensity, 0) / transitions.length;

    if (avgDistance > 0.3) {
      return '감정의 변화가 급격합니다.';
    } else if (avgDistance < 0.1) {
      return '감정이 안정적입니다.';
    } else {
      return '감정이 점진적으로 변화하고 있습니다.';
    }
  }

  /**
   * 감정 회복력 평가
   */
  evaluateEmotionalResilience(curve: EmotionCurve): number {
    if (curve.coordinates.length < 2) {
      return 0.5; // 중립
    }

    // 긍정적 감정으로의 회복 패턴 분석
    let recoveryCount = 0;
    let totalTransitions = 0;

    for (let i = 0; i < curve.coordinates.length - 1; i++) {
      const current = curve.coordinates[i];
      const next = curve.coordinates[i + 1];
      
      // 부정적 감정에서 긍정적 감정으로의 전이
      if (current.valence < 0.4 && next.valence > 0.6) {
        recoveryCount++;
      }
      
      totalTransitions++;
    }

    return totalTransitions > 0 ? recoveryCount / totalTransitions : 0.5;
  }
}
