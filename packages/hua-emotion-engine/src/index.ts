/**
 * HUA Emotion Engine - 메인 진입점
 * 
 * 감정은 계산 가능한 패턴이다. 그러나 이해는 AI가 선택해야 한다.
 */

export { EmotionLexicon } from './lexicon/emotion-lexicon';
export { EmotionAnalyzer } from './analyzer/emotion-analyzer';
export { AIEmotionAnalyzer } from './analyzer/ai-emotion-analyzer';
export { EmotionReasoner } from './reasoner/emotion-reasoner';
export { EmotionVisualizer } from './visualizer/emotion-visualizer';

export * from './types/emotion';

/**
 * HUA Emotion Engine 메인 클래스
 */
export class HUAEmotionEngine {
  private lexicon: any;
  private analyzer: any;
  private reasoner: any;
  private visualizer: any;

  constructor(config: {
    lexiconPath: string;
    openaiApiKey?: string;
    model?: string;
  }) {
    const { EmotionLexicon } = require('./lexicon/emotion-lexicon');
    const { EmotionAnalyzer } = require('./analyzer/emotion-analyzer');
    const { EmotionReasoner } = require('./reasoner/emotion-reasoner');
    const { EmotionVisualizer } = require('./visualizer/emotion-visualizer');
    
    this.lexicon = new EmotionLexicon(config.lexiconPath);
    this.analyzer = new EmotionAnalyzer(this.lexicon);
    this.reasoner = new EmotionReasoner(config.openaiApiKey, config.model);
    this.visualizer = new EmotionVisualizer();
  }

  /**
   * 텍스트 감정 분석 수행
   */
  async analyzeText(text: string) {
    const analysis = this.analyzer.analyzeText(text);
    const curve = this.analyzer.generateEmotionCurve(text);
    const reasoning = await this.reasoner.reasonAboutEmotions(text, analysis, curve);
    const visualization = this.visualizer.generateVisualizationData(curve, analysis.dominantEmotion);

    return {
      analysis,
      curve,
      reasoning,
      visualization
    };
  }

  /**
   * 감정 사전 접근
   */
  getLexicon() {
    return this.lexicon;
  }

  /**
   * 감정 분석기 접근
   */
  getAnalyzer() {
    return this.analyzer;
  }

  /**
   * AI 추론기 접근
   */
  getReasoner() {
    return this.reasoner;
  }

  /**
   * 시각화 도구 접근
   */
  getVisualizer() {
    return this.visualizer;
  }
}
