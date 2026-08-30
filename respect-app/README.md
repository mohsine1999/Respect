# Respect

Respect is an offline-first React Native application built with Expo 57, TypeScript, and Tamagui. A short, personalized welcome builds a starter plan, then a focused three-tab shell keeps Today, Progress, and Plan easy to find. The local cross-platform shell avoids an additional native navigation runtime while preserving each tab's state.

Use Node 22 LTS (22.13 or newer). Node 23 is not supported by React Native 0.86.

## Development

```sh
cd respect-app
npm ci
npx expo start
```

Press `a` in the Expo terminal to open Android, or run `npm run android` with an emulator/device available.

## Verification

```sh
npm run check
npx expo-doctor
```

## Android APK

For a local installable debug APK (Android SDK and JDK 17 required):

```sh
cd respect-app
npm run build:apk
```

The artifact is written to `respect-app/android/app/build/outputs/apk/debug/app-debug.apk`. The generated `android/` folder is intentionally ignored; Expo Prebuild recreates it from `app.json`.

For a signed cloud APK targeting modern 64-bit Android devices, install the EAS CLI, authenticate, and run:

```sh
cd respect-app
eas build --platform android --profile preview
```

The repository workflow `.github/workflows/build-apk.yml` runs tests, generates the native Android project, builds a debug APK, and uploads it as a downloadable GitHub Actions artifact.

The EAS APK is ARM64-only and enables JavaScript/native-library compression, R8 minification, optimized Android resource shrinking, and removes unused GIF/WebP decoders. Use a production Android App Bundle when distributing through Google Play so Play can deliver device-specific splits.

## Data model

AsyncStorage persists onboarding/profile state, commitments, weekday schedules, scoring settings, check-ins, reflections, recovery/minimum days, theme preferences, and immutable historical plan snapshots. Scores are normalized to 0–100, so custom plan weights stay meaningful, scheduled off-days remain neutral, and recovery days do not lower averages. The v3 upgrade preserves old plan snapshots but intentionally recalculates their derived score under the normalized model. Export creates a complete local JSON copy through the native share sheet.

## Monetization boundary

`src/monetization` contains a disabled, no-op ad adapter and a single responsive `AdSlot` entry point. Respect ships without an ad SDK, ad identifiers, consent prompts, or reserved empty space. A future Android/iOS provider can be injected behind this boundary only after consent, privacy disclosures, test IDs, valid platform app IDs, and at least three meaningful check-in days are configured. Ads are intentionally excluded from onboarding, Today check-ins, Plan editing, and Settings. See `src/monetization/README.md` for the integration contract.

## iOS readiness

The interface uses safe-area insets, system appearance, keyboard-aware sheets, responsive max-width content, rotation-friendly layout, reduced-motion-aware onboarding, and platform-neutral APIs. A future simulator build can be started with:

```sh
eas build --platform ios --profile ios-simulator
```
