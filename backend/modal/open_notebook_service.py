# backend/modal/open_notebook_service.py
"""
DayDif Content Generation Service - Open Notebook Edition
Generates AI-powered lesson content using OpenAI GPT-4
Based on Open Notebook (https://github.com/lfnovo/open-notebook) prompts

Two-stage podcast generation pipeline:
1. Generate outline with segments (outline.jinja inspired)
2. Generate transcript with multi-speaker dialogue per segment (transcript.jinja inspired)
"""
import modal
import json
from typing import Optional

app = modal.App("daydif-content")

# Image with content generation dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "openai",
        "jinja2",
        "httpx",
        "fastapi",
    )
)

# ============================================================================
# Episode Profiles - Speaker Configuration (Open Notebook style)
# Maps to Chatterbox TTS voice parameters
# ============================================================================

DEFAULT_EPISODE_PROFILE = {
    "speakers": [
        {
            "name": "Alex",
            "backstory": "A curious learner who asks great questions and helps break down complex topics for the audience.",
            "personality": "Enthusiastic, curious, relatable. Uses analogies and examples from everyday life. Asks clarifying questions that the audience might be thinking.",
            # Chatterbox TTS mapping
            "voice_params": {
                "exaggeration": 0.6,  # More expressive, enthusiastic
                "cfg_weight": 0.5,
            }
        },
        {
            "name": "Sam", 
            "backstory": "An expert educator who explains concepts clearly and engagingly. Has deep knowledge but makes it accessible.",
            "personality": "Knowledgeable, patient, warm. Breaks down complex ideas into simple terms. Uses metaphors and real-world examples.",
            # Chatterbox TTS mapping
            "voice_params": {
                "exaggeration": 0.4,  # More measured, authoritative
                "cfg_weight": 0.6,
            }
        },
    ],
    "style": "conversational",
    "min_turns_per_segment": 6,  # Increased from 4 for more content
}

# ============================================================================
# Prompt Templates (Ported from Open Notebook)
# ============================================================================

OUTLINE_PROMPT = """You are an AI assistant specialized in creating podcast outlines.
Your task is to create a detailed outline for a podcast episode based on the provided topic and context.

Here is the topic for the podcast episode:
<topic>
{{ topic }}
</topic>

{% if lesson_context %}
Additional context about this lesson:
<context>
{{ lesson_context }}
</context>
{% endif %}

The podcast will feature the following speakers:
<speakers>
{% for speaker in speakers %}
- **{{ speaker.name }}**: {{ speaker.backstory }}
  Personality: {{ speaker.personality }}
{% endfor %}
</speakers>

This is lesson {{ lesson_number }} of {{ total_lessons }} in a learning series.
{% if lesson_number == 1 %}
- This is the FIRST lesson: introduce the topic broadly, set expectations for the series.
{% elif lesson_number == total_lessons %}
- This is the FINAL lesson: wrap up the series comprehensively, summarize key learnings.
{% else %}
- Build on previous concepts, introduce new material progressively.
{% endif %}

Target duration: {{ duration_minutes }} minutes (approximately {{ words_estimate }} words total).

Please create an outline based on this topic. Your outline should consist of {{ num_segments }} main segments for the podcast episode.

Follow these guidelines:
1. Read the topic carefully and identify the main concepts to cover.
2. Create {{ num_segments }} distinct segments that build a complete learning journey.
3. For each segment, provide a clear and concise name that reflects its content.
4. Write a detailed description for each segment, explaining what will be discussed.
5. Consider the speaker personalities when planning segments - match content to speaker expertise.
6. Ensure that the segments flow logically from one to the next.
7. This is a whole podcast so no need to reintroduce speakers on each segment.
8. Include an introduction segment at the beginning and a conclusion segment at the end.
9. The size field determines how long the segment should be (affects word count).

Return your outline as JSON:
{
  "title": "Catchy episode title",
  "summary": "2-3 sentence description of what listeners will learn",
  "segments": [
    {
      "name": "Segment Name",
      "description": "What will be covered and key points to discuss",
      "size": "short|medium|long"
    }
  ],
  "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
}

Size guide:
- short: ~1-2 minutes (introduction, transitions, quick points)
- medium: ~2-3 minutes (main content segments)
- long: ~3-4 minutes (deep dives, complex explanations)

Return only valid JSON, no additional text."""


