import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Audio, Video, ResizeMode } from "expo-av";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Colors, Fonts, DEMO_CAPTURE } from "@/constants/theme";
import { LiquidGlass } from "@/components/LiquidGlass";
import { LiquidBlob } from "@/components/LiquidBlob";
import { CircularProgress } from "@/components/CircularProgress";
import { SparkAnimation } from "@/components/SparkAnimation";
import { transcribeAudio, hasSpeechmaticsKey } from "@/lib/speechmatics";
import { rememberEntry } from "@/lib/cognee";
import {
  pickImage,
  pickVideo,
  pickDocument,
  persistMedia,
  buildMemoryText,
  MEDIA_ICONS,
  type PickedMedia,
} from "@/lib/media";

const { width, height } = Dimensions.get("window");
const MAX_RECORD_MS = 60000;

type Screen = "hub" | "voice" | "preview" | "processing" | "spark";
type VoicePhase = "ready" | "recording";

const CAPTURE_MODES = [
  {
    id: "voice" as const,
    icon: "🎙️",
    title: "Voice",
    desc: "Speak your memory — Speechmatics transcribes it",
  },
  {
    id: "photo" as const,
    icon: "📷",
    title: "Photo",
    desc: "Take or pick a photo from gallery",
  },
  {
    id: "video" as const,
    icon: "🎬",
    title: "Video",
    desc: "Record or import a video clip",
  },
  {
    id: "document" as const,
    icon: "📄",
    title: "PDF & Files",
    desc: "Attach PDFs, notes, or documents",
  },
];

