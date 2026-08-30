import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import {
  Chip,
  CommitmentList,
  EmptyState,
  FormField,
  IconButton,
  ModalSheet,
  PrimaryButton,
  RespectScreen,
  ScreenHeader,
  SectionHeader,
  SecondaryButton,
} from '../components';
import { ChevronRightIcon, SettingsIcon } from '../components/Icons';
import { useRespect } from '../data/RespectProvider';
import type { Commitment } from '../domain/types';
import { toDateKey, WEEKDAY_NAMES } from '../utils/dates';

type Draft = Pick<
  Commitment,
  'title' | 'description' | 'points' | 'category' | 'minimumTarget' | 'weekdays' | 'enabled' | 'required'
>;

const blankDraft = (): Draft => ({
  title: '',
  description: '',
  points: 20,
  category: '',
  minimumTarget: '',
  weekdays: Array.from({ length: 7 }, () => true),
  enabled: true,
  required: true,
});

function toDraft(commitment: Commitment): Draft {
  return {
    title: commitment.title,
    description: commitment.description,
    points: commitment.points,
    category: commitment.category,
    minimumTarget: commitment.minimumTarget,
    weekdays: [...commitment.weekdays],
    enabled: commitment.enabled,
    required: commitment.required,
  };
}

function importanceValue(points: number): 10 | 20 | 30 {
  if (points >= 25) return 30;
  if (points <= 15) return 10;
  return 20;
}

