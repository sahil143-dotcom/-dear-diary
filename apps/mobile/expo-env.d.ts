/// <reference types="expo/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SPEECHMATICS_API_KEY?: string;
    EXPO_PUBLIC_SPEECHMATICS_REGION?: string;
    EXPO_PUBLIC_COGNEE_API_URL?: string;
    EXPO_PUBLIC_COGNEE_API_KEY?: string;
  }
}
