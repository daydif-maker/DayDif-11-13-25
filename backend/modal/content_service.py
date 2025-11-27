# backend/modal/content_service.py
"""
DayDif Content Generation Service
Generates AI-powered lesson content using OpenAI GPT-4
Inspired by Open Notebook (https://github.com/lfnovo/open-notebook)

Architecture aligned with Open Notebook's two-stage podcast generation:
1. Generate outline with segments
2. Generate transcript with multi-speaker dialogue per segment
"""
import modal
import json
from typing import Optional

app = modal.App("daydif-content")

# Image with content generation dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "ffmpeg")
    .pip_install(
        "openai",
        "anthropic",
        "httpx",
        "beautifulsoup4",
        "youtube-transcript-api",
        "pypdf2",
        "supabase",
        "jinja2",
        "fastapi",  # Required for Modal web endpoints
    )
)

# ============================================================================
# Speaker Configuration (Open Notebook style)
# ============================================================================

DEFAULT_SPEAKERS = [
    {
        "name": "Alex",
        "backstory": "A curious learner who asks great questions and helps break down complex topics.",
        "personality": "Enthusiastic, curious, relatable. Uses analogies and examples from everyday life.",
        "voice_id": "p225",  # For TTS
    },
    {
        "name": "Sam",
        "backstory": "An expert educator who explains concepts clearly and engagingly.",
        "personality": "Knowledgeable, patient, warm. Breaks down complex ideas into simple terms.",
        "voice_id": "p226",  # For TTS
    },
]

# ============================================================================
# Prompt Templates (Inspired by Open Notebook's Jinja templates)
# ============================================================================

OUTLINE_PROMPT = """You are an AI assistant specialized in creating educational podcast outlines.
Your task is to create a detailed outline for an educational audio lesson based on the provided topic and context.

**Topic:** {{ topic }}
**Lesson Number:** {{ lesson_number }} of {{ total_lessons }}
**Target Duration:** {{ duration_minutes }} minutes
**Audience Level:** {{ user_level }}

{% if source_context %}
**Reference Material:**
{{ source_context }}
{% endif %}

**Speakers:**
{% for speaker in speakers %}
- **{{ speaker.name }}**: {{ speaker.backstory }}
  Personality: {{ speaker.personality }}
{% endfor %}

Create an outline with {{ num_segments }} segments for this lesson. Follow these guidelines:

1. Include an engaging **introduction** that hooks the listener
2. Create **{{ num_segments - 2 }} content segments** covering key concepts
3. End with a **summary/conclusion** that reinforces key takeaways
4. Each segment should indicate its relative size (short/medium/long)
5. Consider this is lesson {{ lesson_number }} of {{ total_lessons }}:
{% if lesson_number == 1 %}
   - This is the FIRST lesson: introduce the topic broadly, set expectations
{% elif lesson_number == total_lessons %}
   - This is the FINAL lesson: wrap up the series comprehensively
{% else %}
   - Build on previous concepts, introduce new material progressively
{% endif %}

Return your outline as JSON:
{
  "title": "Catchy lesson title",
  "summary": "2-3 sentence description",
  "segments": [
    {
      "name": "Segment Name",
      "description": "What will be covered, key points to discuss",
      "size": "short|medium|long",
      "key_points": ["point 1", "point 2"]
    }
  ],
  "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
}

Return ONLY the JSON object, no additional text or code blocks."""

TRANSCRIPT_PROMPT = """You are creating a podcast-style educational transcript.
This will be converted to audio, so make it conversational and engaging.

**Lesson Context:**
- Title: {{ title }}
- Topic: {{ topic }}
- Audience: {{ user_level }} level learners
- This is lesson {{ lesson_number }} of {{ total_lessons }}

**Speakers:**
{% for speaker in speakers %}
- **{{ speaker.name }}**: {{ speaker.personality }}
{% endfor %}

**Full Outline:**
{{ outline_json }}

{% if previous_transcript %}
**Previous segments transcript (for context/continuity):**
{{ previous_transcript }}
{% endif %}

**Current Segment to Write:**
Name: {{ segment.name }}
Description: {{ segment.description }}
Size: {{ segment.size }}
Key Points: {{ segment.key_points | join(", ") }}

{% if is_final %}
This is the FINAL segment. Wrap up naturally, thank listeners, and if there are more lessons in the series, tease what's coming next.
{% endif %}

Guidelines:
- Create natural, conversational dialogue between {{ speakers | map(attribute='name') | join(' and ') }}
- Minimum {{ min_turns }} turns of dialogue for this segment
- Aim for ~{{ target_seconds }} seconds (about {{ target_words }} words); stay within ±15%
- Match each speaker's personality and expertise
- Use clear explanations, analogies, and examples
- Avoid jargon unless explained
- Make it engaging for commuters listening during their drive
- No need to re-introduce speakers each segment

Return as JSON:
{
  "segment_name": "{{ segment.name }}",
  "transcript": [
    {"speaker": "Speaker Name", "dialogue": "What they say..."},
    {"speaker": "Other Speaker", "dialogue": "Their response..."}
  ],
  "duration_estimate_seconds": {{ target_seconds }}
}

Return ONLY the JSON object, no additional text or code blocks."""


