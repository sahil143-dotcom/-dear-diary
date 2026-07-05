import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";

const REGION_MAP: Record<string, string> = {
  eu: "https://asr.api.speechmatics.com/v2",
  usa: "https://us.asr.api.speechmatics.com/v2",
  au: "https://au.asr.api.speechmatics.com/v2",
};

function getApiKey(): string {
  return (
    process.env.EXPO_PUBLIC_SPEECHMATICS_API_KEY ||
    Constants.expoConfig?.extra?.speechmaticsApiKey ||
    ""
  );
}

function getBaseUrl(): string {
  const region =
    process.env.EXPO_PUBLIC_SPEECHMATICS_REGION ||
    Constants.expoConfig?.extra?.speechmaticsRegion ||
    "eu";
  return REGION_MAP[region] || REGION_MAP.eu;
}

export async function transcribeAudio(uri: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "Speechmatics API key missing. Set EXPO_PUBLIC_SPEECHMATICS_API_KEY in .env or EAS secrets."
    );
  }

  const base = getBaseUrl();
  const config = JSON.stringify({
    type: "transcription",
    transcription_config: { language: "en", operating_point: "enhanced" },
  });

  const formData = new FormData();
  formData.append("config", config);
  formData.append("data_file", {
    uri,
    name: "recording.m4a",
    type: "audio/m4a",
  } as unknown as Blob);

  const createRes = await fetch(`${base}/jobs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Speechmatics job failed: ${err}`);
  }

  const { id: jobId } = await createRes.json();

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const statusRes = await fetch(`${base}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const status = await statusRes.json();
    if (status.job?.status === "done") {
      const transcriptRes = await fetch(`${base}/jobs/${jobId}/transcript?format=txt`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const text = await transcriptRes.text();
      return text.trim();
    }
    if (status.job?.status === "rejected") {
      throw new Error("Speechmatics rejected the audio file");
    }
  }

  throw new Error("Speechmatics transcription timed out");
}

export function hasSpeechmaticsKey(): boolean {
  return !!getApiKey();
}