export default function CaptureScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("hub");
  const [voicePhase, setVoicePhase] = useState<VoicePhase>("ready");
  const [statusText, setStatusText] = useState("");
  const [audioIntensity, setAudioIntensity] = useState(0);
  const [picked, setPicked] = useState<PickedMedia | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const meteringInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    bgOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));

  function cleanupRecording() {
    if (meteringInterval.current) clearInterval(meteringInterval.current);
    if (tickInterval.current) clearInterval(tickInterval.current);
    meteringInterval.current = null;
    tickInterval.current = null;
  }

  function handleBack() {
    cleanupRecording();
    if (recordingRef.current) recordingRef.current.stopAndUnloadAsync().catch(() => {});
    if (screen === "hub") router.back();
    else {
      setScreen("hub");
      setPicked(null);
      setCaption("");
      setVoicePhase("ready");
    }
  }

  async function handleModeSelect(mode: (typeof CAPTURE_MODES)[number]["id"]) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (mode === "voice") {
      setScreen("voice");
      return;
    }
    setBusy(true);
    try {
      let media: PickedMedia | null = null;
      if (mode === "photo") media = await pickImage(false);
      else if (mode === "video") media = await pickVideo(false);
      else media = await pickDocument();
      if (media) {
        setPicked(media);
        setCaption("");
        setScreen("preview");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleCameraQuick() {
    setBusy(true);
    try {
      const media = await pickImage(true);
      if (media) {
        setPicked(media);
        setScreen("preview");
      }
    } finally {
      setBusy(false);
    }
  }

  async function startRecording() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setStatusText("Allow microphone access in Settings");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = rec;
      setVoicePhase("recording");
      setStatusText("Recording… tap Stop when done");

      meteringInterval.current = setInterval(async () => {
        if (!recordingRef.current) return;
        try {
          const status = await recordingRef.current.getStatusAsync();
          if (status.isRecording && status.metering !== undefined) {
            setAudioIntensity(Math.min(1, Math.max(0, (status.metering + 60) / 60)));
          }
        } catch {
          /* stopped */
        }
      }, 100);

      tickInterval.current = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 10000);
    } catch {
      setStatusText("Could not start recording");
    }
  }

  async function stopRecording() {
    if (!recordingRef.current) return;
    cleanupRecording();
    setScreen("processing");
    setAudioIntensity(0);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;

    await new Promise((r) => setTimeout(r, 800));

    let text = DEMO_CAPTURE;
    try {
      if (uri && hasSpeechmaticsKey()) {
        setStatusText("Transcribing with Speechmatics…");
        text = await transcribeAudio(uri);
      } else {
        setStatusText("Demo transcript (add Speechmatics key for live STT)");
      }
    } catch {
      setStatusText("Using fallback transcript");
    }

    setStatusText("Saving to Cognee memory graph…");
    const entry = await rememberEntry(text, "voice", {
      mediaType: "voice",
      mediaUri: uri ?? undefined,
    });

    setScreen("spark");
    await new Promise((r) => setTimeout(r, 900));
    router.push({ pathname: "/bloom", params: { entryId: entry.entryId } });
  }

  async function saveMediaMemory() {
    if (!picked) return;
    setScreen("processing");
    setStatusText("Saving file and indexing in Cognee…");
    try {
      const savedUri = await persistMedia(picked);
      const text = buildMemoryText(picked, caption);
      const entry = await rememberEntry(text, picked.mediaType, {
        mediaType: picked.mediaType,
        mediaUri: savedUri,
        fileName: picked.fileName,
        caption: caption.trim() || undefined,
      });
      setScreen("spark");
      await new Promise((r) => setTimeout(r, 900));
      router.push({ pathname: "/bloom", params: { entryId: entry.entryId } });
    } catch {
      setStatusText("Save failed — try again");
      setScreen("preview");
    }
  }

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.bgGradient, bgStyle]}>
        <View style={styles.bgCenter} />
        <View style={styles.bgEdge} />
      </Animated.View>

      <Pressable style={styles.back} onPress={handleBack}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      {/* HUB — choose capture type */}
      {screen === "hub" && (
        <ScrollView contentContainerStyle={styles.hubContent}>
          <Animated.View entering={FadeIn.duration(400)}>
            <Text style={styles.hubTitle}>Add a memory</Text>
            <Text style={styles.hubSub}>
              Choose how you want to capture. Voice, photos, videos, and files all become searchable in your Cognee graph.
            </Text>
          </Animated.View>

          <View style={styles.modeGrid}>
            {CAPTURE_MODES.map((mode) => (
              <Pressable key={mode.id} onPress={() => handleModeSelect(mode.id)} disabled={busy}>
                <LiquidGlass style={styles.modeCard}>
                  <Text style={styles.modeIcon}>{mode.icon}</Text>
                  <Text style={styles.modeTitle}>{mode.title}</Text>
                  <Text style={styles.modeDesc}>{mode.desc}</Text>
                </LiquidGlass>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={handleCameraQuick} disabled={busy} style={styles.quickCam}>
            <Text style={styles.quickCamText}>📸 Quick camera photo</Text>
          </Pressable>

          {busy && <ActivityIndicator color={Colors.cognee} style={{ marginTop: 20 }} />}
        </ScrollView>
      )}

      {/* VOICE */}
      {screen === "voice" && (
        <View style={styles.center}>
          {voicePhase === "recording" && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.progressWrap}>
              <CircularProgress
                size={64}
                strokeWidth={2.5}
                duration={MAX_RECORD_MS}
                running
                onComplete={stopRecording}
              />
            </Animated.View>
          )}

          {voicePhase === "ready" ? (
            <Animated.View entering={FadeIn.duration(400)} style={styles.voiceReady}>
              <Text style={styles.voiceTitle}>Voice memory</Text>
              <Text style={styles.voiceSub}>
                Tap Start, then speak freely. Speechmatics converts your voice to text and Cognee stores it in your memory graph.
              </Text>
              <Pressable onPress={startRecording} style={styles.startBtn}>
                <LiquidGlass style={styles.startBtnInner} shimmer>
                  <Text style={styles.startBtnText}>Start recording</Text>
                </LiquidGlass>
              </Pressable>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(600)} style={styles.blobWrap}>
              <LiquidBlob size={200} intensity={audioIntensity} recording />
              <Pressable onPress={stopRecording} style={styles.stopArea}>
                <Text style={styles.stopHint}>Tap to stop & save</Text>
              </Pressable>
            </Animated.View>
          )}

          <Text style={styles.sttLabel}>
            {hasSpeechmaticsKey() ? "Speechmatics STT · Cognee Cloud" : "Demo mode — add API keys for live STT"}
          </Text>
        </View>
      )}

      {/* PREVIEW — photo / video / pdf */}
      {screen === "preview" && picked && (
        <ScrollView contentContainerStyle={styles.previewContent}>
          <Text style={styles.previewTitle}>
            {MEDIA_ICONS[picked.mediaType]} {picked.fileName}
          </Text>

          {picked.mediaType === "image" && (
            <Image source={{ uri: picked.uri }} style={styles.previewImage} resizeMode="cover" />
          )}
          {picked.mediaType === "video" && (
            <Video
              source={{ uri: picked.uri }}
              style={styles.previewVideo}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
            />
          )}
          {(picked.mediaType === "pdf" || picked.mediaType === "text") && (
            <LiquidGlass style={styles.fileCard}>
              <Text style={styles.fileIcon}>📄</Text>
              <Text style={styles.fileName}>{picked.fileName}</Text>
              <Text style={styles.fileHint}>File will be saved and indexed in Cognee for recall</Text>
            </LiquidGlass>
          )}

          <Text style={styles.captionLabel}>Add a note (optional)</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="What does this mean to you?"
            placeholderTextColor={Colors.textGhost}
            value={caption}
            onChangeText={setCaption}
            multiline
          />

          <Pressable onPress={saveMediaMemory}>
            <LiquidGlass style={styles.saveBtn} shimmer>
              <Text style={styles.saveBtnText}>Save to memory graph</Text>
            </LiquidGlass>
          </Pressable>
        </ScrollView>
      )}

      {/* PROCESSING / SPARK */}
      {(screen === "processing" || screen === "spark") && (
        <View style={styles.center}>
          {screen === "processing" && (
            <Animated.View entering={FadeIn.duration(300)}>
              <ActivityIndicator size="large" color={Colors.cognee} />
              <Text style={styles.statusText}>{statusText}</Text>
            </Animated.View>
          )}
          {screen === "spark" && <SparkAnimation visible />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgVoid },
  bgGradient: { ...StyleSheet.absoluteFillObject },
  bgCenter: {
    position: "absolute",
    top: height * 0.25,
    left: width * 0.15,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  bgEdge: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.bgVoid, opacity: 0.6 },
  back: { position: "absolute", top: 56, left: 24, zIndex: 10 },
  backText: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 14 },
  progressWrap: { position: "absolute", top: 52, right: 24, zIndex: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  hubContent: { paddingTop: 100, paddingHorizontal: 24, paddingBottom: 40 },
  hubTitle: {
    fontFamily: Fonts.display,
    fontSize: 32,
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  hubSub: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 22,
    marginBottom: 28,
  },
  modeGrid: { gap: 12 },
  modeCard: { padding: 20 },
  modeIcon: { fontSize: 28, marginBottom: 8 },
  modeTitle: { fontFamily: Fonts.bodyMedium, fontSize: 17, color: Colors.text, marginBottom: 4 },
  modeDesc: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  quickCam: { marginTop: 20, alignItems: "center", paddingVertical: 14 },
  quickCamText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.cognee },
  voiceReady: { alignItems: "center", paddingHorizontal: 8 },
  voiceTitle: {
    fontFamily: Fonts.display,
    fontSize: 26,
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  voiceSub: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  startBtn: { alignSelf: "stretch" },
  startBtnInner: { paddingVertical: 18, alignItems: "center", borderRadius: 999 },
  startBtnText: { fontFamily: Fonts.bodyMedium, fontSize: 16, color: Colors.text },
  blobWrap: { alignItems: "center" },
  stopArea: { marginTop: 40, paddingVertical: 16, paddingHorizontal: 32 },
  stopHint: { fontFamily: Fonts.body, fontSize: 13, color: Colors.textMuted },
  sttLabel: {
    position: "absolute",
    bottom: 40,
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textGhost,
    textAlign: "center",
  },
  previewContent: { paddingTop: 100, paddingHorizontal: 24, paddingBottom: 40 },
  previewTitle: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 16,
  },
  previewImage: {
    width: width - 48,
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: Colors.bgSurface,
  },
  previewVideo: {
    width: width - 48,
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: Colors.bgSurface,
  },
  fileCard: { padding: 32, alignItems: "center", marginBottom: 20 },
  fileIcon: { fontSize: 48, marginBottom: 12 },
  fileName: { fontFamily: Fonts.bodyMedium, fontSize: 15, color: Colors.text, textAlign: "center" },
  fileHint: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
  captionLabel: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textMuted, marginBottom: 8 },
  captionInput: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.bgGlassBorder,
    borderRadius: 12,
    padding: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 24,
    backgroundColor: Colors.bgSurface,
  },
  saveBtn: { paddingVertical: 18, alignItems: "center", borderRadius: 999 },
  saveBtnText: { fontFamily: Fonts.bodyMedium, fontSize: 16, color: Colors.text },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.cognee,
    textAlign: "center",
    marginTop: 16,
  },
});
