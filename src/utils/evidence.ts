import { EvidenceItem } from '../types/scut';

// Items created in-app carry `date`; the seeded sample items only carry `dateCreated`.
export const evidenceDate = (item: EvidenceItem): string =>
  item.date || item.dateCreated || 'Dată necunoscută';
