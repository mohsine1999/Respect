# Respect

Respect is now an offline-first React Native application built with Expo 57, TypeScript, Tamagui, and React Navigation. The former Java Android application remains in `../respect-android` only as a migration reference; it is not part of the Expo runtime or build.

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

For a signed cloud APK, install the EAS CLI, authenticate, and run:

```sh
cd respect-app
eas build --platform android --profile preview
```

The repository workflow `.github/workflows/build-apk.yml` runs tests, generates the native Android project, builds a debug APK, and uploads it as a downloadable GitHub Actions artifact.

## Data model

AsyncStorage persists commitments, weekday schedules, scoring settings, check-ins, reflections, recovery/minimum days, theme preferences, and immutable historical plan snapshots. Export creates a complete local JSON backup through the native share sheet.