export function PlanScreen({ onOpenSettings, active }: { onOpenSettings: () => void; active: boolean }) {
  const { state, addCommitment, saveCommitment, deleteCommitment, markPlanCoachmarkSeen } = useRespect();
  const [open, setOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [editing, setEditing] = useState<Commitment | null>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const todayCaptured = state.records[toDateKey(new Date())]?.scheduledCommitments !== undefined;

  useEffect(() => {
    if (active && !state.profile.planCoachmarkSeen) markPlanCoachmarkSeen();
  }, [active, markPlanCoachmarkSeen, state.profile.planCoachmarkSeen]);

  const beginAdd = () => {
    setEditing(null);
    setDraft(blankDraft());
    setAdvancedOpen(false);
    setOpen(true);
  };

  const beginEdit = (commitment: Commitment) => {
    setEditing(commitment);
    setDraft(toDraft(commitment));
    setAdvancedOpen(false);
    setOpen(true);
  };

  const save = () => {
    if (!draft.title.trim() || !draft.weekdays.some(Boolean)) return;
    if (editing) saveCommitment({ ...editing, ...draft });
    else addCommitment(draft);
    setOpen(false);
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert('Delete this promise?', 'Past days keep their original record.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteCommitment(editing.id);
          setOpen(false);
        },
      },
    ]);
  };

  const setWeekday = (index: number) => {
    setDraft((current) => ({
      ...current,
      weekdays: current.weekdays.map((enabled, dayIndex) => (dayIndex === index ? !enabled : enabled)),
    }));
  };

  const activeCount = state.commitments.filter((commitment) => commitment.enabled).length;

  return (
    <RespectScreen>
      <ScreenHeader
        eyebrow="Small enough to keep"
        title="My plan"
        action={
          <IconButton
            label="Open settings"
            icon={<SettingsIcon size={20} color="$textSecondary" />}
            onPress={onOpenSettings}
          />
        }
      />

      <YStack p="$lg" br="$lg" bg="$accentSoft" gap="$sm">
        <Text fontSize="$bodyStrong" fw="$semibold" color="$textPrimary">
          This plan belongs to you.
        </Text>
        <Text fontSize="$caption" lineHeight={19} color="$textSecondary">
          Tap any promise to change its target or days. {todayCaptured ? 'Today is already recorded, so changes begin tomorrow.' : 'Changes can begin today; past days never change.'}
        </Text>
      </YStack>

      <YStack gap="$md">
        <SectionHeader title="Promises" detail={`${activeCount} active`} />
        {state.commitments.length ? (
          <CommitmentList
            commitments={state.commitments}
            mode="plan"
            onPress={(commitment) => beginEdit(commitment as Commitment)}
          />
        ) : (
          <EmptyState
            title="Build a believable plan"
            detail="Start with two or three promises. You can grow the plan later."
            action={<PrimaryButton onPress={beginAdd}>Add my first promise</PrimaryButton>}
          />
        )}
      </YStack>

      {state.commitments.length ? (
        <PrimaryButton onPress={beginAdd}>Add another promise</PrimaryButton>
      ) : null}

      <ModalSheet open={open} onOpenChange={setOpen} title={editing ? 'Edit promise' : 'New promise'}>
        <YStack gap="$xl" pb="$5xl">
          <YStack gap="$xs">
            <Text fontSize="$caption" color="$textMuted">
              {todayCaptured ? 'Starts tomorrow · past days stay fixed' : 'Can start today · past days stay fixed'}
            </Text>
          </YStack>

          <FormField
            label="Promise"
            value={draft.title}
            onChangeText={(title) => setDraft((current) => ({ ...current, title }))}
            placeholder="Move my body"
            autoCapitalize="sentences"
            maxLength={60}
          />
          <FormField
            label="What counts?"
            value={draft.description}
            onChangeText={(description) => setDraft((current) => ({ ...current, description }))}
            placeholder="20 minutes of movement"
            maxLength={120}
          />

          <YStack gap="$sm">
            <Text fontSize="$label" fw="$semibold" color="$textSecondary">
              Days
            </Text>
            <XStack flexWrap="wrap" gap="$sm">
              {WEEKDAY_NAMES.map((day, index) => (
                <Chip key={day} label={day} selected={draft.weekdays[index]} onPress={() => setWeekday(index)} />
              ))}
            </XStack>
            {!draft.weekdays.some(Boolean) ? (
              <Text fontSize="$caption" color="$danger">
                Choose at least one day.
              </Text>
            ) : null}
          </YStack>

          <YStack gap="$sm">
            <Text fontSize="$label" fw="$semibold" color="$textSecondary">
              Status
            </Text>
            <XStack gap="$sm">
              <Chip
                label="Active"
                selected={draft.enabled}
                onPress={() => setDraft((current) => ({ ...current, enabled: true }))}
              />
              <Chip
                label="Paused"
                selected={!draft.enabled}
                onPress={() => setDraft((current) => ({ ...current, enabled: false }))}
              />
            </XStack>
          </YStack>

          <Button
            unstyled
            py="$sm"
            onPress={() => setAdvancedOpen((current) => !current)}
            accessibilityState={{ expanded: advancedOpen }}
            pressStyle={{ opacity: 0.65 }}
          >
            <XStack ai="center" jc="space-between">
              <YStack gap="$xs">
                <Text fontSize="$bodyStrong" fw="$semibold" color="$accent">
                  More options
                </Text>
                <Text fontSize="$caption" color="$textMuted">
                  Hard-day version and importance
                </Text>
              </YStack>
              <YStack rotate={advancedOpen ? '90deg' : '0deg'}>
                <ChevronRightIcon size={18} color="$accent" />
              </YStack>
            </XStack>
          </Button>

          {advancedOpen ? (
            <YStack gap="$xl">
              <FormField
                label="Smallest honest version"
                value={draft.minimumTarget}
                onChangeText={(minimumTarget) => setDraft((current) => ({ ...current, minimumTarget }))}
                placeholder="A 5 minute walk"
                hint="Used on minimum days. If empty, your regular target still applies."
                maxLength={120}
              />

              <YStack gap="$sm">
                <Text fontSize="$label" fw="$semibold" color="$textSecondary">
                  Importance in today’s score
                </Text>
                <XStack flexWrap="wrap" gap="$sm">
                  {[
                    { label: 'Light', value: 10 },
                    { label: 'Standard', value: 20 },
                    { label: 'Priority', value: 30 },
                  ].map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      selected={importanceValue(draft.points) === option.value}
                      onPress={() => setDraft((current) => ({ ...current, points: option.value }))}
                    />
                  ))}
                </XStack>
                <Text fontSize="$caption" color="$textMuted">
                  Respect automatically turns all importance weights into a 0–100 daily score.
                </Text>
              </YStack>

              <YStack gap="$sm">
                <Text fontSize="$label" fw="$semibold" color="$textSecondary">
                  On minimum days
                </Text>
                <XStack gap="$sm">
                  <Chip
                    label="Core"
                    selected={draft.required}
                    onPress={() => setDraft((current) => ({ ...current, required: true }))}
                  />
                  <Chip
                    label="Optional"
                    selected={!draft.required}
                    onPress={() => setDraft((current) => ({ ...current, required: false }))}
                  />
                </XStack>
              </YStack>
            </YStack>
          ) : null}

          <PrimaryButton disabled={!draft.title.trim() || !draft.weekdays.some(Boolean)} onPress={save}>
            {editing ? 'Save changes' : 'Add to my plan'}
          </PrimaryButton>
          {editing ? <SecondaryButton onPress={confirmDelete}>Delete promise</SecondaryButton> : null}
        </YStack>
      </ModalSheet>
    </RespectScreen>
  );
}
