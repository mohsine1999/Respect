# Respect — personal habit tracker

A lightweight, offline-first Android app for tracking the commitments you make to yourself without slipping into perfectionism.

## What is included

- Today view built from the user-configurable plan
- Daily completion tracking with local persistence
- Custom commitment weights and weekly schedules
- Recovery/rest day flow
- Strong-day threshold and streak logic
- History view with daily score and reflection review
- Export/reset settings for local data management
- No account, backend, analytics, network permission, or AI dependency

## Streak behavior

The streak is defined in code and is intentionally simple:

- A day counts as a strong day if the earned daily score is greater than or equal to the configured strong-day threshold.
- Recovery/rest days count as successful streak days and do not break the streak.
- Days with no scheduled commitments are treated as a clear stopping point for streak continuation.
- Future dates are not considered when calculating streaks.
- Streaks are calculated by walking backward from today and stopping at the first non-strong day.

This keeps the system deterministic and avoids accidentally inflating streaks from future or empty days.

## Build

The project uses Android Gradle Plugin 8.13.2 with Gradle 8.13, compile/target SDK 36, and JDK 17.

### Android Studio
Open the project folder, let Gradle sync, then run the `app` module on a connected Android device.

### Command line
With Android SDK installed:

`gradle :app:assembleDebug`

APK: `app/build/outputs/apk/debug/app-debug.apk`

### GitHub Actions
The repository includes a GitHub Actions workflow that builds the debug APK and uploads it as an artifact.

## Local build verification

Verified in this environment with:

`cd /workspaces/Respect/respect-android && gradle :app:assembleDebug --stacktrace`
