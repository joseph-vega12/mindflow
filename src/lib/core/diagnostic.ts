import { get, groupBy, uniqBy } from 'lodash';

import {
  DiagnosticRequirements,
  diagnosticRequirementsMultiplier,
  ResumedDiagnosticDocumentWithId,
  TestResultWithId
} from 'types';

export const getDiagnosticRequirements = (diagnostic: ResumedDiagnosticDocumentWithId): DiagnosticRequirements => {
  const { order } = diagnostic;

  const {
    practice: practiceMultiplier = 0,
    'brain-eye-coordination': brainEyeMultiplier = 0,
    'speed-read': speedReadMultiplier = 0
  } = diagnosticRequirementsMultiplier;

  return {
    'speed-read': speedReadMultiplier * order,
    'brain-eye-coordination': brainEyeMultiplier * order,
    practice: practiceMultiplier * order
  };
};

export const diagnosticRequirementsFulfilled = (
  diagnostic: ResumedDiagnosticDocumentWithId,
  testResults: TestResultWithId[]
): boolean => {
  const requirements = getDiagnosticRequirements(diagnostic);

  const groupedResults = groupBy(testResults, 'type');

  for (const requirementKey in requirements) {
    const requirement = get(requirements, requirementKey, 0);
    const resultsNumber = get(groupedResults, [requirementKey, 'length'], 0);

    if (requirement > resultsNumber) {
      return false;
    }
  }

  return true;
};
