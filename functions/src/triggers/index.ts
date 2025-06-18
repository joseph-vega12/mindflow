import { onBusinessApprovalCreated } from './onBusinessApprovalCreated';
import { onDiagnosticResultCreated } from './onDiagnosticResultCreated';
import { onFeedActivityDeleted } from './onFeedActivityDeleted';
import { onFeedActivityCreated } from './onFeedActivityCreated';
import { onLeadCreated } from './onLeadCreated';
import { onLicenseWrite } from './onLicenseWrite';
import { onTestResultCreated } from './onTestResultCreated';
import { onUserCreated } from './onUserCreated';
import { onUserWrite } from './onUserWrite';

export const triggers = {
  // Firestore triggers
  onBusinessApprovalCreated,
  onDiagnosticResultCreated,
  onFeedActivityCreated,
  onFeedActivityDeleted,
  onLeadCreated,
  onLicenseWrite,
  onTestResultCreated,
  onUserCreated,
  onUserWrite
};
