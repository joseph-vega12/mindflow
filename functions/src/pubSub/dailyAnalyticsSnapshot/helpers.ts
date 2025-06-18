import { get, set } from 'lodash';

import * as moment from 'moment';
import { AnalyticDateSnapshot, TestType, DifficultLevel } from 'types';

const testTypes = ['isee', 'shsat', 'ssat', 'sat', 'act', 'lsat', 'gre', 'gmat'];
const difficultLevels = ['middle_school', 'high_school', 'college', 'adult'];

export const incrementAnalyticsKey = (
  obj: Record<string, any>,
  analyticsKey: { testType: TestType; difficultLevel: DifficultLevel },
  analyticsPath: string[],
  incrementValue: number
) => {
  const { testType, difficultLevel } = analyticsKey;

  const paths = [['total'], ['difficultLevels', difficultLevel], ['testTypes', testType]];

  for (const partialPath of paths) {
    const path = [...partialPath, ...analyticsPath];
    const value = get(obj, path, 0);

    set(obj, path, value + incrementValue);
  }
};

export const setAnalyticsKey = (
  obj: Record<string, any>,
  analyticsKey: { testType: TestType; difficultLevel: DifficultLevel },
  analyticsPath: string[],
  value: number
) => {
  const { testType, difficultLevel } = analyticsKey;

  const paths = [['total'], ['difficultLevels', difficultLevel], ['testTypes', testType]];

  for (const partialPath of paths) {
    const path = [...partialPath, ...analyticsPath];

    set(obj, path, value);
  }
};

export const setAverageReportAnalyticsKey = (
  obj: Record<string, any>,
  analyticsKey: { testType: TestType; difficultLevel: DifficultLevel },
  analyticsAveragePath: string[],
  analyticsCounterPath: string[],
  newEntry?: number
) => {
  const { testType, difficultLevel } = analyticsKey;

  if (typeof newEntry === 'undefined') return;

  const paths = [['total'], ['difficultLevels', difficultLevel], ['testTypes', testType]];

  for (const partialPath of paths) {
    const averagePath = [...partialPath, ...analyticsAveragePath];
    const counterPath = [...partialPath, ...analyticsCounterPath];

    const average = get(obj, averagePath, 0);
    const counter = get(obj, counterPath, 0);

    const newAverage = calculateNewAverage(average, counter, newEntry);

    set(obj, averagePath, newAverage);
    set(obj, counterPath, counter + 1);
  }
};

export const createAnaylyticDateSnapshot = (startTimestamp: number, endTimestamp: number): AnalyticDateSnapshot => {
  const createSnapshotObjectFromArr = (arr: string[]) => {
    return arr.reduce((prev, curr) => {
      return {
        ...prev,
        [curr]: createEmptySnapshot()
      };
    }, {});
  };

  const totalSnapshot = createEmptySnapshot();

  const difficultLevelsSnapshot = createSnapshotObjectFromArr(difficultLevels);
  const testTypeSnapshot = createSnapshotObjectFromArr(testTypes);

  return {
    total: totalSnapshot,
    //@ts-ignore
    difficultLevels: difficultLevelsSnapshot,
    //@ts-ignore
    testTypes: testTypeSnapshot,
    timestampPeriod: {
      start: startTimestamp,
      end: endTimestamp,
      date: moment(startTimestamp, 'x').format('YYYY-MM-DD')
    }
  };
};

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
