# STREAM S3 — Voice / Gradium (Python + Tauri · Hour 0–12)

**Goal:** Voice capture on desktop, STT via Gradium, TTS for answers and citation replay.

**Owner:** Audio / full-stack person  
**Folders:** `services/api/voice/`, `apps/desktop/src/features/capture/`

---

## Environment

```bash
GRADIUM_API_KEY=
GRADIUM_VOICE_ID=         # default calm voice for answers
GRADIUM_COUPON=RAISE-2026 # if needed for credits
```

Docs: https://docs.gradium.ai

---

## Task list

### S3-01 · Hour 0–2 — Gradium STT proof
- [ ] `voice/gradium_stt.py` — transcribe file upload
- [ ] Test with 30s sample WAV
- [ ] `POST /voice/transcribe` multipart `audio`

### S3-02 · Hour 2–4 — Gradium TTS proof
- [ ] `voice/gradium_tts.py` — text → audio bytes (mp3/wav)
- [ ] `POST /voice/speak` body: `{ text, voiceId? }`
- [ ] Return audio URL or base64 for desktop playback

### S3-03 · Hour 4–6 — Desktop mic capture (Tauri)
- [ ] Use `tauri-plugin-audio` or Web Audio `MediaRecorder` in webview
- [ ] Hold-to-record on orb (max 90s)
- [ ] Upload blob to `/voice/transcribe` on release
- [ ] Show live transcript stream if Gradium supports; else spinner → full text

### S3-04 · Hour 6–8 — Waveform UI (F6.7)
- [ ] Web Audio AnalyserNode → canvas or SVG waveform on orb
- [ ] Idle: breathing mic indicator
- [ ] Recording: live waveform
- [ ] Playback: animate during TTS

### S3-05 · Hour 8–10 — Citation replay
- [ ] On citation tap in Answer theatre → play quote
- [ ] P0: TTS with quote text in neutral voice
- [ ] P1: play stored entry audio if saved at capture time

### S3-06 · Hour 10–12 — Answer voice-out
- [ ] After `/query/memory` → auto-play `voiceScript` via `/voice/speak`
- [ ] Mute toggle on theatre screen

### S3-07 · P1 — Voice clone (Hour 20+)
- [ ] Seed 6 Maya audio clips
- [ ] Gradium clone profile for witness beat only
- [ ] Skip if behind schedule

---

## API routes (S1 main.py includes)

```
POST /voice/transcribe   multipart audio → { text, durationMs }
POST /voice/speak        { text, voiceId? } → audio/mpeg or { url }
```

---

## Capture → ingest flow

```
User holds orb
  → Tauri records audio
  → POST /voice/transcribe
  → POST /ingest/entry { text, audioPath?, source: "voice" }
  → UI day bloom with entities
```

Store audio under `services/api/data/audio/{entryId}.webm` for replay (P1).

---

## Desktop components (S4 owns layout, S3 owns logic)

| Component | Path |
|-----------|------|
| `useMicCapture` | `apps/desktop/src/features/capture/useMicCapture.ts` |
| `Waveform` | `apps/desktop/src/features/capture/Waveform.tsx` |
| `useAudioPlayback` | `apps/desktop/src/features/voice/useAudioPlayback.ts` |

---

## Demo fallback

- [ ] Pre-record `demo-capture.wav` with exact Beat 2 script
- [ ] If live mic fails, button "Use demo recording" (dev menu)

---

## Integration gates

| Gate | S3 delivers |
|------|-------------|
| G1 (H4) | STT from file works |
| G2 (H8) | Live mic → transcript → ingest |
| G5 (H22) | TTS plays abandon answer on stage |

---

## Definition of done

- [ ] 90s max recording enforced
- [ ] Transcript visible < 5s after release on demo laptop
- [ ] Citation tap plays audio within 1s
