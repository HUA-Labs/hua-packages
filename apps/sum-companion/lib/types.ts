/** Diary list item (from GET /api/diary) */
export interface DiaryEntry {
  id: string;
  title: string | null;
  diaryDate: string;
  actualWrittenAt: string;
  is_delayed_entry: boolean;
  created_at: string;
  updated_at: string;
  analysisResult: {
    reflection_question: string | null;
    hasAnalysis: boolean;
  } | null;
}

/** Analysis data from diary detail */
export interface AnalysisResult {
  id: string;
  status: string;
  summary: string;
  emotion_flow: string[];
  reflection_question: string | null;
  interpretation: string | null;
  metadata: {
    mode: string | null;
    tone: string | null;
    tier_a: number | null;
    tier_m: number | null;
    slip: boolean | null;
    ethics: string[];
    confidence: number | null;
  };
  createdAt: string;
  completedAt: string | null;
}

/** Diary detail (from GET /api/diary/[id]) */
export interface DiaryDetail {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  diaryDate: string;
  actualWrittenAt: string;
  isDelayedEntry: boolean;
  author: {
    id: string;
    identifier: string;
  };
}

/** User info from token verify */
export interface UserInfo {
  id: string;
  name: string | null;
  image: string | null;
  identifier: string;
}
