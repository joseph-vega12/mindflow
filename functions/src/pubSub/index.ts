import { dailyAnalyticsSnapshot } from './dailyAnalyticsSnapshot';
import { dailyBusinessAnalyticsSnapshot } from './dailyBusinessAnalyticsSnapshot';
import { dailyLicensesCheck } from './dailyLicensesCheck';
import { dailyInactivityEmails } from './dailyInactivityEmails';
import { dailyLicenseExpirationEmails } from './dailyLicenseExpirationEmails';

import { scheduledFirestoreBackup } from './backup';

export const pubSubs = {
  dailyAnalyticsSnapshot,
  dailyBusinessAnalyticsSnapshot,
  dailyInactivityEmails,
  dailyLicensesCheck,
  dailyLicenseExpirationEmails,
  scheduledFirestoreBackup
};
