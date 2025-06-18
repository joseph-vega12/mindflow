import React, { FC } from 'react';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { FirebaseObjectWithKey } from 'types';

interface StudentHistoryChartProps {
  data: FirebaseObjectWithKey<any>;
}

export const StudentHistoryChart: FC<StudentHistoryChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="90%">
      <LineChart data={data} margin={{ top: 10, right: 80, left: 0, bottom: 0 }}>
        <XAxis />
        <YAxis />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line type="monotone" stroke="#A9273D" />
        <Line type="monotone" stroke="#999999" />
        <Line type="monotone" stroke="#94D4D6" />
      </LineChart>
    </ResponsiveContainer>
  );
};
