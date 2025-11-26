# backend/modal/tts_service.py
"""
DayDif TTS Service
Converts text to speech using Chatterbox TTS on Modal GPU
Supports multi-speaker dialogue aligned with Open Notebook-style content
"""
import modal
from typing import Optional

app = modal.App("daydif-tts")

# Build container image with Chatterbox TTS dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "git")
    .pip_install("numpy<1.26.0")  # Install numpy first (required by pkuseg)
    .pip_install(
        "chatterbox-tts",  # Chatterbox TTS from Resemble AI
        "soundfile",
        "scipy",
        "supabase",
        "pydub",  # For audio concatenation
        "fastapi",  # Required for Modal web endpoints
    )
)

# Voice profiles for multi-speaker support
# Chatterbox uses exaggeration and cfg_weight for voice variation
VOICE_PROFILES = {
    "Alex": {
        "exaggeration": 0.6,  # More expressive, enthusiastic
        "cfg_weight": 0.5,
        "description": "Enthusiastic learner voice",
    },
    "Sam": {
        "exaggeration": 0.4,  # More measured, authoritative
        "cfg_weight": 0.6,
        "description": "Expert educator voice",
    },
    "default": {
        "exaggeration": 0.5,
        "cfg_weight": 0.5,
        "description": "Balanced default voice",
    },
}


@app.cls(
    image=image,
    gpu="A10G",  # Chatterbox works best with A10G
    timeout=600,
    secrets=[modal.Secret.from_name("supabase-secret")],
    scaledown_window=300,  # Keep warm for 5 minutes
)
class TTSGenerator:
    """Chatterbox TTS Generator class that loads model once and reuses"""

    @modal.enter()
    def load_model(self):
        """Load Chatterbox TTS model when container starts"""
        from chatterbox.tts import ChatterboxTTS

        self.model = ChatterboxTTS.from_pretrained(device="cuda")
        print("✅ Chatterbox TTS Model loaded")

    @modal.method()
    def generate_audio(
        self,
        text: str,
        exaggeration: float = 0.5,
        cfg_weight: float = 0.5,
    ) -> bytes:
        """Generate audio bytes from text using Chatterbox"""
        import soundfile as sf
        import io

        # Generate audio waveform with Chatterbox
        wav = self.model.generate(
            text=text,
            exaggeration=exaggeration,
            cfg_weight=cfg_weight,
        )

        # Convert tensor to numpy and save as WAV bytes
        audio_np = wav.squeeze().cpu().numpy()
        buffer = io.BytesIO()
        sf.write(buffer, audio_np, 24000, format="WAV")  # Chatterbox uses 24kHz
        buffer.seek(0)

        return buffer.read()

    @modal.method()
    def generate_dialogue_audio(
        self,
        transcript: list,
        voice_profiles: dict = None,
    ) -> bytes:
        """
        Generate audio for multi-speaker dialogue transcript.
        
        Args:
            transcript: List of {"speaker": "Name", "dialogue": "Text"} objects
            voice_profiles: Optional custom voice profiles for speakers
        
        Returns:
            Combined audio bytes as WAV
        """
        from pydub import AudioSegment
        import io

        if voice_profiles is None:
            voice_profiles = VOICE_PROFILES

        audio_segments = []
        silence = AudioSegment.silent(duration=300)  # 300ms pause between speakers

        for i, turn in enumerate(transcript):
            speaker = turn.get("speaker", "default")
            dialogue = turn.get("dialogue", "")

            if not dialogue.strip():
                continue

            # Get voice profile for speaker
            profile = voice_profiles.get(speaker, voice_profiles.get("default", VOICE_PROFILES["default"]))

            print(f"  Generating audio for {speaker}: {dialogue[:50]}...")

            # Generate audio for this turn
            audio_bytes = self.generate_audio(
                text=dialogue,
                exaggeration=profile.get("exaggeration", 0.5),
                cfg_weight=profile.get("cfg_weight", 0.5),
            )

            # Convert to AudioSegment
            audio = AudioSegment.from_wav(io.BytesIO(audio_bytes))
            audio_segments.append(audio)

            # Add silence between speakers (except after last turn)
            if i < len(transcript) - 1:
                audio_segments.append(silence)

        # Combine all segments
        if not audio_segments:
            # Return silent audio if nothing to combine
            return AudioSegment.silent(duration=1000).export(format="wav").read()

        combined = audio_segments[0]
        for segment in audio_segments[1:]:
            combined += segment

        # Export to WAV bytes
        buffer = io.BytesIO()
        combined.export(buffer, format="wav")
        buffer.seek(0)

        return buffer.read()

    @modal.method()
    def generate_and_upload(
        self,
        text: str,
        user_id: str,
        episode_id: str,
        exaggeration: float = 0.5,
        cfg_weight: float = 0.5,
    ) -> str:
        """Generate audio and upload to Supabase Storage"""
        import os
        from supabase import create_client

        # Generate audio
        audio_bytes = self.generate_audio(text, exaggeration, cfg_weight)

        # Connect to Supabase
        supabase = create_client(
            os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"]
        )

        # Upload path: {user_id}/{episode_id}.wav
        file_path = f"{user_id}/{episode_id}.wav"

        # Upload to storage
        result = supabase.storage.from_("lesson-audio").upload(
            path=file_path,
            file=audio_bytes,
            file_options={"content-type": "audio/wav"},
        )

        # Get public URL
        url = supabase.storage.from_("lesson-audio").get_public_url(file_path)

        return url

    @modal.method()
    def generate_dialogue_and_upload(
        self,
        transcript: list,
        user_id: str,
        episode_id: str,
        voice_profiles: dict = None,
    ) -> str:
        """
        Generate multi-speaker dialogue audio and upload to Supabase Storage.
        
        Args:
            transcript: List of {"speaker": "Name", "dialogue": "Text"} objects
            user_id: User ID for storage path
            episode_id: Episode ID for storage path
            voice_profiles: Optional custom voice profiles
        
        Returns:
            Public URL of uploaded audio
        """
        import os
        from supabase import create_client

        # Generate combined dialogue audio
        audio_bytes = self.generate_dialogue_audio(transcript, voice_profiles)

        # Connect to Supabase
        supabase = create_client(
            os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"]
        )

        # Upload path: {user_id}/{episode_id}.wav
        file_path = f"{user_id}/{episode_id}.wav"

        # Upload to storage
        result = supabase.storage.from_("lesson-audio").upload(
            path=file_path,
            file=audio_bytes,
            file_options={"content-type": "audio/wav"},
        )

        # Get public URL
        url = supabase.storage.from_("lesson-audio").get_public_url(file_path)

        return url


