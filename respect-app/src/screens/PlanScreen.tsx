import { useState } from 'react';
import { Alert } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
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
import { useRespect } from '../data/RespectProvider';
import type { Commitment } from '../domain/types';
import { WEEKDAY_NAMES } from '../utils/dates';
import { PlusIcon } from '../components/Icons';

type Draft = Pick<Commitment, 'title' | 'description' | 'points' | 'category' | 'minimumTarget' | 'weekdays' | 'enabled' | 'required'>;

const blankDraft = (): Draft => ({
  title: '',
  description: '',
  points: 10,
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

export function PlanScreen() {
  const { state, addCommitment, saveCommitment, deleteCommitment } = useRespect();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Commitment | null>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft);

  const beginAdd = () => {
    setEditing(null);
    setDraft(blankDraft());
    setOpen(true);
  };

  const beginEdit = (commitment: Commitment) => {
    setEditing(commitment);
    setDraft(toDraft(commitment));
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
    Alert.alert('Delete commitment?', 'Past days keep their historical snapshot.', [
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

  return (
    <RespectScreen>
      <ScreenHeader
        eyebrow="This is your operating standard"
        title="My plan"
        action={<IconButton label="Add commitment" icon={<PlusIcon size={20} color="$accent" />} onPress={beginAdd} />}
      />

      <Text fontSize="$body" color="$textSecondary">
        Keep it exact and believable. Changes apply forward; completed days remain intact.
      </Text>

      <YStack gap="$sm">
        <SectionHeader
          title="Commitments"
          detail={`${state.commitments.filter((commitment) => commitment.enabled).length} active`}
        />
        {state.commitments.length ? (
          <CommitmentList
            commitments={state.commitments}
            mode="plan"
            onPress={(commitment) => beginEdit(commitment as Commitment)}
          />
        ) : (
          <EmptyState
            title="Build your plan"
            detail="Add the few commitments that define a good day."
            action={<PrimaryButton onPress={beginAdd}>Add commitment</PrimaryButton>}
          />
        )}
      </YStack>

      {state.commitments.length ? <PrimaryButton onPress={beginAdd}>Add commitment</PrimaryButton> : null}

      <ModalSheet open={open} onOpenChange={setOpen} title={editing ? 'Edit commitment' : 'New commitment'}>
        <YStack gap="$xl" pb="$4xl">
          <FormField
            label="Name"
            value={draft.title}
            onChangeText={(title) => setDraft((current) => ({ ...current, title }))}
            placeholder="Movement"
          />
          <FormField
            label="Target"
            value={draft.description}
            onChangeText={(description) => setDraft((current) => ({ ...current, description }))}
            placeholder="20+ minutes"
          />
          <XStack gap="$md">
            <YStack f={1}>
              <FormField
                label="Points"
                value={String(draft.points)}
                onChangeText={(points) =>
                  setDraft((current) => ({ ...current, points: Math.max(0, Number(points.replace(/\D/g, '')) || 0) }))
                }
                keyboardType="number-pad"
              />
            </YStack>
            <YStack f={1}>
              <FormField
                label="Category"
                value={draft.category}
                onChangeText={(category) => setDraft((current) => ({ ...current, category }))}
                placeholder="Health"
              />
            </YStack>
          </XStack>
          <FormField
            label="Minimum version"
            value={draft.minimumTarget}
            onChangeText={(minimumTarget) => setDraft((current) => ({ ...current, minimumTarget }))}
            placeholder="A 5 minute walk"
            hint="The honest smallest version for minimum days."
          />

          <YStack gap="$sm">
            <Text fontSize="$label" fw="$medium" color="$textSecondary">
              Schedule
            </Text>
            <XStack flexWrap="wrap" gap="$sm">
              {WEEKDAY_NAMES.map((day, index) => (
                <Chip key={day} label={day} selected={draft.weekdays[index]} onPress={() => setWeekday(index)} />
              ))}
            </XStack>
          </YStack>

          <YStack gap="$sm">
            <Text fontSize="$label" fw="$medium" color="$textSecondary">
              Status
            </Text>
            <XStack gap="$sm">
              <Chip
                label={draft.enabled ? 'Active' : 'Paused'}
                selected={draft.enabled}
                onPress={() => setDraft((current) => ({ ...current, enabled: !current.enabled }))}
              />
              <Chip
                label={draft.required ? 'Required' : 'Optional'}
                selected={draft.required}
                onPress={() => setDraft((current) => ({ ...current, required: !current.required }))}
              />
            </XStack>
          </YStack>

          <PrimaryButton disabled={!draft.title.trim() || !draft.weekdays.some(Boolean)} onPress={save}>
            {editing ? 'Save changes' : 'Add to plan'}
          </PrimaryButton>
          {editing ? <SecondaryButton onPress={confirmDelete}>Delete commitment</SecondaryButton> : null}
        </YStack>
      </ModalSheet>
    </RespectScreen>
  );
}
