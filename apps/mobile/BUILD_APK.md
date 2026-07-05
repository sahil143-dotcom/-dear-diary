# Dear Diary Mobile — Build APK with Expo EAS

## Prerequisites

- Node.js 18+
- Expo account (free): https://expo.dev/signup
- Speechmatics API key: https://portal.speechmatics.com/
- (Optional) Cognee Cloud for remote graph sync

---

## 1. Install dependencies

```bash
cd apps/mobile
npm install
```

---

## 2. Expo CLI & EAS CLI authentication

```bash
# Install globally
npm install -g expo-cli eas-cli

# Login to Expo (creates/links your expo.dev account)
npx expo login

# Verify
npx expo whoami

# Configure EAS for this project (first time only)
cd apps/mobile
eas login
eas init
```

`eas init` will:
- Create/link an Expo project on expo.dev
- Write your `projectId` into `app.json` → `extra.eas.projectId`

---

## 3. Environment secrets (Speechmatics + Cognee)

**Local development:**
```bash
cp .env.example .env
# Edit .env with your keys
```

**EAS Build (recommended for APK — keys never in APK source):**
```bash
eas secret:create --name EXPO_PUBLIC_SPEECHMATICS_API_KEY --value YOUR_SPEECHMATICS_KEY --type string
eas secret:create --name EXPO_PUBLIC_COGNEE_API_URL --value YOUR_COGNEE_URL --type string
eas secret:create --name EXPO_PUBLIC_COGNEE_API_KEY --value YOUR_COGNEE_KEY --type string
```

List secrets:
```bash
eas secret:list
```

---

## 4. Generate app icons (first time)

```bash
npx expo prebuild --clean
# Or place 1024x1024 PNG at assets/icon.png
```

Default assets are included for development builds.

---

## 5. Build APK

```bash
# Preview APK (install directly on Android — no Play Store)
npm run build:apk

# Equivalent:
eas build --platform android --profile preview
```

When prompted:
- Select **Android**
- EAS builds in the cloud (~10–15 min)
- Download **.apk** from the link Expo provides

---

## 6. Install APK on phone

1. Download `.apk` from Expo build page to your Android device
2. Enable **Install from unknown sources**
3. Tap the APK to install
4. Grant **microphone** permission when prompted

---

## App flow

| Screen | Feature |
|--------|---------|
| Intro | Cinematic hero, memory count |
| Capture | Hold orb → **Speechmatics** STT → **Cognee** remember() |
| Bloom | Entity chips + day card |
| Memory Lab | All 4 Cognee verbs + live graph |
| Lenses | 4 recall geometries |
| Witness | Pattern queries + improve() |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `eas: command not found` | `npm install -g eas-cli` |
| Not logged in | `eas login` |
| Speechmatics error | Check API key + region (eu/usa/au) |
| APK won't install | Use `preview` profile (buildType: apk) |

---

## Sponsor line

**Speechmatics listens · Cognee remembers · Dear Diary on your phone.**
