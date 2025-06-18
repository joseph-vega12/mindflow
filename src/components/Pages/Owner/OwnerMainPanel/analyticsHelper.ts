import { cloneDeep, isNil, merge, mergeWith, sortBy } from 'lodash';

import { AnalyticSnapshot, DifficultLevel, AnalyticDateSnapshot, TestType } from 'types';
import { get, set } from 'lodash';

import { AnalyticsFilterForm } from '../FiltersFormProvider';
const testTypes = ['isee', 'shsat', 'ssat', 'sat', 'act', 'lsat', 'gre', 'gmat'];
const difficultLevels = ['middle_school', 'high_school', 'college', 'adult'];

export const getSummedAnalyticSnapshot = (
  sumAnalyticsItems: AnalyticDateSnapshot[],
  values: AnalyticsFilterForm
): any => {
  const analyticsItems = sortBy(sumAnalyticsItems, 'timestampPeriod.start');

  const lastAnalyticsItem = analyticsItems[analyticsItems.length - 1];

  const snapshotKeys = getSnapshotKeys(values);
  const finalSnapshot = createEmptySnapshot();

  if (!values || !sumAnalyticsItems) {
    return finalSnapshot;
  }

  for (const analyticItem of analyticsItems) {
    const snapshot = get(analyticItem, snapshotKeys);

    // Setting counters
    const counterKeys = Object.keys(snapshot.counters);
    for (const counterKey of counterKeys) {
      const oldCounter = get(finalSnapshot, `counters.${counterKey}`);
      const additionalValue = get(snapshot, `counters.${counterKey}`);

      set(finalSnapshot, `counters.${counterKey}`, oldCounter + additionalValue);
    }

    // Setting averages
    const statsKeysPairs: [average: keyof AnalyticSnapshot['stats'], counter: keyof AnalyticSnapshot['stats']][] = [
      ['averageComprehension', 'totalComprehensionReports'],
      ['averageImprovement', 'totalImprovementReports'],
      ['averageLevel', 'totalLevelReports'],
      ['averageWordSpeed', 'totalWordSpeedReports']
    ];
    for (const statKeyPair of statsKeysPairs) {
      const averageKey = ['stats', statKeyPair[0]];
      const counterKey = ['stats', statKeyPair[1]];

      const average = get(finalSnapshot, averageKey);
      const counter = get(finalSnapshot, counterKey);

      const currentSnapshotCounter = get(snapshot, counterKey);
      const currentSnapshotValue = get(snapshot, averageKey);

      if (!currentSnapshotCounter) continue;

      const newAverage = calculateNewAverage(average, counter, currentSnapshotValue);

      set(finalSnapshot, averageKey, newAverage);
      set(finalSnapshot, counterKey, counter + currentSnapshotCounter);
    }
  }

  // Setting users and licenses
  const lastSnapshotUsersInfo = get(lastAnalyticsItem, [...snapshotKeys, 'users']);
  set(finalSnapshot, ['users'], lastSnapshotUsersInfo);

  const lastSnapshotLicensesInfo = get(lastAnalyticsItem, [...snapshotKeys, 'licenses']);
  set(finalSnapshot, ['licenses'], lastSnapshotLicensesInfo);

  return finalSnapshot;
};

const getSnapshotKeys = (values: AnalyticsFilterForm) => {
  const { difficultLevel, testType } = values;
  if (!difficultLevel && !testType) {
    return ['total'];
  }

  if (difficultLevel && difficultLevels.includes(difficultLevel)) {
    return ['difficultLevels', difficultLevel];
  }

  if (testType && testTypes.includes(testType)) {
    return ['testTypes', testType];
  }

  return ['total'];
};

// functions ctrl c + ctrl v
export const createEmptySnapshot = () => {
  return {
    users: {
      total: 0,
      createdToday: 0,

      loggedIn: 0
    },

    licenses: {
      activatedToday: 0,

      active: 0,
      expired: 0
    },

    counters: {
      diagnostics: 0,

      speedRead: 0,
      practices: 0,
      brainEyeCoordination: 0,

      videos: 0
    },

    stats: {
      averageLevel: 1,
      totalLevelReports: 0,

      averageComprehension: 0,
      totalComprehensionReports: 0,

      averageImprovement: 0,
      totalImprovementReports: 0,

      averageWordSpeed: 0,
      totalWordSpeedReports: 0
    }
  };
};

const calculateNewAverage = (oldAverage: number, oldReports: number, newEntry: number) => {
  const newReports = oldReports + 1;
  const averageDiff = (newEntry - oldAverage) / newReports;

  return Math.floor(oldAverage + averageDiff);
};
