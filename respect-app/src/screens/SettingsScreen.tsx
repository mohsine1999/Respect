import { useState } from 'react';
import { Alert } from 'react-native';
import { Switch, Text, XStack, YStack } from 'tamagui';
import {
  Chip,
  FormField,
  IconButton,
  ModalSheet,
  PrimaryButton,
  RespectScreen,
  ScreenHeader,
  SectionHeader,
  SettingRow,
  StatusBadge,
} from '../components';
import { ArrowLeftIcon } from '../components/Icons';
import { useRespect } from '../data/RespectProvider';
import { exportRespectBackup } from '../data/backup';

export function SettingsScreen({ onBack, onOpenPlan }: { onBack: () => void; onOpenPlan: () => void }) {
  const { state, updateProfile, updateSettings, resetAll } = useRespect();
  const [exporting, setExporting] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(state.profile.displayName);

  const exportData = async () => {
    try {
      setExporting(true);
      const uri = await exportRespectBackup(state);
      Alert.alert('Export ready', `Your Respect data is ready to share.\n\n${uri}`);
    } catch {
      Alert.alert('Export failed', 'Respect could not create the export file.');
    } finally {
      setExporting(false);
    }
  };

  const confirmReset = () => {
    Alert.alert('Start over?', 'This clears your plan, check-ins, notes, and preferences on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start over', style: 'destructive', onPress: () => void resetAll() },
    ]);
  };

  const saveName = () => {
    updateProfile({ displayName: nameDraft.trim() });
    setNameOpen(false);
  };

  const settingSwitch = (checked: boolean, onCheckedChange: (checked: boolean) => void) => (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      size="$sm"
      bg={checked ? '$accent' : '$surfacePressed'}
      accessibilityRole="switch"
    >
      <Switch.Thumb bg="$surfaceElevated" />
    </Switch>
  );

  return (
    <RespectScreen>
      <ScreenHeader
        eyebrow="Private by design"
        title="Settings"
        leading={
          <IconButton label="Back" icon={<ArrowLeftIcon size={20} color="$textSecondary" />} onPress={onBack} />
        }
      />

      <YStack gap="$sm">
        <SectionHeader title="You" />
        <SettingRow
          label="Name"
          detail="Used only for your greeting on this device."
          value={state.profile.displayName || 'Not set'}
          onPress={() => {
            setNameDraft(state.profile.displayName);
            setNameOpen(true);
          }}
        />
        <SettingRow
          label="My plan"
          detail={`${state.commitments.length} promises · tap any one to edit`}
          onPress={onOpenPlan}
        />
      </YStack>

      <YStack gap="$md">
        <SectionHeader title="Scoring" />
        <Text fontSize="$body" color="$textSecondary">
          A strong day begins at this percentage. Importance weights are normalized automatically.
        </Text>
        <XStack flexWrap="wrap" gap="$sm">
          {[60, 70, 80, 90].map((threshold) => (
            <Chip
              key={threshold}
              label={`${threshold}%`}
              selected={state.settings.strongDayThreshold === threshold}
              onPress={() => updateSettings({ strongDayThreshold: threshold })}
            />
          ))}
        </XStack>
        <SettingRow
          label="Minimum-day mode"
          detail="Lets a smaller honest version protect your rhythm."
          control={settingSwitch(state.settings.minimumDayEnabled, (minimumDayEnabled) =>
            updateSettings({ minimumDayEnabled }),
          )}
        />
      </YStack>

      <YStack gap="$md">
        <SectionHeader title="Appearance" />
        <XStack flexWrap="wrap" gap="$sm">
          <Chip
            label="System"
            selected={state.settings.theme === 'system'}
            onPress={() => updateSettings({ theme: 'system' })}
          />
          <Chip
            label="Light"
            selected={state.settings.theme === 'light'}
            onPress={() => updateSettings({ theme: 'light' })}
          />
          <Chip
            label="Dark"
            selected={state.settings.theme === 'dark'}
            onPress={() => updateSettings({ theme: 'dark' })}
          />
        </XStack>
      </YStack>

      <YStack gap="$sm">
        <SectionHeader title="Reminders" />
        <SettingRow
          label="Daily reminder"
          detail="Coming later. Respect does not request notification permission yet."
          value="Not enabled"
        />
      </YStack>

      <YStack gap="$sm">
        <SectionHeader title="Your data" />
        <SettingRow
          label={exporting ? 'Preparing export…' : 'Export my data'}
          detail="A local JSON copy of your plan, history, notes, and settings."
          onPress={exporting ? undefined : () => void exportData()}
        />
        <SettingRow label="Start over" detail="Clear this device and return to welcome." onPress={confirmReset} danger />
      </YStack>

      <YStack gap="$sm">
        <SectionHeader title="About" />
        <SettingRow label="Respect" detail="A calm daily practice for keeping your own word." value="1.1.0" />
        <XStack flexWrap="wrap" gap="$xl" pt="$sm">
          <StatusBadge label="Offline first" tone="success" />
          <StatusBadge label="No account" tone="success" />
          <StatusBadge label="Ads disabled" />
        </XStack>
      </YStack>

      <ModalSheet open={nameOpen} onOpenChange={setNameOpen} title="Your name">
        <YStack gap="$xl" pb="$3xl">
          <FormField
            label="Name"
            value={nameDraft}
            onChangeText={setNameDraft}
            maxLength={32}
            autoCapitalize="words"
            placeholder="Your first name"
          />
          <PrimaryButton onPress={saveName}>Save name</PrimaryButton>
        </YStack>
      </ModalSheet>
    </RespectScreen>
  );
}
