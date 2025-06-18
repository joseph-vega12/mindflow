import React, { FC, useMemo } from 'react';

import {
  Bar,
  BarChart as RechartBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts';

import { BaseCard } from 'components/common';

export const BarChart: FC<any> = ({ businesses }) => {
  const getTreatedData = useMemo(() => {
    return businesses?.map((business) => ({ business: business.name, affiliation: business.users.length }));
  }, [businesses]);

  const dummyData = [
    { affiliation2: 5, affiliation: 10, business: 'USA test prep' },
    { affiliation2: 12, affiliation: 25, business: 'Online Test prep' },
    { affiliation2: 33, affiliation: 15, business: 'USA test prep' },
    { affiliation2: 4, affiliation: 30, business: 'Online Test prep' },
    { affiliation2: 40, affiliation: 20, business: 'USA test prep' }
  ];

  return (
    <ResponsiveContainer width="100%" height="80%">
      <RechartBarChart data={dummyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barGap={0}>
        <XAxis dataKey="business" />
        <YAxis yAxisId="affiliation" domain={[0, 45]} ticks={[15, 30, 45]} />
        <YAxis yAxisId="affiliation2" domain={[0, 45]} ticks={[15, 30, 45]} hide />
        <Legend verticalAlign="top" align="center" />
        <Bar yAxisId="affiliation" dataKey="affiliation" fill="#05314A" barSize={20} />
        <Bar yAxisId="affiliation2" dataKey="affiliation2" fill="#94D4D6" barSize={20} />
      </RechartBarChart>
    </ResponsiveContainer>
  );
};
