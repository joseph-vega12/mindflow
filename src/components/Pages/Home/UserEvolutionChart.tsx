import React, { FC, useMemo } from 'react';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { get, meanBy } from 'lodash';

import { formatTimestamp } from 'lib/utils';
import { UserActivity, UserActivityStatsReportItem } from 'types';

interface UserEvolutionChartProps {
  stats: UserActivity['stats'];
}

export const UserEvolutionChart: FC<UserEvolutionChartProps> = ({ stats }) => {
  const treatedData = useMemo(() => {
    const testResults = get(stats, 'testResults', []) as UserActivityStatsReportItem[];

    const resultsByDate: Record<string, any> = {};

    for (const result of testResults) {
      const date = formatTimestamp(result?.timestamp, 'MM/DD');

      const dateResults = resultsByDate[date] ?? [];

      dateResults.push({
        wordSpeed: Math.floor(result?.wordSpeed),
        date,
        comprehension: result?.comprehension
      });

      resultsByDate[date] = dateResults;
    }

    const averageResults = Object.entries(resultsByDate).map(([date, results]) => {
      return {
        wordSpeed: Math.floor(meanBy(results, 'wordSpeed')),
        date,
        comprehension: Math.floor(meanBy(results, 'comprehension'))
      };
    });

    return averageResults;
  }, [stats]);

  return (
    // <ResponsiveContainer width="100%" height="100%">
    <ResponsiveContainer >
      <AreaChart data={treatedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="wordSpeed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#B3E0E2" stopOpacity={1} />
            <stop offset="95%" stopColor="#B3E0E2" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="comprehension" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#999999" stopOpacity={1} />
            <stop offset="95%" stopColor="#999999" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          yAxisId="comprehension"
          type="monotone"
          dataKey="comprehension"
          stroke="#999999"
          fillOpacity={1}
          fill="url(#comprehension)"
        />
        <Area
          type="monotone"
          dataKey="wordSpeed"
          yAxisId="wordSpeed"
          stroke="#B3E0E2"
          fillOpacity={1}
          fill="url(#wordSpeed)"
        />
        <XAxis dataKey="date" tick={{ fontSize: '12px', fill: '##999999' }} />
        <YAxis
          yAxisId="comprehension"
          domain={[0, 100]}
          ticks={[25, 50, 75, 100]}
          tick={{ fontSize: '12px', fill: '##999999' }}
        />
        <YAxis
          yAxisId="wordSpeed"
          orientation="right"
          domain={[0, 1000]}
          ticks={[200, 400, 600, 800, 1000]}
          tick={{ fontSize: '12px', fill: '#A9273D' }}
        />
        <Tooltip />
      </AreaChart>
    </ResponsiveContainer>
  );
};
