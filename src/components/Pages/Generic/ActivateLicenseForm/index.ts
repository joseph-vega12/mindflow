import Joi from 'joi';

import { CurrentLevel, difficultTestTypeRelation, TestType, UserDetails } from 'types';

export { ActivateLicenseForm } from './Form';

export type SelectedUserFields = Pick<
  UserDetails,
  | 'email'
  | 'currentLevel'
  | 'firstName'
  | 'lastName'
  | 'examDate'
  | 'difficultLevel'
  | 'testType'
  | 'phone'
  | 'schoolName'
  | 'whereDidYouHearAboutUs'
  | 'whereDidYouHearAboutUsObservation'
>;

export interface SubmitValues extends SelectedUserFields {
  password: string;
}

export const userSubmitSchema = Joi.object<SubmitValues>({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .min(5)
    .max(50)
    .required(),
  password: Joi.string().min(6).max(50).required(),
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  schoolName: Joi.string().min(3).required(),
  examDate: Joi.string().required(),
  testType: Joi.string().required(),
  currentLevel: Joi.string().required(),
  phone: Joi.string().required(),
  whereDidYouHearAboutUs: Joi.string().required(),
  whereDidYouHearAboutUsObservation: Joi.string()
}).required();

export const currentLevelsOptions: Record<CurrentLevel, string> = {
  middle_school: 'Middle School',
  high_school: 'High School',
  college: 'College',
  adult: 'Adult',
  law_school: 'Law School',
  medical_school: 'Medical School',
  graduate_school: 'Graduate School',
  business_school: 'Business School'
};

export const currentLevelTestTypes: Record<CurrentLevel, TestType[]> = {
  ...difficultTestTypeRelation,
  high_school: [...difficultTestTypeRelation.high_school, 'toefl', 'pte', 'ielts'],
  adult: [...difficultTestTypeRelation.adult, 'esl', 'toefl'],
  college: [...difficultTestTypeRelation.college, 'toefl', 'ielts', 'pte'],
  law_school: ['lsat'],
  medical_school: ['mcat'],
  graduate_school: ['gre', 'toefl', 'pte', 'ielts'],
  business_school: difficultTestTypeRelation.adult
};
