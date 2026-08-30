import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Button, Input, ScrollView, Text, XStack, YStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, SecondaryButton } from '../components';
import { useRespect } from '../data/RespectProvider';
import {
  DEFAULT_STARTER_IDS,
  STARTER_COMMITMENT_TEMPLATES,
} from '../domain/commitments';
import { CheckIcon } from '../components/Icons';

const TOTAL_STEPS = 3;

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { completeOnboarding } = useRespect();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [selectedIds, setSelectedIds] = useState(DEFAULT_STARTER_IDS);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [entrance] = useState(() => new Animated.Value(1));
  const horizontalPadding = width < 380 ? 16 : 24;

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      entrance.setValue(1);
      return;
    }
    entrance.setValue(0);
    Animated.timing(entrance, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [entrance, reduceMotion, step]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 0) return false;
      setStep((current) => current - 1);
      return true;
    });
    return () => subscription.remove();
  }, [step]);

  const toggleTemplate = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((candidate) => candidate !== id) : [...current, id],
    );
  };

  const finish = () => completeOnboarding({ displayName, commitmentIds: selectedIds });

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep((current) => current + 1);
    else finish();
  };

  const nextDisabled = step === 2 && selectedIds.length < 2;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <YStack f={1} bg="$background" pt={insets.top}>
        <YStack width="100%" maxWidth={620} alignSelf="center" f={1}>
          <XStack px={horizontalPadding} pt="$lg" ai="center" jc="space-between">
            <Text fontSize="$caption" fw="$semibold" color="$textSecondary">
              STEP {step + 1} OF {TOTAL_STEPS}
            </Text>
            <XStack gap="$xs" accessibilityLabel={`Step ${step + 1} of ${TOTAL_STEPS}`}>
              {Array.from({ length: TOTAL_STEPS }, (_, index) => (
                <YStack
                  key={index}
                  w={index === step ? 24 : 8}
                  h={8}
                  br="$round"
                  bg={index <= step ? '$accent' : '$border'}
                />
              ))}
            </XStack>
          </XStack>

          <ScrollView
            f={1}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={{
                flex: 1,
                opacity: entrance,
                transform: [
                  {
                    translateX: entrance.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
                  },
                ],
              }}
            >
              {step === 0 ? <WelcomeStep horizontalPadding={horizontalPadding} /> : null}
              {step === 1 ? (
                <NameStep
                  horizontalPadding={horizontalPadding}
                  displayName={displayName}
                  onChangeDisplayName={setDisplayName}
                />
              ) : null}
              {step === 2 ? (
                <PlanStep
                  horizontalPadding={horizontalPadding}
                  selectedIds={selectedIds}
                  onToggle={toggleTemplate}
                />
              ) : null}
            </Animated.View>
          </ScrollView>

          <YStack
            px={horizontalPadding}
            pt="$md"
            pb={Math.max(insets.bottom, 16)}
            gap="$sm"
            bg="$background"
          >
            <PrimaryButton onPress={next} disabled={nextDisabled}>
              {step === 0 ? 'Build my plan' : step === 1 ? 'Choose my starting plan' : 'Start my first day'}
            </PrimaryButton>
            {step > 0 ? <SecondaryButton onPress={() => setStep((current) => current - 1)}>Back</SecondaryButton> : null}
          </YStack>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}

function WelcomeStep({ horizontalPadding }: { horizontalPadding: number }) {
  return (
    <YStack px={horizontalPadding} pt="$4xl" pb="$2xl" gap="$3xl" ai="center" jc="center" minHeight={560}>
      <YStack w={184} h={184} ai="center" jc="center">
        <YStack position="absolute" w={184} h={184} br="$round" bg="$accentSoft" />
        <YStack position="absolute" w={146} h={146} br="$round" bw={1} bc="$accent" opacity={0.22} />
        <YStack position="absolute" w={104} h={104} br="$round" bw={1} bc="$accent" opacity={0.16} />
        <Image
          source={require('../../assets/android-icon-foreground.png')}
          style={{ width: 138, height: 138 }}
          resizeMode="contain"
          accessibilityLabel="Respect logo"
        />
      </YStack>
      <YStack gap="$lg" ai="center">
        <Text
          fontFamily="$heading"
          fontSize="$display"
          lineHeight="$display"
          fw="$semibold"
          color="$textPrimary"
          textAlign="center"
          maxWidth={500}
        >
          Keep promises to yourself.
        </Text>
        <Text fontSize="$body" lineHeight={24} color="$textSecondary" textAlign="center" maxWidth={430}>
          Respect turns a small daily plan into one clear check-in—without demanding perfection.
        </Text>
      </YStack>
      <XStack gap="$2xl" ai="center" jc="center">
        <WelcomeFact value="3" label="simple tabs" />
        <YStack w={1} h={36} bg="$border" />
        <WelcomeFact value="Local" label="by default" />
        <YStack w={1} h={36} bg="$border" />
        <WelcomeFact value="1" label="day at a time" />
      </XStack>
    </YStack>
  );
}

