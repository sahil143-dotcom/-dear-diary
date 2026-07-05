import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

import type { MediaType } from "./cognee";

export type { MediaType };

export interface PickedMedia {
  mediaType: MediaType;
  uri: string;
  fileName: string;
  mimeType?: string;
}

const MEDIA_DIR = `${FileSystem.documentDirectory}memories/`;

async function ensureMediaDir() {
  const info = await FileSystem.getInfoAsync(MEDIA_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
}

/** Copy picked file into app storage for persistence across sessions */
export async function persistMedia(picked: PickedMedia): Promise<string> {
  await ensureMediaDir();
  const ext = picked.fileName.includes(".")
    ? picked.fileName.slice(picked.fileName.lastIndexOf("."))
    : "";
  const dest = `${MEDIA_DIR}${Date.now()}${ext}`;
  await FileSystem.copyAsync({ from: picked.uri, to: dest });
  return dest;
}

export async function pickImage(fromCamera: boolean): Promise<PickedMedia | null> {
  const perm = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = fromCamera
    ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: false,
      });

  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return {
    mediaType: "image",
    uri: asset.uri,
    fileName: asset.fileName || `photo_${Date.now()}.jpg`,
    mimeType: asset.mimeType || "image/jpeg",
  };
}

export async function pickVideo(fromCamera: boolean): Promise<PickedMedia | null> {
  const perm = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = fromCamera
    ? await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoMaxDuration: 120,
        quality: 0.8,
      })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 0.8,
        videoMaxDuration: 120,
      });

  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return {
    mediaType: "video",
    uri: asset.uri,
    fileName: asset.fileName || `video_${Date.now()}.mp4`,
    mimeType: asset.mimeType || "video/mp4",
  };
}

export async function pickDocument(): Promise<PickedMedia | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/pdf", "image/*", "video/*", "text/*"],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  const isPdf = asset.mimeType?.includes("pdf") || asset.name?.endsWith(".pdf");
  const isVideo = asset.mimeType?.startsWith("video/");
  const isImage = asset.mimeType?.startsWith("image/");
  return {
    mediaType: isPdf ? "pdf" : isVideo ? "video" : isImage ? "image" : "text",
    uri: asset.uri,
    fileName: asset.name || "document",
    mimeType: asset.mimeType,
  };
}

export function buildMemoryText(picked: PickedMedia, caption?: string): string {
  if (caption?.trim()) return caption.trim();
  switch (picked.mediaType) {
    case "image":
      return `Photo memory: ${picked.fileName}. What mattered in this moment is saved here.`;
    case "video":
      return `Video memory: ${picked.fileName}. A moving moment captured on ${new Date().toISOString().slice(0, 10)}.`;
    case "pdf":
      return `Document saved: ${picked.fileName}. PDF attached to diary graph for recall.`;
    default:
      return `File saved: ${picked.fileName}`;
  }
}

export const MEDIA_LABELS: Record<MediaType, string> = {
  voice: "Voice",
  image: "Photo",
  video: "Video",
  pdf: "PDF",
  text: "File",
  seed: "Demo",
};

export const MEDIA_ICONS: Record<MediaType, string> = {
  voice: "🎙️",
  image: "📷",
  video: "🎬",
  pdf: "📄",
  text: "📎",
  seed: "✦",
};