TRANSCRIPT_PROMPT = """You are an AI assistant specialized in creating podcast transcripts.
Your task is to generate a natural dialogue transcript for a specific segment of a podcast episode.

Here is the topic for the podcast:
<topic>
{{ topic }}
</topic>

{% if lesson_context %}
Additional context:
<context>
{{ lesson_context }}
</context>
{% endif %}

The podcast features the following speakers:
<speakers>
{% for speaker in speakers %}
- **{{ speaker.name }}**: {{ speaker.backstory }}
  Personality: {{ speaker.personality }}
{% endfor %}
</speakers>

Here is the full episode outline:
<outline>
{{ outline_json }}
</outline>

{% if previous_transcript %}
Here is the transcript so far (for continuity):
<previous_transcript>
{{ previous_transcript }}
</previous_transcript>
{% endif %}

{% if is_final_segment %}
This is the FINAL segment. Make sure to wrap up the conversation and provide a conclusion.
{% endif %}

You are creating dialogue for THIS segment only:
<segment>
Name: {{ segment_name }}
Description: {{ segment_description }}
Size: {{ segment_size }}
</segment>

Requirements:
- Use the actual speaker names ({{ speaker_names }}) to denote speakers.
- The transcript must have at least {{ min_turns }} turns of dialogue.
- Choose which speaker should speak based on their personality and expertise.
- Make the dialogue sound natural, conversational and engaging.
- Include relevant details that teach the topic effectively.
- Avoid long monologues; keep exchanges between speakers balanced.
- Match each speaker's dialogue to their personality.
{% if segment_size == "short" %}
- This is a SHORT segment: aim for 250-350 words total.
{% elif segment_size == "medium" %}
- This is a MEDIUM segment: aim for 400-550 words total.
{% else %}
- This is a LONG segment: go deep, aim for 600-800 words total.
{% endif %}

**CRITICAL LENGTH REQUIREMENT - MANDATORY:**
- Target audio length: {{ target_seconds }} seconds minimum (approximately {{ target_words }} words).
- You MUST generate at least {{ target_words }} words. This is NOT optional.
- Each speaker turn should be 2-4 sentences, NOT short one-liners.
- If you generate less than {{ target_words }} words, the lesson will be TOO SHORT.
- Expand with:
  * Detailed explanations with examples
  * Real-world analogies and scenarios
  * Follow-up questions and answers
  * "What if" situations
  * Brief summaries of key points
- Do NOT use filler; every word should teach something.

Return your transcript as JSON:
{
  "transcript": [
    {
      "speaker": "Alex",
      "dialogue": "Speaker's dialogue here..."
    },
    {
      "speaker": "Sam", 
      "dialogue": "Other speaker's response..."
    }
  ]
}

Return only valid JSON, no additional text."""


# ============================================================================
# Helper Functions
# ============================================================================

def render_template(template: str, **kwargs) -> str:
    """Render a Jinja2-style template with provided variables."""
    from jinja2 import Template
    return Template(template).render(**kwargs)


