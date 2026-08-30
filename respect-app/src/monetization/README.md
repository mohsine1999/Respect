# Monetization integration

Respect currently ships with monetization disabled. `AdSlot` renders nothing, reserves no space, and imports no advertising SDK.

When ads are enabled later:

1. Implement one native adapter behind `AdAdapter`; screens must never import the provider SDK directly.
2. Add the provider through an Expo config plugin only when both Android and iOS app IDs are present. Invalid native IDs must fail configuration instead of reaching a release build.
3. Resolve consent before changing `consentStatus` to `granted` or `not-required`. Never derive ad targeting from promises, scores, notes, or exported data.
4. Keep preview builds on test IDs. Enabling a native SDK requires new Android and iOS EAS binaries; it cannot be delivered only as a JavaScript update.
5. Update the privacy policy, Play Data Safety declaration, App Store privacy details, and Settings privacy entry point before release.

The only approved placement is `progress-inline`. Eligibility also requires completed onboarding and at least three meaningful check-in days. Ads remain excluded from welcome, Today, Plan editing, and Settings.

Provider reference: <https://docs.page/invertase/react-native-google-mobile-ads>
