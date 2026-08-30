import { PortalProvider } from '@tamagui/portal';
import { StatusBar } from 'expo-status-bar';
import { useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { Spinner, TamaguiProvider, Text, Theme, YStack } from 'tamagui';
import tamaguiConfig from './tamagui.config';
import { RespectProvider, useRespect } from './src/data/RespectProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { OnboardingScreen } from './src/onboarding/OnboardingScreen';
import { MonetizationProvider } from './src/monetization';
import { dayRecordHasActivity } from './src/domain/history';

function MonetizationBridge({ children }: { children: ReactNode }) {
  const { state } = useRespect();
  const viewer = useMemo(
    () => ({
      onboardingComplete: state.profile.onboardingCompleted,
      meaningfulCheckInDays: Object.values(state.records).filter(dayRecordHasActivity).length,
      hasAdFreeAccess: false,
      consentStatus: 'unknown' as const,
    }),
    [state.profile.onboardingCompleted, state.records],
  );
  return <MonetizationProvider viewer={viewer}>{children}</MonetizationProvider>;
}

function RespectApplication() {
  const { state, hydrated } = useRespect();
  const systemColorScheme = useColorScheme();
  const systemTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
  const themeName = state.settings.theme === 'system' ? systemTheme : state.settings.theme;
  return (
    <Theme name={themeName}>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      {hydrated ? (
        state.profile.onboardingCompleted ? <AppNavigator /> : <OnboardingScreen />
      ) : (
        <YStack f={1} ai="center" jc="center" gap="$md" bg="$background">
          <Spinner color="$accent" />
          <Text fontSize="$label" color="$textMuted">
            Loading Respect
          </Text>
        </YStack>
      )}
    </Theme>
  );
}

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <YStack f={1}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <PortalProvider shouldAddRootHost>
            <RespectProvider>
              <MonetizationBridge>
                <RespectApplication />
              </MonetizationBridge>
            </RespectProvider>
          </PortalProvider>
        </SafeAreaProvider>
      </YStack>
    </TamaguiProvider>
  );
}
