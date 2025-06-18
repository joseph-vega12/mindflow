import React, { FC, useMemo } from 'react';

import { Bar, BarChart, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { BaseCard } from 'components/common';
import { colors } from 'theme/foundations';

interface BTOBPanelAffiliationChartProps {
    title: string;
    compareSpeed: boolean;
    data: any;
}

export const TestTypeBarChart: FC<BTOBPanelAffiliationChartProps> = ({ title, compareSpeed, data }) => {
    // const getTreatedData = useMemo(() => {
    //     // return businesses?.map((business) => ({ business: business.name, affiliation: business.users.length }));
    //     return businesses;
    // }, [businesses]);

    return (
        <BaseCard flex="1.8" title={title} borderRadius={18}>
            <ResponsiveContainer width="100%" height="90%">
                {compareSpeed ? (
                    <BarChart data={data}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" barSize={35} />
                    </BarChart>
                ) : (
                    <BarChart data={data}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="StartingSpeed" barSize={25} fill={colors.teal[500]} />
                        <Bar dataKey="BestSpeed" barSize={25} fill={colors.blue[500]} />
                        <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '15px' }} />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </BaseCard>
    );
};
