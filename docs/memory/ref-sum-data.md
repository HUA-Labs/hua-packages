---
name: ref-sum-data
description: sum-data 분석 레포 참조 — 구조, 지표, Docker 세팅
type: reference
---

## sum-data 레포

- **위치**: `D:/HUA/sum-data/` (로컬), `github.com/HUA-Labs/sum-data` (remote, private)
- **용도**: my-app 감정 데이터 분석 + AI 리터러시 실습
- **팀원**: forkgmltnr (collaborator, push 권한)

### 구조

```
sum-data/
├── CLAUDE.md                     # 지표 레퍼런스 + 가이드
├── .claude/skills/               # commit, eda, query, notebook, viz, create-skill
├── docker-compose.yml            # PG17(:5433) + Jupyter Lab(:8888)
├── docker/init.sql               # 스키마 + 샘플 데이터 (5유저, 10일기, 9분석)
├── notebooks/01-llm-api-basics.ipynb
├── src/etl/db.py                 # DB 연결 (SELECT only 강제)
├── src/llm/client.py             # OpenAI/Anthropic 래퍼
└── requirements.txt              # pandas, sklearn, jupyter, streamlit 등
```

### 포함된 감정 지표

CLAUDE.md에 전체 정리됨: sentiment_score, affect_tier, momentum_tier, slip, entropy, emotion_density, ai_transitions, approach_avoidance, 14개 EmotionTag 등
