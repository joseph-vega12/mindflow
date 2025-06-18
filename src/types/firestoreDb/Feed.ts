import { FirestoreDocumentWithId } from 'types';
import { UserDetailsWithId } from '.';
import { UserTestType } from './TestResult';

export type FeedActivityType = 'diagnostic' | 'video' | UserTestType;

export type FeedActivity = DiagnosticFeedActivity | PracticeFeedActivity | SpeedReadFeedActivity | VideoFeedActivity;
export type FeedActivityWithId = FirestoreDocumentWithId<FeedActivity>;

export interface DiagnosticFeedActivity extends BaseFeedActivity {
  type: 'diagnostic';
}

export interface BrainEyeCoordinationFeedActivity extends BaseFeedActivity {
  type: 'brain-eye-coordination';
}
export interface PracticeFeedActivity extends BaseFeedActivity {
  type: 'practice';
}

export interface SpeedReadFeedActivity extends BaseFeedActivity {
  type: 'speed-read';
}

export interface VideoFeedActivity extends BaseFeedActivity {
  type: 'video';
}

interface BaseFeedActivity {
  relatedKey: string;
  type: FeedActivityType;

  businessId?: string;

  user: Pick<UserDetailsWithId, 'id' | 'firstName' | 'lastName' | 'picture'>;
  userId?: string;

  timestamp: number;
}
