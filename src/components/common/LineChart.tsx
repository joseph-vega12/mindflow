import React, { FC } from 'react';

import {
  CartesianGrid,
  Line,
  LineChart as RechartLineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ComposedChart,
  Area
} from 'recharts';

import { FirebaseObjectWithKey } from 'types';

interface ActiveStudentsChartProps {
  data: FirebaseObjectWithKey<any>;
}

const dummyData = [
  { name: 'Jan', value1: 20, value2: 15, value3: 15 },
  { name: 'Feb', value1: 25, value2: 18, value3: 15 },
  { name: 'Mar', value1: 30, value2: 22, value3: 15 },
  { name: 'Apr', value1: 28, value2: 20, value3: 15 },
  { name: 'May', value1: 35, value2: 25, value3: 23 },
  { name: 'Jun', value1: 40, value2: 30, value3: 15 },
  { name: 'Jul', value1: 38, value2: 28, value3: 15 },
  { name: 'Aug', value1: 45, value2: 35, value3: 15 },
  { name: 'Sep', value1: 50, value2: 40, value3: 15 },
  { name: 'Oct', value1: 48, value2: 38, value3: 15 },
  { name: 'Nov', value1: 55, value2: 45, value3: 15 },
  { name: 'Dec', value1: 60, value2: 50, value3: 15 }
];

export const LineChart: FC<any> = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height="90%">
      <ComposedChart data={dummyData} margin={{ top: 10, right: 80, left: 0, bottom: 0 }}>
        <XAxis />
        <YAxis />
        <defs>
          {/* Define linear gradients for the areas with gradients */}
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
          {/* Add more gradients if needed */}
        </defs>
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="value1" stroke="#A9273D" />
        <Area
          type="monotone"
          dataKey="value2"
          fill="url(#colorPv)
"
          stroke="#8884d8"
        />
        <Area type="monotone" dataKey="value3" fill="url(#colorUv)" stroke="#94D4D6" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