def calculate_segments(duration_minutes: int) -> int:
    """Calculate number of segments based on target duration."""
    # More segments = more content generated
    # Aim for ~2 minutes per segment to ensure sufficient content
    if duration_minutes <= 5:
        result = 3
    elif duration_minutes <= 8:
        result = 4
    elif duration_minutes <= 10:
        result = 5  # Increased from 4
    elif duration_minutes <= 15:
        result = 6  # Increased from 5
    elif duration_minutes <= 20:
        result = 7  # Increased from 6
    else:
        result = min(10, duration_minutes // 2)  # More segments for longer lessons
    
    print(f"📊 Duration {duration_minutes}min → {result} segments")
    return result


def estimate_words(duration_minutes: int) -> int:
    """Estimate total words needed (roughly 150 words per minute for natural speech)."""
    return duration_minutes * 150


def get_segment_duration_estimate(size: str, total_duration: int, num_segments: int) -> int:
    """Estimate segment duration in seconds based on size."""
    avg_per_segment = (total_duration * 60) / num_segments
    multipliers = {"short": 0.6, "medium": 1.0, "long": 1.4}
    return int(avg_per_segment * multipliers.get(size, 1.0))


def calculate_segment_turns(size: str, base_turns: int = 6) -> int:
    """Scale minimum dialogue turns with segment size for richer conversations."""
    # Increased base_turns from 4 to 6 for more content
    multipliers = {"short": 1.5, "medium": 2, "long": 3}
    return int(base_turns * multipliers.get(size, 2))


def _calculate_target_duration_seconds(outline: dict, segment_index: int) -> int:
    """Estimate per-segment duration so total lesson length matches request."""
    requested_minutes = outline.get("duration_minutes", 10) or 10
    segments = outline.get("segments", []) or []
    segment = segments[segment_index] if segment_index < len(segments) else {}

    # Increased floor from 60s to 90s to ensure minimum content per segment
    base_seconds = max(90, int((requested_minutes * 60) / max(1, len(segments))))
    size = segment.get("size", "medium")
    multipliers = {"short": 0.85, "medium": 1.0, "long": 1.2}
    result = int(base_seconds * multipliers.get(size, 1.0))
    
    print(f"🎯 Segment {segment_index}: requested={requested_minutes}min, base={base_seconds}s, size={size}, target={result}s")
    return result


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
    duration_minutes: int = 10,
    speakers: list = None,
    lesson_context: str = "",
) -> dict:
    """
    Stage 1: Generate lesson outline with segments.
    Based on Open Notebook's outline.jinja template.
    """
    import os
    from openai import OpenAI

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    # Use default speakers if none provided
    if not speakers:
        speakers = DEFAULT_EPISODE_PROFILE["speakers"]

    num_segments = calculate_segments(duration_minutes)
    words_estimate = estimate_words(duration_minutes)

    prompt = render_template(
        OUTLINE_PROMPT,
        topic=topic,
        lesson_number=lesson_number,
        total_lessons=total_lessons,
        duration_minutes=duration_minutes,
        speakers=speakers,
        num_segments=num_segments,
        words_estimate=words_estimate,
        lesson_context=lesson_context,
    )

    print(f"📋 Generating outline for: {topic}")
    print(f"   Duration: {duration_minutes} min, Segments: {num_segments}")

    response = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {
                "role": "system",
                "content": "You are an expert educational podcast creator. Return only valid JSON.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        max_tokens=2000,
        temperature=0.7,
    )

    outline = json.loads(response.choices[0].message.content)
    
    # Enrich outline with metadata
    outline["topic"] = topic
    outline["lesson_number"] = lesson_number
    outline["total_lessons"] = total_lessons
    outline["duration_minutes"] = duration_minutes
    outline["speakers"] = speakers

    print(f"✅ Outline created: {outline.get('title', 'Untitled')}")
    print(f"   Segments: {len(outline.get('segments', []))}")

    return outline


# ============================================================================
# Stage 2: Generate Segment Transcript (Open Notebook style)
# ============================================================================

