import type { AdPlacement, AdViewerState, MonetizationConfig } from './types';

export type AdIneligibilityReason =
  | 'monetization-disabled'
  | 'placement-disabled'
  | 'onboarding-incomplete'
  | 'insufficient-history'
  | 'ad-free-access'
  | 'consent-unavailable';

export type AdEligibility =
  | { eligible: true; reason: null }
  | { eligible: false; reason: AdIneligibilityReason };

export interface AdEligibilityInput {
  config: MonetizationConfig;
  placement: AdPlacement;
  viewer: AdViewerState;
}

export function evaluateAdEligibility({ config, placement, viewer }: AdEligibilityInput): AdEligibility {
  if (!config.enabled) return { eligible: false, reason: 'monetization-disabled' };
  if (!config.enabledPlacements.includes(placement)) return { eligible: false, reason: 'placement-disabled' };
  if (!viewer.onboardingComplete) return { eligible: false, reason: 'onboarding-incomplete' };
  if (viewer.meaningfulCheckInDays < config.minimumCheckInDays) {
    return { eligible: false, reason: 'insufficient-history' };
  }
  if (viewer.hasAdFreeAccess) return { eligible: false, reason: 'ad-free-access' };
  if (viewer.consentStatus !== 'granted' && viewer.consentStatus !== 'not-required') {
    return { eligible: false, reason: 'consent-unavailable' };
  }
  return { eligible: true, reason: null };
}

export function canShowAd(input: AdEligibilityInput): boolean {
  return evaluateAdEligibility(input).eligible;
}
