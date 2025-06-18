import { FirestoreDocumentWithId } from 'types';

import { Essay } from './Essay';

export interface CustomEssay extends Omit<Essay, 'difficult' | 'category' | 'speedTestOnly' | 'preTest'> {
  userId: string;

  timestamp: number;
}

export type CustomEssayDocumentWithId = FirestoreDocumentWithId<CustomEssay>;

export type EssayOrCustomEssay = { isCustom?: boolean } & (CustomEssay | Essay);
export type EssayOrCustomEssayDocumentWithId = FirestoreDocumentWithId<EssayOrCustomEssay>;
