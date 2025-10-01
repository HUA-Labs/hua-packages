/**
 * HUA Emotion Engine - 감정 시각화 모듈
 * 
 * 감정의 기하학을 시각적으로 표현하는 모듈
 */

import { EmotionCurve, EmotionCoordinates, EmotionTransition } from '../types/emotion';

export interface EmotionVisualizationData {
  chartData: any;
  radarData: any;
  timelineData: any;
  summary: string;
}

export class EmotionVisualizer {
  /**
   * 감정 곡선 차트 데이터 생성
   */
  generateChartData(curve: EmotionCurve): any {
    const labels = curve.timestamps.map((timestamp, index) => {
      const date = new Date(timestamp);
      return `${date.getMinutes()}:${date.getSeconds().toString().padStart(2, '0')}`;
    });

    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Valence (정서 극성)',
            data: curve.coordinates.map(coord => coord.valence),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Arousal (각성도)',
            data: curve.coordinates.map(coord => coord.arousal),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '시간'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Valence'
            },
            min: 0,
            max: 1
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Arousal'
            },
            min: 0,
            max: 1,
            grid: {
              drawOnChartArea: false
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: '감정 변화 곡선'
          },
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    };
  }

  /**
   * 감정 레이더 차트 데이터 생성
   */
  generateRadarData(coordinates: EmotionCoordinates, dominantEmotion: string): any {
    return {
      type: 'radar',
      data: {
        labels: ['Valence', 'Arousal', '복잡도', '강도', '안정성'],
        datasets: [
          {
            label: '감정 프로필',
            data: [
              coordinates.valence,
              coordinates.arousal,
              this.calculateComplexity(coordinates),
              this.calculateIntensity(coordinates),
              this.calculateStability(coordinates)
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `감정 프로필 - ${dominantEmotion}`
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 1
          }
        }
      }
    };
  }

  /**
   * 감정 타임라인 데이터 생성
   */
  generateTimelineData(curve: EmotionCurve): any {
    const timelineItems = curve.emotions.map((emotion, index) => {
      const timestamp = curve.timestamps[index];
      const coordinates = curve.coordinates[index];
      
      return {
        time: new Date(timestamp).toLocaleTimeString(),
        emotion,
        coordinates,
        color: this.getEmotionColor(coordinates),
        intensity: this.calculateIntensity(coordinates)
      };
    });

    return {
      items: timelineItems,
      transitions: curve.transitions.map((transition, index) => ({
        from: transition.from,
        to: transition.to,
        distance: transition.distance,
        direction: transition.direction,
        intensity: transition.intensity,
        color: this.getTransitionColor(transition)
      }))
    };
  }

  /**
   * 감정 시각화 요약 생성
   */
  generateSummary(curve: EmotionCurve, dominantEmotion: string): string {
    const totalEmotions = curve.emotions.length;
    const uniqueEmotions = new Set(curve.emotions).size;
    const avgValence = curve.coordinates.reduce((sum, coord) => sum + coord.valence, 0) / curve.coordinates.length;
    const avgArousal = curve.coordinates.reduce((sum, coord) => sum + coord.arousal, 0) / curve.coordinates.length;
    
    let summary = `총 ${totalEmotions}개의 감정이 감지되었으며, ${uniqueEmotions}가지의 서로 다른 감정이 나타났습니다. `;
    
    if (avgValence > 0.6) {
      summary += '전반적으로 긍정적인 감정이 주를 이루었습니다. ';
    } else if (avgValence < 0.4) {
      summary += '부정적인 감정이 많이 나타났습니다. ';
    } else {
      summary += '중립적인 감정 상태를 보였습니다. ';
    }

    if (avgArousal > 0.6) {
      summary += '감정의 강도가 높은 편이었습니다. ';
    } else if (avgArousal < 0.4) {
      summary += '차분하고 안정적인 감정 상태였습니다. ';
    }

    summary += `지배적인 감정은 '${dominantEmotion}'입니다.`;

    return summary;
  }

  /**
   * 종합 시각화 데이터 생성
   */
  generateVisualizationData(curve: EmotionCurve, dominantEmotion: string): EmotionVisualizationData {
    const avgCoordinates = this.calculateAverageCoordinates(curve.coordinates);
    
    return {
      chartData: this.generateChartData(curve),
      radarData: this.generateRadarData(avgCoordinates, dominantEmotion),
      timelineData: this.generateTimelineData(curve),
      summary: this.generateSummary(curve, dominantEmotion)
    };
  }

  /**
   * 감정 좌표의 복잡도 계산
   */
  private calculateComplexity(coordinates: EmotionCoordinates): number {
    // valence와 arousal의 차이로 복잡도 측정
    return Math.abs(coordinates.valence - coordinates.arousal);
  }

  /**
   * 감정 좌표의 강도 계산
   */
  private calculateIntensity(coordinates: EmotionCoordinates): number {
    // 원점에서의 거리로 강도 측정
    return Math.sqrt(coordinates.valence ** 2 + coordinates.arousal ** 2);
  }

  /**
   * 감정 좌표의 안정성 계산
   */
  private calculateStability(coordinates: EmotionCoordinates): number {
    // 중앙(0.5, 0.5)에서의 거리로 안정성 측정 (거리가 가까울수록 안정)
    const centerDistance = Math.sqrt(
      (coordinates.valence - 0.5) ** 2 + (coordinates.arousal - 0.5) ** 2
    );
    return 1 - centerDistance; // 0~1 범위로 정규화
  }

  /**
   * 감정 좌표에 따른 색상 반환
   */
  private getEmotionColor(coordinates: EmotionCoordinates): string {
    const { valence, arousal } = coordinates;
    
    // HSV 색상 공간 활용
    const hue = valence * 120; // 0~120 (빨강~초록)
    const saturation = 80;
    const lightness = 50 + (arousal * 30); // 50~80
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * 감정 전이에 따른 색상 반환
   */
  private getTransitionColor(transition: EmotionTransition): string {
    const intensity = Math.min(transition.intensity * 2, 1);
    const hue = transition.direction * 180 / Math.PI; // 라디안을 도로 변환
    
    return `hsla(${hue}, 70%, 50%, ${intensity})`;
  }

  /**
   * 평균 좌표 계산
   */
  private calculateAverageCoordinates(coordinates: EmotionCoordinates[]): EmotionCoordinates {
    if (coordinates.length === 0) {
      return { valence: 0.5, arousal: 0.5 };
    }

    const sumValence = coordinates.reduce((sum, coord) => sum + coord.valence, 0);
    const sumArousal = coordinates.reduce((sum, coord) => sum + coord.arousal, 0);

    return {
      valence: sumValence / coordinates.length,
      arousal: sumArousal / coordinates.length
    };
  }
}
