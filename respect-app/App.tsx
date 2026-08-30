import { NavigationContainer } from '@react-navigation/native';
import { PortalProvider } from '@tamagui/portal';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Spinner, styled, TamaguiProvider, Text, Theme, YStack } from 'tamagui';
import config from './tamagui.config';
import { RespectProvider, useRespect } from './src/data/RespectProvider';
import { AppNavigator } from './src/navigation/AppNavigator';

const GestureRoot = styled(GestureHandlerRootView, { flex: 1 });

function RespectApplication() {
  const { state, hydrated } = useRespect();
  return (
    <Theme name={state.settings.theme}>
      <StatusBar style={state.settings.theme === 'dark' ? 'light' : 'dark'} />
      {hydrated ? (
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
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
    <TamaguiProvider config={config} defaultTheme="light">
      <GestureRoot>
        <SafeAreaProvider>
          <PortalProvider shouldAddRootHost>
            <RespectProvider>
              <RespectApplication />
            </RespectProvider>
          </PortalProvider>
        </SafeAreaProvider>
      </GestureRoot>
    </TamaguiProvider>
  );
}