@app.function(
    image=image,
    timeout=300,
    secrets=[modal.Secret.from_name("openai-secret")],
)
def generate_segment_transcript(
    topic: str,
    outline: dict,
    segment_index: int,
    previous_transcript: str = "",
    speakers: list = None,
    lesson_context: str = "",
) -> dict:
    """
    Stage 2: Generate dialogue transcript for a single segment.
    Based on Open Notebook's transcript.jinja template.
    """
    import os
    from openai import OpenAI

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    if not speakers:
        speakers = outline.get("speakers", DEFAULT_EPISODE_PROFILE["speakers"])

    segments = outline.get("segments", [])
    if segment_index >= len(segments):
        raise ValueError(f"Segment index {segment_index} out of range")

    segment = segments[segment_index]
    is_final = segment_index == len(segments) - 1
    
    # Get segment details
    segment_name = segment.get("name", f"Segment {segment_index + 1}")
    segment_description = segment.get("description", "")
    segment_size = segment.get("size", "medium")

    speaker_names = ", ".join([s["name"] for s in speakers])
    min_turns = calculate_segment_turns(segment_size, DEFAULT_EPISODE_PROFILE["min_turns_per_segment"])
    target_seconds = _calculate_target_duration_seconds(outline, segment_index)
    # Increased from 165 wpm to 180 wpm to generate more content
    target_words = max(300, int((target_seconds / 60) * 180))
    
    print(f"📝 Segment {segment_index}: min_turns={min_turns}, target_seconds={target_seconds}, target_words={target_words}")

    prompt = render_template(
        TRANSCRIPT_PROMPT,
        topic=topic,
        speakers=speakers,
        outline_json=json.dumps(outline, indent=2),
        previous_transcript=previous_transcript[-2000:] if previous_transcript else "",  # Last 2000 chars for context
        is_final_segment=is_final,
        segment_name=segment_name,
        segment_description=segment_description,
        segment_size=segment_size,
        speaker_names=speaker_names,
        min_turns=min_turns,
        lesson_context=lesson_context,
        target_seconds=target_seconds,
        target_words=target_words,
    )

    print(f"  🎤 Generating transcript for segment {segment_index + 1}: {segment_name}")

    response = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {
                "role": "system",
                "content": "You are an expert podcast scriptwriter creating natural, engaging dialogue. Generate LONG, substantive dialogue turns. Return only valid JSON.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        max_tokens=3500,  # Increased from 2000 for longer transcripts
        temperature=0.8,
    )

    result = json.loads(response.choices[0].message.content)
    transcript = result.get("transcript", [])

    print(f"  ✅ Generated {len(transcript)} dialogue turns")

    return {
        "segment_index": segment_index,
        "segment_name": segment_name,
        "segment_size": segment_size,
        "transcript": transcript,
        "duration_estimate_seconds": target_seconds,
    }


# ============================================================================
# Combined Generation: Full Lesson Content
# ============================================================================

