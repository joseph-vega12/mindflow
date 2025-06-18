import React, { FC, useMemo } from 'react';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { BaseCard } from 'components/common';

import { BusinessWithUsers } from '.';

interface BTOBPanelAffiliationChartProps {
  businesses: BusinessWithUsers[];
}

export const BTOBPanelAffiliationChart: FC<BTOBPanelAffiliationChartProps> = ({ businesses }) => {
  const getTreatedData = useMemo(() => {
    return businesses?.map((business) => ({ business: business.name, affiliation: business?.users?.length }));
  }, [businesses]);

  return (
    <BaseCard flex="1.8" title="Students Affiliation per Company">
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={getTreatedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="business" />
          <YAxis yAxisId="affiliation" domain={[0, 45]} ticks={[15, 30, 45]} />
          <Tooltip />
          <Bar yAxisId="affiliation" dataKey="affiliation" fill="#05314A" />
        </BarChart>
      </ResponsiveContainer>
    </BaseCard>
  );
};
