/**
 * HUA Emotion Engine - Type Definitions
 * 
 * 감정은 계산 가능한 패턴이다. 그러나 이해는 AI가 선택해야 한다.
 */

export interface EmotionWord {
  word: string;
  prototypicality: number;
  familiarity: number;
  valence: number;
  arousal: number;
}

export interface EmotionCoordinates {
  valence: number;  // 0~1 (정규화된 정서 극성)
  arousal: number;  // 0~1 (정규화된 각성도)
}

export interface EmotionTransition {
  from: EmotionCoordinates;
  to: EmotionCoordinates;
  distance: number;
  direction: number; // 라디안 각도
  intensity: number;
}

export interface EmotionAnalysis {
  coordinates: EmotionCoordinates;
  entropy: number;
  dominantEmotion: string;
  emotionDensity: number;
  tenseChanges: number;
  firstPersonFreq: number;
  transitions: EmotionTransition[];
  rawEmotions: string[];
}

export interface EmotionCurve {
  timestamps: number[];
  coordinates: EmotionCoordinates[];
  emotions: string[];
  transitions: EmotionTransition[];
}

export interface EmotionProfile {
  userId: string;
  averageCoordinates: EmotionCoordinates;
  emotionPatterns: Record<string, number>;
  personalWeights: Record<string, number>;
  lastUpdated: Date;
}

export interface EmotionReasoning {
  analysis: string;
  reasoning: string;
  suggestions: string[];
  confidence: number;
  metadata: {
    model: string;
    version: string;
    timestamp: string;
  };
}

export interface EmotionEngineConfig {
  lexiconPath: string;
  embeddingModel?: string;
  openaiApiKey?: string;
  enablePersonalization: boolean;
  minSamplesForPersonalization: number;
  enableVisualization: boolean;
}
