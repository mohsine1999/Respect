import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { PersistedRespectState } from '../domain/types';

export async function exportRespectBackup(state: PersistedRespectState): Promise<string> {
  const file = new File(Paths.cache, `respect-backup-${new Date().toISOString().slice(0, 10)}.json`);
  file.create({ overwrite: true });
  file.write(JSON.stringify(state, null, 2));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export Respect data' });
  }
  return file.uri;
}