function WelcomeFact({ value, label }: { value: string; label: string }) {
  return (
    <YStack ai="center" gap="$xs">
      <Text fontSize="$title" fw="$semibold" color="$accent">
        {value}
      </Text>
      <Text fontSize="$caption" color="$textMuted" textAlign="center">
        {label}
      </Text>
    </YStack>
  );
}

function NameStep({
  horizontalPadding,
  displayName,
  onChangeDisplayName,
}: {
  horizontalPadding: number;
  displayName: string;
  onChangeDisplayName: (value: string) => void;
}) {
  return (
    <YStack px={horizontalPadding} pt="$5xl" pb="$3xl" gap="$3xl" minHeight={520}>
      <YStack gap="$md">
        <Text fontFamily="$heading" fontSize="$headline" lineHeight="$headline" fw="$semibold" color="$textPrimary">
          Make it yours.
        </Text>
        <Text fontSize="$body" lineHeight={24} color="$textSecondary">
          Your name makes the daily check-in feel personal. It never leaves this device.
        </Text>
      </YStack>
      <YStack gap="$sm">
        <Text fontSize="$label" fw="$semibold" color="$textSecondary">
          What should Respect call you?
        </Text>
        <Input
          autoFocus
          value={displayName}
          onChangeText={onChangeDisplayName}
          maxLength={32}
          autoCapitalize="words"
          autoCorrect={false}
          h={56}
          px="$lg"
          bg="$surface"
          bc="$border"
          br="$lg"
          fontSize="$body"
          color="$textPrimary"
          placeholder="Your first name (optional)"
          placeholderTextColor="$textMuted"
          focusStyle={{ borderColor: '$accent', borderWidth: 2 }}
          returnKeyType="done"
        />
      </YStack>
      <YStack p="$lg" br="$lg" bg="$accentSoft" gap="$sm">
        <Text fontSize="$bodyStrong" fw="$semibold" color="$textPrimary">
          No account required
        </Text>
        <Text fontSize="$caption" lineHeight={19} color="$textSecondary">
          Your plan, check-ins, and reflections are stored locally. You can export a backup from Settings.
        </Text>
      </YStack>
    </YStack>
  );
}

function PlanStep({
  horizontalPadding,
  selectedIds,
  onToggle,
}: {
  horizontalPadding: number;
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <YStack px={horizontalPadding} pt="$3xl" pb="$3xl" gap="$2xl">
      <YStack gap="$sm">
        <Text fontFamily="$heading" fontSize="$headline" lineHeight="$headline" fw="$semibold" color="$textPrimary">
          Choose a believable start.
        </Text>
        <Text fontSize="$body" lineHeight={24} color="$textSecondary">
          Pick at least two. Three is usually enough for a strong first week.
        </Text>
      </YStack>

      <YStack gap="$sm">
        {STARTER_COMMITMENT_TEMPLATES.map((template) => {
          const selected = selectedIds.includes(template.id);
          return (
            <Button
              unstyled
              key={template.id}
              onPress={() => onToggle(template.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              p="$lg"
              br="$lg"
              bg={selected ? '$accentSoft' : '$surface'}
              bw={1}
              bc={selected ? '$accent' : '$border'}
              pressStyle={{ scale: 0.99, backgroundColor: '$surfacePressed' }}
            >
              <XStack ai="center" gap="$md">
                <YStack
                  w={30}
                  h={30}
                  br="$round"
                  ai="center"
                  jc="center"
                  bg={selected ? '$accent' : '$backgroundSubtle'}
                  bw={selected ? 0 : 1}
                  bc="$border"
                >
                  {selected ? <CheckIcon size={17} color="$accentContrast" /> : null}
                </YStack>
                <YStack f={1} gap="$xs">
                  <Text fontSize="$bodyStrong" fw="$semibold" color="$textPrimary">
                    {template.title}
                  </Text>
                  <Text fontSize="$caption" color="$textSecondary">
                    {template.description}
                  </Text>
                </YStack>
              </XStack>
            </Button>
          );
        })}
      </YStack>

      <YStack p="$lg" br="$lg" bg="$backgroundSubtle" gap="$xs">
        <Text fontSize="$bodyStrong" fw="$semibold" color="$textPrimary">
          Nothing is locked.
        </Text>
        <Text fontSize="$caption" lineHeight={19} color="$textSecondary">
          Open Plan anytime, tap an item, then change its target, days, or importance. Past days stay intact.
        </Text>
      </YStack>

      {selectedIds.length < 2 ? (
        <Text fontSize="$caption" color="$danger">
          Choose at least two items to continue.
        </Text>
      ) : null}
    </YStack>
  );
}
