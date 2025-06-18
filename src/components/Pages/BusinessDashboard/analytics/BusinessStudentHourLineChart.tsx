import React, { FC, useMemo } from 'react';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

import { BaseCard } from 'components/common';
import { color } from '@chakra-ui/react';
import { colors } from 'theme/foundations';

interface BusinessStudentHourLineChartProps {
    title: string;
    businesses: [];
}
const data = [
    {
        name: '09 | 17',
        activeStudents: 4,
        hours: 6
    },
    {
        name: '10 | 07',
        activeStudents: 2,
        hours: 3
    },
    {
        name: '11 | 07',
        activeStudents: 3,
        hours: 4
    },
    {
        name: '12 | 07',
        activeStudents: 4,
        hours: 2
    },
    {
        name: '13 | 07',
        activeStudents: 5,
        hours: 5
    },
    {
        name: '14 | 07',
        activeStudents: 6,
        hours: 3
    },
    {
        name: '15 | 07',
        activeStudents: 2,
        hours: 6
    }
];

export const BusinessStudentHourLineChart: FC<BusinessStudentHourLineChartProps> = ({ title, businesses }) => {
    const getTreatedData = useMemo(() => {
        // return businesses?.map((business) => ({ business: business.name, affiliation: business.users.length }));
        return businesses;
    }, [businesses]);

    return (
        <BaseCard flex="1.8" title={title} borderRadius={18}>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    {/* <Legend /> */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="activeStudents"
                        stroke={colors.orange[500]}
                        activeDot={{ r: 8 }}
                    />
                    <Line yAxisId="right" type="monotone" dataKey="hours" stroke={colors.teal[500]} />
                </LineChart>
            </ResponsiveContainer>
        </BaseCard>
    );
};
