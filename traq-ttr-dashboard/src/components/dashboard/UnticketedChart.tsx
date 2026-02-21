import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { CoachTicketAnalysis } from '../../types';

interface UnticketedChartProps {
    coaches: CoachTicketAnalysis[];
}

export const UnticketedChart: React.FC<UnticketedChartProps> = ({ coaches }) => {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const ticketed = payload.find((p: any) => p.dataKey === 'ticketedCount');
            const unticketed = payload.find((p: any) => p.dataKey === 'unticketedCount');
            const data = payload[0].payload as CoachTicketAnalysis;

            return (
                <div className="bg-[#1B2838] border border-[#2D4059] p-3 rounded-md shadow-lg">
                    <p className="text-white font-bold mb-1 border-b border-[#2D4059] pb-1">
                        Coach {label}
                    </p>
                    <div className="flex justify-between items-center mt-2 gap-4">
                        <span className="text-sm" style={{ color: ticketed?.color }}>Ticketed:</span>
                        <span className="text-sm font-semibold text-white">{ticketed?.value}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 gap-4">
                        <span className="text-sm" style={{ color: unticketed?.color }}>Unticketed:</span>
                        <span className="text-sm font-semibold text-white">{unticketed?.value}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-1 border-t border-[#2D4059]">
                        <span className="text-xs text-gray-400">Unticketed %:</span>
                        <span className="text-xs font-bold text-white">
                            {data.unticketedPercent.toFixed(1)}%
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-traq-card rounded-lg p-4 shadow-md w-full h-[300px] flex flex-col">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Ticketed vs Unticketed per Coach
            </h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={coaches} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D4059" vertical={false} />
                        <XAxis
                            dataKey="coachId"
                            tick={{ fill: '#8C9BAB', fontSize: 12 }}
                            axisLine={{ stroke: '#2D4059' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: '#8C9BAB', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Legend
                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                            iconType="circle"
                        />
                        <Bar
                            dataKey="ticketedCount"
                            name="Ticketed"
                            fill="#4CAF50"
                            radius={[2, 2, 0, 0]}
                            maxBarSize={30}
                            stackId="a"
                        />
                        <Bar
                            dataKey="unticketedCount"
                            name="Unticketed"
                            fill="#F44336"
                            radius={[2, 2, 0, 0]}
                            maxBarSize={30}
                            stackId="a"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