# ============================================================================
# Helper Functions
# ============================================================================

def extract_youtube_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from URL"""
    import re

    patterns = [
        r"(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]+)",
        r"(?:youtube\.com\/embed\/)([^&\n?]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def fetch_source_content(urls: list) -> str:
    """Fetch and extract content from source URLs"""
    import httpx
    from bs4 import BeautifulSoup

    contents = []
    for url in urls[:3]:  # Limit to 3 sources
        try:
            if "youtube.com" in url or "youtu.be" in url:
                from youtube_transcript_api import YouTubeTranscriptApi

                video_id = extract_youtube_id(url)
                if video_id:
                    transcript = YouTubeTranscriptApi.get_transcript(video_id)
                    text = " ".join([t["text"] for t in transcript])
                    contents.append(f"[YouTube Video]: {text[:3000]}")
            else:
                response = httpx.get(url, timeout=15, follow_redirects=True)
                soup = BeautifulSoup(response.text, "html.parser")
                for element in soup(["script", "style", "nav", "footer", "header"]):
                    element.decompose()
                text = soup.get_text(separator=" ", strip=True)
                contents.append(f"[Web Article]: {text[:3000]}")
        except Exception as e:
            print(f"Error fetching {url}: {e}")

    return "\n\n".join(contents)


def render_template(template_str: str, **kwargs) -> str:
    """Render a Jinja2-style template"""
    from jinja2 import Template
    template = Template(template_str)
    return template.render(**kwargs)


def calculate_segment_turns(size: str, base_turns: int = 4) -> int:
    """Calculate minimum dialogue turns based on segment size"""
    multipliers = {"short": 1, "medium": 2, "long": 3}
    return base_turns * multipliers.get(size, 2)


def _calculate_target_duration_seconds(outline: dict, segment_index: int) -> int:
    """Estimate per-segment duration so total matches requested lesson length."""
    requested_minutes = outline.get("duration_minutes", 10) or 10
    segments = outline.get("segments", []) or []
    segment = segments[segment_index] if segment_index < len(segments) else {}

    # Base duration is evenly split across segments with a 45s floor
    base_seconds = max(45, int((requested_minutes * 60) / max(1, len(segments))))

    # Weight by segment size to keep intros/summaries a bit shorter
    size = segment.get("size", "medium")
    multipliers = {"short": 0.8, "medium": 1.0, "long": 1.2}
    return int(base_seconds * multipliers.get(size, 1.0))


# ============================================================================
# Stage 1: Generate Outline (Open Notebook style)
# ============================================================================

@app.function(
    image=image,
    timeout=300,
    secrets=[modal.Secret.from_name("openai-secret")],
)
def generate_outline(
    topic: str,
    lesson_number: int = 1,
    total_lessons: int = 1,
    user_level: str = "intermediate",
    duration_minutes: int = 10,
    source_urls: list = None,
    speakers: list = None,
) -> dict:
    """
    Stage 1: Generate lesson outline with segments
    Inspired by Open Notebook's outline.jinja
    """
    import os
    from openai import OpenAI

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    # Use default speakers if none provided
    if not speakers:
        speakers = DEFAULT_SPEAKERS

    # Fetch source content
    source_context = ""
    if source_urls:
        source_context = fetch_source_content(source_urls)

    # Calculate number of segments based on duration
    # ~2-3 min per segment average
    num_segments = max(3, min(7, duration_minutes // 3))

    # Render the prompt
    prompt = render_template(
        OUTLINE_PROMPT,
        topic=topic,
        lesson_number=lesson_number,
        total_lessons=total_lessons,
        duration_minutes=duration_minutes,
        user_level=user_level,
        source_context=source_context,
        speakers=speakers,
        num_segments=num_segments,
    )

    response = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {
                "role": "system",
                "content": "You are an expert educational content creator. Return only valid JSON.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        max_tokens=2000,
        temperature=0.7,
    )

    outline = json.loads(response.choices[0].message.content)
    outline["topic"] = topic
    outline["lesson_number"] = lesson_number
    outline["total_lessons"] = total_lessons
    outline["duration_minutes"] = duration_minutes
    outline["speakers"] = speakers

    return outline


# ============================================================================
# Stage 2: Generate Transcript for Each Segment (Open Notebook style)
# ============================================================================

@app.function(
    image=image,
    timeout=300,
    secrets=[modal.Secret.from_name("openai-secret")],
)
def generate_segment_transcript(
    outline: dict,
    segment_index: int,
    previous_transcript: str = "",
    target_duration_seconds: int | None = None,
) -> dict:
    """
    Stage 2: Generate transcript for a single segment
    Inspired by Open Notebook's transcript.jinja
    """
    import os
    from openai import OpenAI

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    segment = outline["segments"][segment_index]
    is_final = segment_index == len(outline["segments"]) - 1
    speakers = outline.get("speakers", DEFAULT_SPEAKERS)

    # Calculate turns based on segment size
    min_turns = calculate_segment_turns(segment.get("size", "medium"))
    target_seconds = target_duration_seconds or _calculate_target_duration_seconds(
        outline, segment_index
    )
    target_words = int(target_seconds / 60 * 150)  # ~150 words per minute

    prompt = render_template(
        TRANSCRIPT_PROMPT,
        title=outline.get("title", ""),
        topic=outline.get("topic", ""),
        user_level=outline.get("user_level", "intermediate"),
        lesson_number=outline.get("lesson_number", 1),
        total_lessons=outline.get("total_lessons", 1),
        speakers=speakers,
        outline_json=json.dumps(outline, indent=2),
        previous_transcript=previous_transcript[-2000:] if previous_transcript else "",
        segment=segment,
        is_final=is_final,
        min_turns=min_turns,
        target_seconds=target_seconds,
        target_words=target_words,
    )

    response = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {
                "role": "system",
                "content": "You are an expert podcast script writer. Create natural, engaging dialogue. Return only valid JSON.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        max_tokens=2000,
        temperature=0.8,
    )

    return json.loads(response.choices[0].message.content)


# ============================================================================
# Combined Generation: Full Lesson Content (Open Notebook Pipeline)
# ============================================================================

@app.function(
    image=image,
    timeout=900,  # 15 minutes max
    secrets=[
        modal.Secret.from_name("openai-secret"),
        modal.Secret.from_name("supabase-secret"),
    ],
)
def generate_lesson_content(
    topic: str,
    lesson_number: int = 1,
    total_lessons: int = 1,
    user_level: str = "intermediate",
    duration_minutes: int = 10,
    source_urls: list = None,
    style: str = "conversational",
    speakers: list = None,
) -> dict:
    """
    Generate complete lesson content using Open Notebook-style two-stage process:
    1. Generate outline with segments
    2. Generate transcript for each segment with multi-speaker dialogue
    
    Returns structured content ready for TTS processing.
    """
    print(f"🎙️ Generating lesson: {topic} ({duration_minutes} min)")

    # Stage 1: Generate outline
    print("📋 Stage 1: Generating outline...")
    outline = generate_outline.remote(
        topic=topic,
        lesson_number=lesson_number,
        total_lessons=total_lessons,
        user_level=user_level,
        duration_minutes=duration_minutes,
        source_urls=source_urls,
        speakers=speakers,
    )
    print(f"✅ Outline created: {outline.get('title', 'Untitled')}")
    print(f"   Segments: {len(outline.get('segments', []))}")

    # Stage 2: Generate transcript for each segment
    print("🎤 Stage 2: Generating transcripts...")
    full_transcript = []
    segments_with_transcript = []
    accumulated_transcript = ""

    for i, segment in enumerate(outline.get("segments", [])):
        print(f"   Processing segment {i + 1}/{len(outline['segments'])}: {segment.get('name', 'Unknown')}")

        target_seconds = _calculate_target_duration_seconds(outline, i)
        segment_result = generate_segment_transcript.remote(
            outline=outline,
            segment_index=i,
            previous_transcript=accumulated_transcript,
            target_duration_seconds=target_seconds,
        )

        # Accumulate transcript for context
        segment_transcript = segment_result.get("transcript", [])
        for turn in segment_transcript:
            accumulated_transcript += f"\n{turn['speaker']}: {turn['dialogue']}"

        # Build combined segment text for TTS
        segment_text = " ".join([turn["dialogue"] for turn in segment_transcript])

        segments_with_transcript.append({
            "type": "intro" if i == 0 else ("summary" if i == len(outline["segments"]) - 1 else "content"),
            "title": segment.get("name", f"Part {i + 1}"),
            "text": segment_text,
            "transcript": segment_transcript,
            "duration_estimate": segment_result.get("duration_estimate_seconds", target_seconds),
            "key_points": segment.get("key_points", []),
        })

        full_transcript.extend(segment_transcript)

    print(f"✅ Generated {len(full_transcript)} dialogue turns across {len(segments_with_transcript)} segments")

    # Build final result
    result = {
        "title": outline.get("title", f"{topic} - Lesson {lesson_number}"),
        "summary": outline.get("summary", ""),
        "topic": topic,
        "lesson_number": lesson_number,
        "total_lessons": total_lessons,
        "duration_minutes": duration_minutes,
        "script": accumulated_transcript,  # Full script as text
        "segments": segments_with_transcript,
        "full_transcript": full_transcript,  # For advanced TTS with multiple voices
        "key_takeaways": outline.get("key_takeaways", []),
        "speakers": outline.get("speakers", DEFAULT_SPEAKERS),
    }

    return result


# ============================================================================
# HTTP Endpoints
# ============================================================================

@app.function(
    image=image, 
    timeout=900, 
    secrets=[modal.Secret.from_name("openai-secret")]
)
@modal.fastapi_endpoint(method="POST")
def generate_content(request: dict) -> dict:
    """HTTP endpoint for content generation"""
    try:
        topic = request.get("topic")
        if not topic:
            return {"success": False, "error": "Topic is required"}

        result = generate_lesson_content.remote(
            topic=topic,
            lesson_number=request.get("lesson_number", 1),
            total_lessons=request.get("total_lessons", 1),
            user_level=request.get("user_level", "intermediate"),
            duration_minutes=request.get("duration_minutes", 10),
            source_urls=request.get("source_urls", []),
            style=request.get("style", "conversational"),
            speakers=request.get("speakers"),  # Optional custom speakers
        )
        return {"success": True, "lesson": result}
    except Exception as e:
        import traceback
        print(f"Error generating content: {traceback.format_exc()}")
        return {"success": False, "error": str(e)}


@app.function(
    image=image,
    timeout=300,
    secrets=[modal.Secret.from_name("openai-secret")],
)
@modal.fastapi_endpoint(method="POST")
def generate_outline_only(request: dict) -> dict:
    """HTTP endpoint to generate only the outline (for preview)"""
    try:
        topic = request.get("topic")
        if not topic:
            return {"success": False, "error": "Topic is required"}

        outline = generate_outline.remote(
            topic=topic,
            lesson_number=request.get("lesson_number", 1),
            total_lessons=request.get("total_lessons", 1),
            user_level=request.get("user_level", "intermediate"),
            duration_minutes=request.get("duration_minutes", 10),
            source_urls=request.get("source_urls", []),
            speakers=request.get("speakers"),
        )
        return {"success": True, "outline": outline}
    except Exception as e:
        import traceback
        print(f"Error generating outline: {traceback.format_exc()}")
        return {"success": False, "error": str(e)}


@app.function(image=image)
@modal.fastapi_endpoint(method="GET")
def health() -> dict:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "daydif-content",
        "version": "2.0",
        "features": [
            "two-stage-generation",
            "multi-speaker-dialogue",
            "open-notebook-aligned",
        ],
    }


if __name__ == "__main__":
    print("DayDif Content Service v2.0")
    print("Aligned with Open Notebook (https://github.com/lfnovo/open-notebook)")
    print("")
    print("Run with: modal serve content_service.py")
    print("Deploy with: modal deploy content_service.py")
