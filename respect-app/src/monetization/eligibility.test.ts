import { describe, expect, it } from 'vitest';
import { canShowAd, evaluateAdEligibility } from './eligibility';
import type { AdViewerState, MonetizationConfig } from './types';

const enabledConfig: MonetizationConfig = {
  enabled: true,
  enabledPlacements: ['progress-inline'],
  minimumCheckInDays: 3,
};

const eligibleViewer: AdViewerState = {
  onboardingComplete: true,
  meaningfulCheckInDays: 3,
  hasAdFreeAccess: false,
  consentStatus: 'granted',
};

describe('ad eligibility', () => {
  it('fails closed when monetization or the placement is disabled', () => {
    expect(
      evaluateAdEligibility({
        config: { ...enabledConfig, enabled: false },
        placement: 'progress-inline',
        viewer: eligibleViewer,
      }),
    ).toEqual({ eligible: false, reason: 'monetization-disabled' });

    expect(
      evaluateAdEligibility({
        config: { ...enabledConfig, enabledPlacements: [] },
        placement: 'progress-inline',
        viewer: eligibleViewer,
      }),
    ).toEqual({ eligible: false, reason: 'placement-disabled' });
  });

  it('protects onboarding, ad-free viewers, and unresolved consent', () => {
    expect(
      evaluateAdEligibility({
        config: enabledConfig,
        placement: 'progress-inline',
        viewer: { ...eligibleViewer, onboardingComplete: false },
      }).reason,
    ).toBe('onboarding-incomplete');

    expect(
      evaluateAdEligibility({
        config: enabledConfig,
        placement: 'progress-inline',
        viewer: { ...eligibleViewer, meaningfulCheckInDays: 2 },
      }).reason,
    ).toBe('insufficient-history');

    expect(
      evaluateAdEligibility({
        config: enabledConfig,
        placement: 'progress-inline',
        viewer: { ...eligibleViewer, hasAdFreeAccess: true },
      }).reason,
    ).toBe('ad-free-access');

    for (const consentStatus of ['unknown', 'denied'] as const) {
      expect(
        evaluateAdEligibility({
          config: enabledConfig,
          placement: 'progress-inline',
          viewer: { ...eligibleViewer, consentStatus },
        }).reason,
      ).toBe('consent-unavailable');
    }
  });

  it('allows configured placements after consent or when consent is not required', () => {
    expect(canShowAd({ config: enabledConfig, placement: 'progress-inline', viewer: eligibleViewer })).toBe(true);
    expect(
      canShowAd({
        config: enabledConfig,
        placement: 'progress-inline',
        viewer: { ...eligibleViewer, consentStatus: 'not-required' },
      }),
    ).toBe(true);
  });
});
