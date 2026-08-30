import { createContext, useContext, useMemo } from 'react';
import { disabledMonetizationConfig, protectedAdViewerState } from './config';
import type {
  AdAdapter,
  AdBannerProps,
  MonetizationContextValue,
  MonetizationProviderProps,
} from './types';

function NoopBanner(_props: AdBannerProps) {
  return null;
}

export const noopAdAdapter: AdAdapter = Object.freeze({
  id: 'noop',
  Banner: NoopBanner,
});

const defaultMonetizationContext: MonetizationContextValue = Object.freeze({
  config: disabledMonetizationConfig,
  adapter: noopAdAdapter,
  viewer: protectedAdViewerState,
});

const MonetizationContext = createContext<MonetizationContextValue>(defaultMonetizationContext);

export function MonetizationProvider({
  children,
  config = disabledMonetizationConfig,
  adapter = noopAdAdapter,
  viewer = protectedAdViewerState,
}: MonetizationProviderProps) {
  const value = useMemo(() => ({ config, adapter, viewer }), [adapter, config, viewer]);
  return <MonetizationContext.Provider value={value}>{children}</MonetizationContext.Provider>;
}

export function useMonetization(): MonetizationContextValue {
  return useContext(MonetizationContext);
}