@app.function(
    image=image,
    timeout=900,  # 15 minutes max
    secrets=[modal.Secret.from_name("openai-secret")],
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
    
    Returns structured content ready for Chatterbox TTS processing.
    """
    print(f"🎙️ Generating lesson: {topic} ({duration_minutes} min)")

    # Build lesson context from user level
    lesson_context = f"Target audience: {user_level} level learners."

    # Use custom speakers or defaults
    if not speakers:
        speakers = DEFAULT_EPISODE_PROFILE["speakers"]

    # Stage 1: Generate outline
    print("📋 Stage 1: Generating outline...")
    outline = generate_outline.remote(
        topic=topic,
        lesson_number=lesson_number,
        total_lessons=total_lessons,
        duration_minutes=duration_minutes,
        speakers=speakers,
        lesson_context=lesson_context,
    )

    # Stage 2: Generate transcript for each segment
    print("🎤 Stage 2: Generating transcripts...")
    segments_with_transcript = []
    accumulated_transcript = ""
    full_transcript = []

    for i, segment in enumerate(outline.get("segments", [])):
        # Generate transcript for this segment
        segment_result = generate_segment_transcript.remote(
            topic=topic,
            outline=outline,
            segment_index=i,
            previous_transcript=accumulated_transcript,
            speakers=speakers,
            lesson_context=lesson_context,
        )

        segment_transcript = segment_result["transcript"]
        transcript_text = " ".join([turn["dialogue"] for turn in segment_transcript]) or segment.get("description", "")

        # Build segment with transcript
        segment_data = {
            "type": "content" if i > 0 and i < len(outline["segments"]) - 1 else ("intro" if i == 0 else "outro"),
            "title": segment_result["segment_name"],
            "text": transcript_text,
            "transcript": segment_transcript,
            "duration_estimate": segment_result.get(
                "duration_estimate_seconds",
                get_segment_duration_estimate(
                    segment_result["segment_size"],
                    duration_minutes,
                    len(outline["segments"])
                ),
            ),
        }
        segments_with_transcript.append(segment_data)

        # Accumulate transcript for context
        for turn in segment_transcript:
            full_transcript.append(turn)
            accumulated_transcript += f"{turn['speaker']}: {turn['dialogue']}\n"

    # Calculate total word count for debugging
    total_words = sum(len(turn.get("dialogue", "").split()) for turn in full_transcript)
    estimated_audio_minutes = total_words / 130  # ~130 wpm speaking rate
    
    print(f"✅ Generated {len(full_transcript)} dialogue turns across {len(segments_with_transcript)} segments")
    print(f"📊 Total words: {total_words}, Estimated audio: {estimated_audio_minutes:.1f} min (target: {duration_minutes} min)")

    # Build final result (matches expected format for TTS service)
    result = {
        "title": outline.get("title", f"{topic} - Lesson {lesson_number}"),
        "summary": outline.get("summary", ""),
        "topic": topic,
        "lesson_number": lesson_number,
        "total_lessons": total_lessons,
        "duration_minutes": duration_minutes,
        "script": accumulated_transcript,
        "segments": segments_with_transcript,
        "full_transcript": full_transcript,
        "key_takeaways": outline.get("key_takeaways", []),
        "speakers": speakers,
    }

    return result


# ============================================================================
# HTTP Endpoints
# ============================================================================

@app.function(
    image=image,
    timeout=900,
    secrets=[modal.Secret.from_name("openai-secret")],
)
@modal.fastapi_endpoint(method="POST")
def generate_content(request: dict) -> dict:
    """
    HTTP endpoint for content generation.
    Compatible with existing generate-lesson edge function.
    
    Expected request:
    {
        "topic": "Machine Learning Basics",
        "lesson_number": 1,
        "total_lessons": 5,
        "user_level": "beginner",
        "duration_minutes": 10,
        "source_urls": [],
        "style": "conversational"
    }
    """
    try:
        topic = request.get("topic", "")
        lesson_number = request.get("lesson_number", 1)
        total_lessons = request.get("total_lessons", 1)
        user_level = request.get("user_level", "intermediate")
        duration_minutes = request.get("duration_minutes", 10)
        source_urls = request.get("source_urls", [])
        style = request.get("style", "conversational")
        speakers = request.get("speakers")

        if not topic:
            return {"success": False, "error": "Topic is required"}

        print(f"🎙️ Content generation request: {topic}")

        lesson = generate_lesson_content.remote(
            topic=topic,
            lesson_number=lesson_number,
            total_lessons=total_lessons,
            user_level=user_level,
            duration_minutes=duration_minutes,
            source_urls=source_urls,
            style=style,
            speakers=speakers,
        )

        return {
            "success": True,
            "lesson": lesson,
        }

    except Exception as e:
        import traceback
        print(f"❌ Content generation error: {traceback.format_exc()}")
        return {"success": False, "error": str(e)}


@app.function(image=image)
@modal.fastapi_endpoint(method="GET")
def health() -> dict:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "daydif-content-opennotebook",
        "version": "2.0",
        "features": [
            "open-notebook-prompts",
            "two-stage-generation",
            "multi-speaker-dialogue",
            "episode-profiles",
        ],
        "default_speakers": [s["name"] for s in DEFAULT_EPISODE_PROFILE["speakers"]],
    }


@app.function(image=image)
@modal.fastapi_endpoint(method="GET")
def get_episode_profile() -> dict:
    """Return the default episode profile configuration"""
    return {
        "profile": DEFAULT_EPISODE_PROFILE,
        "voice_params_info": {
            "exaggeration": "Controls expressiveness (0.0-1.0). Higher = more animated.",
            "cfg_weight": "Controls adherence to base voice (0.0-1.0). Higher = more consistent.",
        }
    }


# ============================================================================
# Local Development
# ============================================================================

if __name__ == "__main__":
    print("DayDif Content Service - Open Notebook Edition")
    print("Based on https://github.com/lfnovo/open-notebook")
    print("")
    print("Run with: modal serve open_notebook_service.py")
    print("Deploy with: modal deploy open_notebook_service.py")

