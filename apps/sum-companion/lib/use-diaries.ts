/**
 * Diary data hooks for sum-companion
 */

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './api';
import type { DiaryEntry, DiaryDetail, AnalysisResult } from './types';

interface DiaryListResponse {
  success: boolean;
  diaries: DiaryEntry[];
}

interface DiaryDetailResponse {
  success: boolean;
  diary: DiaryDetail;
  analysis: AnalysisResult | null;
}

export function useDiaries() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await apiFetch<DiaryListResponse>('/api/diary');

    if (fetchError) {
      setError(fetchError);
      setDiaries([]);
    } else if (data) {
      setDiaries(data.diaries);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { diaries, loading, error, refetch: fetch };
}

export function useDiaryDetail(id: string | null) {
  const [diary, setDiary] = useState<DiaryDetail | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await apiFetch<DiaryDetailResponse>(`/api/diary/${id}`);

    if (fetchError) {
      setError(fetchError);
      setDiary(null);
      setAnalysis(null);
    } else if (data) {
      setDiary(data.diary);
      setAnalysis(data.analysis);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { diary, analysis, loading, error, refetch: fetch };
}
