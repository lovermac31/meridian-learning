import { normalizeVietnamesePhone } from '../i18n/content/samplePack';

export type ReserveFormValues = { name: string; phone: string; childAge: string; group: string };

export function validateStoryClubReserve(values: ReserveFormValues): 'name' | 'phone' | 'age' | 'group' | null {
  if (!values.name.trim() || values.name.trim().length > 120) return 'name';
  if (!normalizeVietnamesePhone(values.phone)) return 'phone';
  const age = Number(values.childAge);
  if (!Number.isInteger(age) || age < 5 || age > 8) return 'age';
  if (!/^(sat-0900|flexible)$/.test(values.group)) return 'group';
  return null;
}

export function createStoryClubTransferMemo(shortId: string): string {
  const safeId = shortId.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  if (safeId.length < 4) throw new Error('A transfer memo needs at least four letters or numbers.');
  return `SC-${safeId}`;
}
