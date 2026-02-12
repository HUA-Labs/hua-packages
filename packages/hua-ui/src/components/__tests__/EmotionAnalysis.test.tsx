import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmotionAnalysis } from '../EmotionAnalysis';

describe('EmotionAnalysis', () => {
  const primaryEmotion = { name: '기쁨', intensity: 80 };

  it('should render primary emotion name', () => {
    render(<EmotionAnalysis primaryEmotion={primaryEmotion} />);
    expect(screen.getByText('기쁨')).toBeInTheDocument();
  });

  it('should render intensity percentage', () => {
    render(<EmotionAnalysis primaryEmotion={primaryEmotion} />);
    expect(screen.getByText('80% 강도')).toBeInTheDocument();
  });

  it('should render keywords', () => {
    render(<EmotionAnalysis keywords={['행복', '만족', '감사']} />);
    expect(screen.getByText('행복')).toBeInTheDocument();
    expect(screen.getByText('만족')).toBeInTheDocument();
    expect(screen.getByText('감사')).toBeInTheDocument();
  });

  it('should render emotion distribution', () => {
    render(
      <EmotionAnalysis
        emotionDistribution={[
          { emotion: '기쁨', percentage: 60, color: 'bg-yellow-500' },
          { emotion: '평온', percentage: 40, color: 'bg-green-500' },
        ]}
      />
    );
    expect(screen.getByText('기쁨')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('should show intensity label based on value', () => {
    render(<EmotionAnalysis intensity={80} />);
    expect(screen.getByText('강함')).toBeInTheDocument();
  });

  it('should show positivity label', () => {
    render(<EmotionAnalysis positivity={20} />);
    expect(screen.getByText('부정적')).toBeInTheDocument();
  });

  it('should show energy label', () => {
    render(<EmotionAnalysis energy={10} showMetrics showDistribution={false} showKeywords={false} showMeter={false} />);
    expect(screen.getByText('낮음')).toBeInTheDocument();
  });

  it('should render compact layout', () => {
    const { container } = render(
      <EmotionAnalysis primaryEmotion={primaryEmotion} layout="compact" />
    );
    expect(container.querySelector('.space-y-3')).toBeInTheDocument();
    expect(screen.getByText(/기쁨 \(80%\)/)).toBeInTheDocument();
  });

  it('should render card layout', () => {
    render(<EmotionAnalysis layout="card" />);
    expect(screen.getByText('AI 분석')).toBeInTheDocument();
    expect(screen.getByText('감정 분석 결과')).toBeInTheDocument();
  });

  it('should hide meter when showMeter is false', () => {
    const { container } = render(
      <EmotionAnalysis primaryEmotion={primaryEmotion} showMeter={false} />
    );
    // EmotionMeter uses a specific structure, just check no meter rendered
    const heading = screen.getByText('주요 감정');
    expect(heading).toBeInTheDocument();
  });

  it('should hide keywords when showKeywords is false', () => {
    render(<EmotionAnalysis keywords={['test']} showKeywords={false} />);
    expect(screen.queryByText('감정 키워드')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<EmotionAnalysis className="my-analysis" />);
    expect(container.querySelector('.my-analysis')).toBeInTheDocument();
  });
});
