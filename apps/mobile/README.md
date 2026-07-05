# Dear Diary — Mobile

Expo React Native app for **Dear Diary**. Capture voice, photos, videos, and documents → Speechmatics + Cognee Cloud → searchable memory graph.

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Onboarding | `/onboarding/*` | Cinematic intro |
| Dashboard | `/dashboard` | Timeline + navigation |
| Add Memory | `/capture` | Voice / photo / video / PDF hub |
| Bloom | `/bloom` | Memory detail after save |
| Memory Lab | `/memory` | Cognee verbs + graph viz |
| Lenses | `/lenses` | Persona refractors |
| Witness | `/witness` | Ask the graph |
| Settings | `/settings` | Hidden (double-tap brand) |

## Setup

```bash
npm install
cp .env.example .env
npx expo start
```

## Build APK

```bash
npx expo login
npm run build:apk
```

See [BUILD_APK.md](./BUILD_APK.md) for EAS secrets and troubleshooting.

## Key files

- `lib/cognee.ts` — Cognee Cloud API (`remember`, `recall`, `improve`, `forget`)
- `lib/speechmatics.ts` — batch STT via Speechmatics REST
- `lib/media.ts` — image/video/document pickers + local persistence

## Expo project

https://expo.dev/accounts/sahil_bhai/projects/dear-diary
