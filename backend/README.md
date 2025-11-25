# DayDif Backend Services

Backend services for AI-powered lesson generation and text-to-speech, running on [Modal](https://modal.com).

**Architecture inspired by [Open Notebook](https://github.com/lfnovo/open-notebook)** - an open-source implementation of NotebookLM with podcast generation capabilities.

## Services Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DayDif Backend Architecture                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │               Content Service (content_service.py)               ││
│  │  • Two-stage generation (Open Notebook style)                   ││
│  │  • Stage 1: Outline with segments                               ││
│  │  • Stage 2: Multi-speaker dialogue per segment                  ││
│  │  • Source ingestion: YouTube, Web                               ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                  TTS Service (tts_service.py)                    ││
│  │  • Chatterbox TTS on GPU                                        ││
│  │  • Multi-speaker dialogue support                               ││
│  │  • Voice profiles (Alex, Sam, custom)                           ││
│  │  • Direct upload to Supabase Storage                            ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

```bash
# Install Modal CLI
pip install modal

# Authenticate
modal token new

# Create secrets
modal secret create openai-secret OPENAI_API_KEY=sk-your-key
modal secret create supabase-secret \
  SUPABASE_URL=https://your-project.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Deploy Services

```bash
cd backend/modal

# Deploy Content Service
modal deploy content_service.py

# Deploy TTS Service  
modal deploy tts_service.py
```

### Test Services

```bash
# Update URLs in test script first
node scripts/test-backend.js
```

## Content Service

### Features (Open Notebook Aligned)

| Feature | Description |
|---------|-------------|
| Two-stage generation | Outline → Transcript pipeline |
| Multi-speaker dialogue | Alex (learner) + Sam (expert) |
| Source ingestion | YouTube transcripts, web articles |
| Segment structure | Intro, Content segments, Summary |

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/generate-content` | POST | Full lesson generation |
| `/generate-outline-only` | POST | Preview outline only |
| `/health` | GET | Health check |

### Request Example

```bash
curl -X POST https://your-username--daydif-content-generate-content.modal.run \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Introduction to Machine Learning",
    "lesson_number": 1,
    "total_lessons": 5,
    "user_level": "beginner",
    "duration_minutes": 10,
    "source_urls": ["https://example.com/ml-article"]
  }'
```

### Response Format

```json
{
  "success": true,
  "lesson": {
    "title": "Getting Started with Machine Learning",
    "summary": "A beginner-friendly introduction...",
    "segments": [
      {
        "type": "intro",
        "title": "Welcome",
        "transcript": [
          {"speaker": "Sam", "dialogue": "Welcome to..."},
          {"speaker": "Alex", "dialogue": "I'm excited..."}
        ]
      }
    ],
    "full_transcript": [...],
    "key_takeaways": ["ML learns from data", ...],
    "speakers": [
      {"name": "Alex", "voice_id": "p225"},
      {"name": "Sam", "voice_id": "p226"}
    ]
  }
}
```

## TTS Service

### Features

| Feature | Description |
|---------|-------------|
| Chatterbox TTS | High-quality neural TTS |
| Voice profiles | Different settings per speaker |
| Dialogue mode | Multi-speaker audio with pauses |
| Direct upload | Stores audio in Supabase Storage |

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/generate-tts` | POST | Generate audio (simple or dialogue) |
| `/generate-segment-audio` | POST | Process full segment |
| `/list-voices` | GET | Available voice profiles |
| `/health` | GET | Health check |

### Simple TTS Request

```bash
curl -X POST https://your-username--daydif-tts-generate-tts.modal.run \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, welcome to DayDif!",
    "speaker": "Sam"
  }'
```

### Multi-Speaker Dialogue Request

```bash
curl -X POST https://your-username--daydif-tts-generate-tts.modal.run \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": [
      {"speaker": "Sam", "dialogue": "Welcome to the lesson!"},
      {"speaker": "Alex", "dialogue": "Thanks Sam, excited to learn!"}
    ],
    "user_id": "user-123",
    "episode_id": "lesson-1-segment-0"
  }'
```

### Voice Profiles

| Voice | Personality | Settings |
|-------|-------------|----------|
| Alex | Enthusiastic learner | Higher expressiveness |
| Sam | Expert educator | Measured, authoritative |
| default | Balanced | Standard settings |

## Development

### Local Testing

```bash
# Serve locally (hot reload)
cd backend/modal
modal serve content_service.py
modal serve tts_service.py
```

### View Logs

```bash
modal app logs daydif-content
modal app logs daydif-tts
```

### Update Secrets

```bash
modal secret update openai-secret OPENAI_API_KEY=sk-new-key
```

## Cost Estimates

| Service | Resource | Cost |
|---------|----------|------|
| Content (GPT-4) | ~5K tokens/lesson | ~$0.15 |
| TTS (A10G GPU) | ~2 min/lesson | ~$0.03 |
| **Total per lesson** | | **~$0.18** |

## References

- [Open Notebook](https://github.com/lfnovo/open-notebook) - Architecture inspiration
- [Modal Docs](https://modal.com/docs) - Deployment platform
- [Chatterbox TTS](https://github.com/resemble-ai/chatterbox) - TTS model
