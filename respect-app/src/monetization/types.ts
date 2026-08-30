import type { ComponentType, ReactNode } from 'react';

export const AD_PLACEMENTS = ['progress-inline'] as const;

export type AdPlacement = (typeof AD_PLACEMENTS)[number];

export type AdConsentStatus = 'unknown' | 'granted' | 'not-required' | 'denied';

export interface AdViewerState {
  onboardingComplete: boolean;
  meaningfulCheckInDays: number;
  hasAdFreeAccess: boolean;
  consentStatus: AdConsentStatus;
}

export interface MonetizationConfig {
  enabled: boolean;
  enabledPlacements: readonly AdPlacement[];
  minimumCheckInDays: number;
}

export interface AdBannerProps {
  placement: AdPlacement;
  width: number;
}

export interface AdAdapter {
  readonly id: string;
  readonly Banner: ComponentType<AdBannerProps>;
}

export interface MonetizationProviderProps {
  children: ReactNode;
  config?: MonetizationConfig;
  adapter?: AdAdapter;
  viewer?: AdViewerState;
}

export interface MonetizationContextValue {
  config: MonetizationConfig;
  adapter: AdAdapter;
  viewer: AdViewerState;
}
