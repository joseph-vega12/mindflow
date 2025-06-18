import React, { FC } from 'react';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface MainPanelComparisionChartProps {
  data: Record<string, unknown>[];
}

export const MainPanelComparisionChart: FC<MainPanelComparisionChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="90%">
      <BarChart data={data} margin={{ top: 10, right: 80, left: 0, bottom: 0 }}>
        <XAxis />
        <YAxis />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Bar dataKey="" />
      </BarChart>
    </ResponsiveContainer>
  );
};