# ============================================================================
# HTTP Endpoints - These load the model directly for better reliability
# ============================================================================

@app.function(
    image=image,
    gpu="A10G",
    timeout=600,
    secrets=[modal.Secret.from_name("supabase-secret")],
)
@modal.fastapi_endpoint(method="POST")
def generate_tts(request: dict) -> dict:
    """
    HTTP endpoint for TTS generation.
    
    Supports two modes:
    1. Simple text-to-speech: {"text": "...", "speaker": "Sam"}
    2. Multi-speaker dialogue: {"transcript": [...]}
    
    For storage upload, also include: {"user_id": "...", "episode_id": "..."}
    """
    import base64
    import io
    import soundfile as sf
    from chatterbox.tts import ChatterboxTTS
    from pydub import AudioSegment
    
    text = request.get("text", "")
    transcript = request.get("transcript")  # For multi-speaker mode
    user_id = request.get("user_id")
    episode_id = request.get("episode_id")
    exaggeration = request.get("exaggeration", 0.5)
    cfg_weight = request.get("cfg_weight", 0.5)
    voice_profiles = request.get("voice_profiles") or VOICE_PROFILES
    speaker = request.get("speaker")  # Optional speaker name for simple mode

    try:
        # Load model
        print("🔄 Loading Chatterbox TTS model...")
        model = ChatterboxTTS.from_pretrained(device="cuda")
        print("✅ Model loaded")
        
        def generate_single_audio(text_to_speak: str, exag: float, cfg: float) -> bytes:
            """Generate audio for a single piece of text"""
            wav = model.generate(text=text_to_speak, exaggeration=exag, cfg_weight=cfg)
            audio_np = wav.squeeze().cpu().numpy()
            buffer = io.BytesIO()
            sf.write(buffer, audio_np, 24000, format="WAV")
            buffer.seek(0)
            return buffer.read()
        
        def upload_to_supabase(audio_bytes: bytes, uid: str, eid: str) -> str:
            """Upload audio to Supabase storage and update episode record"""
            import os
            from supabase import create_client
            
            supabase = create_client(
                os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"]
            )
            file_path = f"{uid}/{eid}.wav"
            supabase.storage.from_("lesson-audio").upload(
                path=file_path,
                file=audio_bytes,
                file_options={"content-type": "audio/wav"},
            )
            audio_url = supabase.storage.from_("lesson-audio").get_public_url(file_path)
            
            # Update the episode record with the audio path
            print(f"📝 Updating episode {eid} with audio_path...")
            update_result = supabase.table("episodes").update({
                "audio_path": audio_url
            }).eq("id", eid).execute()
            
            if update_result.data:
                print(f"✅ Episode {eid} updated with audio_path")
                
                # Get the lesson_id from this episode to check if all episodes are done
                episode_data = supabase.table("episodes").select("lesson_id").eq("id", eid).single().execute()
                if episode_data.data and episode_data.data.get("lesson_id"):
                    lesson_id = episode_data.data["lesson_id"]
                    check_and_complete_lesson(supabase, lesson_id)
            else:
                print(f"⚠️ Failed to update episode {eid}")
            
            return audio_url
        
        def check_and_complete_lesson(supabase, lesson_id: str):
            """Check if all episodes for a lesson have audio and mark lesson as completed"""
            print(f"🔍 Checking if all episodes for lesson {lesson_id} have audio...")
            
            # Get all episodes for this lesson
            episodes_result = supabase.table("episodes").select("id, audio_path").eq("lesson_id", lesson_id).execute()
            
            if not episodes_result.data:
                print(f"⚠️ No episodes found for lesson {lesson_id}")
                return
            
            episodes = episodes_result.data
            total_episodes = len(episodes)
            episodes_with_audio = sum(1 for ep in episodes if ep.get("audio_path"))
            
            print(f"📊 Lesson {lesson_id}: {episodes_with_audio}/{total_episodes} episodes have audio")
            
            # If all episodes have audio, mark lesson as completed
            if episodes_with_audio == total_episodes:
                print(f"🎉 All episodes ready! Marking lesson {lesson_id} as completed...")
                supabase.table("plan_lessons").update({
                    "status": "completed"
                }).eq("id", lesson_id).execute()
                print(f"✅ Lesson {lesson_id} marked as completed")

        # Mode 1: Multi-speaker dialogue
        if transcript and isinstance(transcript, list):
            print(f"🎙️ Generating multi-speaker dialogue ({len(transcript)} turns)...")
            
            audio_segments = []
            silence = AudioSegment.silent(duration=300)  # 300ms pause

            for i, turn in enumerate(transcript):
                turn_speaker = turn.get("speaker", "default")
                dialogue = turn.get("dialogue", "")

                if not dialogue.strip():
                    continue

                # Get voice profile for speaker
                profile = voice_profiles.get(turn_speaker, voice_profiles.get("default", VOICE_PROFILES["default"]))

                print(f"  [{i+1}/{len(transcript)}] {turn_speaker}: {dialogue[:40]}...")

                # Generate audio for this turn
                audio_bytes = generate_single_audio(
                    dialogue,
                    profile.get("exaggeration", 0.5),
                    profile.get("cfg_weight", 0.5),
                )

                # Convert to AudioSegment
                audio = AudioSegment.from_wav(io.BytesIO(audio_bytes))
                audio_segments.append(audio)

                # Add silence between speakers
                if i < len(transcript) - 1:
                    audio_segments.append(silence)

            # Combine all segments
            if not audio_segments:
                combined_bytes = AudioSegment.silent(duration=1000).export(format="wav").read()
            else:
                combined = audio_segments[0]
                for segment in audio_segments[1:]:
                    combined += segment
                buffer = io.BytesIO()
                combined.export(buffer, format="wav")
                buffer.seek(0)
                combined_bytes = buffer.read()
            
            print(f"✅ Combined audio: {len(combined_bytes)} bytes")
            
            if user_id and episode_id:
                url = upload_to_supabase(combined_bytes, user_id, episode_id)
                return {"success": True, "audio_url": url, "mode": "dialogue"}
            else:
                return {
                    "success": True,
                    "audio_base64": base64.b64encode(combined_bytes).decode(),
                    "mode": "dialogue",
                }

        # Mode 2: Simple text-to-speech
        if not text:
            return {"success": False, "error": "No text or transcript provided"}

        # Apply speaker voice profile if specified
        if speaker and speaker in VOICE_PROFILES:
            profile = VOICE_PROFILES[speaker]
            exaggeration = profile.get("exaggeration", exaggeration)
            cfg_weight = profile.get("cfg_weight", cfg_weight)

        print(f"🎙️ Generating simple TTS for: {text[:50]}...")
        audio_bytes = generate_single_audio(text, exaggeration, cfg_weight)
        print(f"✅ Audio generated: {len(audio_bytes)} bytes")

        if user_id and episode_id:
            url = upload_to_supabase(audio_bytes, user_id, episode_id)
            return {"success": True, "audio_url": url, "mode": "simple"}
        else:
            return {
                "success": True,
                "audio_base64": base64.b64encode(audio_bytes).decode(),
                "mode": "simple",
            }
    except Exception as e:
        import traceback
        print(f"TTS Error: {traceback.format_exc()}")
        return {"success": False, "error": str(e)}


