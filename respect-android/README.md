# Respect — personal habit tracker

A tiny, offline-first Android app built around one idea: keep your promises to yourself more often than you break them.

## What is included

- Today screen with six daily commitments
- Score out of 100 (learning 30, movement 20, sport 15, snooker 15, sleep 10, reflection 10)
- Day streak based on a 70+ score
- One-sentence reflection stored locally on the device
- Seven-day dashboard and a simple weekly message
- No account, backend, analytics, network permission, or AI dependency

## Build

The project uses Android Gradle Plugin 8.13.2 with Gradle 8.13, compile/target SDK 36, and JDK 17.

### Android Studio
Open the project folder, let Gradle sync, then run the `app` module on a connected Android device.

### Command line
With Android SDK installed:

`gradle :app:assembleDebug`

APK: `app/build/outputs/apk/debug/app-debug.apk`

### GitHub Actions
Push the folder to GitHub and run **Build Respect APK**. The workflow publishes `app-debug.apk` as a downloadable Actions artifact.
