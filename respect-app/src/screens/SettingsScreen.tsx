import { useState } from 'react';
import { Alert } from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Switch, Text, XStack, YStack } from 'tamagui';
import {
  Chip,
  RespectScreen,
  ScreenHeader,
  SectionHeader,
  SettingRow,
  StatusBadge,
} from '../components';
import { useRespect } from '../data/RespectProvider';
import { exportRespectBackup } from '../data/backup';
import type { RootTabParamList } from '../navigation/types';

export function SettingsScreen() {
  const { state, updateSettings, resetAll } = useRespect();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [exporting, setExporting] = useState(false);

  const exportData = async () => {
    try {
      setExporting(true);
      const uri = await exportRespectBackup(state);
      Alert.alert('Export ready', `A complete local backup was created.\n\n${uri}`);
    } catch {
      Alert.alert('Export failed', 'Respect could not create the backup file.');
    } finally {
      setExporting(false);
    }
  };

  const confirmReset = () => {
    Alert.alert('Reset all Respect data?', 'This clears the plan, check-ins, reflections, and settings on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => void resetAll() },
    ]);
  };

  const settingSwitch = (checked: boolean, onCheckedChange: (checked: boolean) => void) => (
    <Switch checked={checked} onCheckedChange={onCheckedChange} size="$sm" bg={checked ? '$accent' : '$surfacePressed'}>
      <Switch.Thumb bg="$surfaceElevated" />
    </Switch>
  );

  return (
    <RespectScreen>
      <ScreenHeader eyebrow="Local, private, yours" title="Settings" />

      <YStack gap="$sm">
        <SectionHeader title="Plan" />
        <SettingRow
          label="My plan"
          detail={`${state.commitments.length} commitments · historical days stay fixed`}
          onPress={() => navigation.navigate('Plan')}
        />
      </YStack>

      <YStack gap="$md">
        <SectionHeader title="Scoring" />
        <Text fontSize="$body" color="$textSecondary">
          A strong day begins at this score.
        </Text>
        <XStack gap="$sm">
          {[60, 70, 80, 90].map((threshold) => (
            <Chip
              key={threshold}
              label={String(threshold)}
              selected={state.settings.strongDayThreshold === threshold}
              onPress={() => updateSettings({ strongDayThreshold: threshold })}
            />
          ))}
        </XStack>
        <SettingRow
          label="Minimum-day mode"
          detail="Required minimum versions can protect a streak."
          control={settingSwitch(state.settings.minimumDayEnabled, (minimumDayEnabled) => updateSettings({ minimumDayEnabled }))}
        />
      </YStack>

      <YStack gap="$md">
        <SectionHeader title="Appearance" />
        <XStack gap="$sm">
          <Chip label="Light" selected={state.settings.theme === 'light'} onPress={() => updateSettings({ theme: 'light' })} />
          <Chip label="Dark" selected={state.settings.theme === 'dark'} onPress={() => updateSettings({ theme: 'dark' })} />
        </XStack>
      </YStack>

      <YStack gap="$sm">
        <SectionHeader title="Notifications" />
        <SettingRow
          label="Daily prompt"
          detail="Remember a deliberate check-in each day."
          control={settingSwitch(state.settings.notifications, (notifications) => updateSettings({ notifications }))}
        />
      </YStack>

      <YStack gap="$sm">
        <SectionHeader title="Data" />
        <SettingRow
          label={exporting ? 'Preparing export…' : 'Export backup'}
          detail="JSON with plan, history, reflections, and settings."
          onPress={exporting ? undefined : () => void exportData()}
        />
        <SettingRow label="Reset everything" detail="Return to the original six-part plan." onPress={confirmReset} danger />
      </YStack>

      <YStack gap="$sm">
        <SectionHeader title="About" />
        <SettingRow label="Respect" detail="A private operating system for keeping your own word." value="1.0.0" />
        <StatusBadge label="Offline first" tone="success" />
      </YStack>
    </RespectScreen>
  );
}
