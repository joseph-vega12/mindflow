import { FirebaseItem } from 'types';

import { Business } from './Business';
import { BusinessApproval } from './BusinessApproval';
import { CustomEssay } from './CustomEssay';
import { Diagnostic, DiagnosticResult } from './Diagnostic';
import { Essay } from './Essay';
import { FeedActivity } from './Feed';
import { License } from './License';
import { TestResult } from './TestResult';
import { UserDetails } from './User';

export interface FirestoreDatabase {
  business: FirebaseItem<Business>;
  businessApprovals: FirebaseItem<BusinessApproval>;
  customEssays: FirebaseItem<CustomEssay>;

  diagnostics: FirebaseItem<Diagnostic>;
  diagnosticResults: FirebaseItem<DiagnosticResult>;

  essays: FirebaseItem<Essay>;
  feed: FirebaseItem<FeedActivity>;

  licenses: FirebaseItem<License>;

  testResults: FirebaseItem<TestResult>;
  user: FirebaseItem<UserDetails>;
}
