import type { AdViewerState, MonetizationConfig } from './types';

export const disabledMonetizationConfig: MonetizationConfig = Object.freeze({
  enabled: false,
  enabledPlacements: Object.freeze([]),
  minimumCheckInDays: 3,
});

export const protectedAdViewerState: AdViewerState = Object.freeze({
  onboardingComplete: false,
  meaningfulCheckInDays: 0,
  hasAdFreeAccess: false,
  consentStatus: 'unknown',
});
