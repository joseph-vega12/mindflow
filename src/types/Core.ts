import { UserTestType } from '.';

export type DifficultLevel = 'middle_school' | 'high_school' | 'college' | 'adult';
export type TestType =
  | 'isee'
  | 'shsat'
  | 'ssat'
  | 'sat'
  | 'act'
  | 'lsat'
  | 'gre'
  | 'gmat'
  | 'toefl'
  | 'esl'
  | 'mcat'
  | 'pte'
  | 'ielts';

export type CurrentLevel = DifficultLevel | 'law_school' | 'medical_school' | 'graduate_school' | 'business_school';

export type WhereDidYouHearAboutUs =
  | 'consultant'
  | 'former'
  | 'google'
  | 'mlt'
  | 'jpsptso'
  | 'supertutortv'
  | 'test_prep_company'
  | 'tutor'
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'youtube'
  | 'online_course'
  | 'school'
  | 'teacher'
  | 'club'
  | 'dominate_prep'
  | 'other';

export const difficultTestTypeRelation: Record<DifficultLevel, TestType[]> = {
  adult: ['lsat', 'gre', 'gmat', 'mcat'],
  college: ['lsat', 'gre', 'gmat', 'mcat'],
  high_school: ['sat', 'act'],
  middle_school: ['isee', 'shsat', 'ssat']
};

export const userFriendlyDifficultLevel: Record<DifficultLevel, string> = {
  adult: 'Adult',
  college: 'College',
  high_school: 'High School',
  middle_school: 'Middle School'
};

export const diagnosticRequirementsMultiplier: DiagnosticRequirements = {
  practice: 4,
  'speed-read': 2
};

export const testTypeOptions = {
  isee: 'ISEE',
  shsat: 'SHSAT',
  ssat: 'SSAT',
  sat: 'IELTS/PTE/TOEFL',
  act: 'ACT',
  lsat: 'LSAT',
  gre: 'GRE',
  gmat: 'GMAT/EA',
  mcat: 'MCAT'
};

export const whereDidYouHearAboutUsOptions: Record<WhereDidYouHearAboutUs, string> = {
  consultant: 'Admissions Officer / Consultant',
  former: 'Former or Current Student',
  google: 'Google',
  mlt: 'MLT',
  jpsptso: 'JPS PTSO',
  test_prep_company: 'Test Prep Company',
  dominate_prep: 'Dominate Prep',
  supertutortv: 'SuperTutorTV',
  tutor: 'Tutor',
  twitter: 'Twitter',
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  online_course: 'Online Course',
  school: 'School',
  teacher: 'Teacher',
  club: 'Club',
  other: 'Other'
};

type DiagnosticTestRequirements = Partial<Record<UserTestType & string, number>>;

export interface DiagnosticRequirements extends DiagnosticTestRequirements { }
