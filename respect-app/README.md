# Respect

Respect is an offline-first React Native application built with Expo 57, TypeScript, and Tamagui. Its five-tab shell is local React Native state, so the app does not carry an additional native navigation runtime. This is the repository's only application implementation.

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

AsyncStorage persists commitments, weekday schedules, scoring settings, check-ins, reflections, recovery/minimum days, theme preferences, and immutable historical plan snapshots. Export creates a complete local JSON backup through the native share sheet.
