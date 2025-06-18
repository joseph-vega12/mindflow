import { DifficultLevel, TestType } from '..';

export interface AnalyticDateSnapshot {
  total: AnalyticSnapshot;

  difficultLevels: Record<DifficultLevel, AnalyticSnapshot>;
  testTypes: Record<TestType, AnalyticSnapshot>;

  timestampPeriod: {
    start: number;
    end: number;
    date?: string;
  };
}

export interface AnalyticSnapshot {
  users: {
    total: number;
    createdToday: number;

    loggedIn: number;
  };

  licenses: {
    activatedToday: number;

    active: number;
    expired: number;
  };

  counters: {
    diagnostics: number;

    speedRead: number;
    practices: number;
    brainEyeCoordination: number;

    videos: number;
  };

  stats: {
    averageLevel: number;
    totalLevelReports: number;

    averageComprehension: number;
    totalComprehensionReports: number;

    averageImprovement: number;
    totalImprovementReports: number;

    averageWordSpeed: number;
    totalWordSpeedReports: number;
  };
}