@app.function(
    image=image,
    gpu="A10G",
    timeout=900,  # Longer timeout for full segment
    secrets=[modal.Secret.from_name("supabase-secret")],
)
@modal.fastapi_endpoint(method="POST")
def generate_segment_audio(request: dict) -> dict:
    """
    Generate audio for a full lesson segment with dialogue.
    
    Expected request:
    {
        "segment": {
            "title": "Segment Name",
            "transcript": [
                {"speaker": "Alex", "dialogue": "..."},
                {"speaker": "Sam", "dialogue": "..."}
            ]
        },
        "user_id": "...",
        "lesson_id": "...",
        "segment_index": 0
    }
    """
    segment = request.get("segment", {})
    transcript = segment.get("transcript", [])
    user_id = request.get("user_id")
    lesson_id = request.get("lesson_id")
    segment_index = request.get("segment_index", 0)
    voice_profiles = request.get("voice_profiles") or VOICE_PROFILES

    if not transcript:
        return {"success": False, "error": "No transcript in segment"}

    if not user_id or not lesson_id:
        return {"success": False, "error": "user_id and lesson_id required"}

    episode_id = f"{lesson_id}_segment_{segment_index}"

    # Delegate to generate_tts with the transcript
    result = generate_tts.local({
        "transcript": transcript,
        "user_id": user_id,
        "episode_id": episode_id,
        "voice_profiles": voice_profiles,
    })
    
    if result.get("success"):
        result["segment_title"] = segment.get("title", "")
        result["segment_index"] = segment_index
        result["turn_count"] = len(transcript)
    
    return result


@app.function(image=image)
@modal.fastapi_endpoint(method="GET")
def health() -> dict:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "daydif-tts",
        "model": "chatterbox",
        "version": "2.0",
        "features": [
            "single-speaker",
            "multi-speaker-dialogue",
            "voice-profiles",
            "segment-generation",
        ],
        "voice_profiles": list(VOICE_PROFILES.keys()),
    }


@app.function(image=image)
@modal.fastapi_endpoint(method="GET")
def list_voices() -> dict:
    """List available voice profiles"""
    return {
        "voices": {
            name: {
                "description": profile["description"],
                "exaggeration": profile["exaggeration"],
                "cfg_weight": profile["cfg_weight"],
            }
            for name, profile in VOICE_PROFILES.items()
        }
    }


if __name__ == "__main__":
    print("DayDif TTS Service v2.0")
    print("Supports multi-speaker dialogue aligned with Open Notebook")
    print("")
    print("Run with: modal serve tts_service.py")
    print("Deploy with: modal deploy tts_service.py")
