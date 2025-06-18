export type AvailableEmailTemplates =
  | '1-welcome'
  | '2-post-onboarding'
  | '3-one-week-incomplete-onboarding'
  | '4-two-weeks-incomplete-onboarding'
  | '5-one-week-inactive'
  | '6-three-weeks-inactive'
  | '7-five-weeks-inactive'
  | '8-ten-weeks-inactive'
  | '9-one-week-no-second-diagnostic-test'
  | '10-one-week-no-third-diagnostic-test'
  | '11-congratulations'
  | '12-feedback'
  | '13-diagnostic-result'
  | '14-purchase-receipt'
  | '15-thirty-days-license-expiration'
  | '16-two-days-license-expiration'
  | '17-license-expiration-support'
  | '18-new-lead-support'
  | '19-new-user-support'
  | '20-new-business-approval-support'
  | '21-user-feedback'
  | '22-business-student-licenses-download'
  | '23-after-free-speed-read-completed'
  | 'reset-password'
  | 'temporary-password'
  | 'password-reset-success';

// # By triggers
// '1-welcome' -> After license creation // onLicenseCreated
// '2-post-onboarding' -> After tutorial completed // onTutorialCompleted
// '11-congratulations' -> After finishes the program // CERTIFICATE

// PubSub function
// '3-one-week-incomplete-onboarding' -> Not finished tutorial after 7 days // onTutorialIncomplete
// '4-two-weeks-incomplete-onboarding' -> Not finished tutorial after 14 days // onTutorialIncomplete
// '5-one-week-inactive' -> Not seen in last 7 days // onInactive
// '6-three-weeks-inactive' -> Not seen in last 21 days // onInactive
// '7-five-weeks-inactive' -> Not seen in last 35 days // onInactive
// '8-ten-weeks-inactive' -> Not seen in last 50 days // onInactive
// '9-one-week-no-second-diagnostic-test' -> no second diagnostic for last 7 days // onNoSecondDiagnosticTest
// '10-one-week-no-third-diagnostic-test' -> no third diagnostic for last 7 days // onNoThirdDiagnosticTest
// '12-feedback'; -> 3 days after finished the program // FEEDBACK
