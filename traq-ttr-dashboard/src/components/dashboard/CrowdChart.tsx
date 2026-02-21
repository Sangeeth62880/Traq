import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { getTrainHistory, TrainReading } from '../../services/influxService';
import { useTTRStore } from '../../store/ttrStore';

export const CrowdChart: React.FC = () => {
    const { selectedTrain } = useTTRStore();
    const [history, setHistory] = useState<TrainReading[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!selectedTrain) return;

        setIsLoading(true);
        getTrainHistory(selectedTrain.trainNumber, 6)
            .then((data) => {
                setHistory(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, [selectedTrain]);

    const chartData = history.map((r) => ({
        time: r.timestamp.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        }),
        people: r.peopleCount,
        wifi: r.wifi,
    }));

    return (
        <div className="bg-traq-card rounded-xl p-5 border border-white/10">
            <h3 className="text-white font-bold mb-4">
                People Count Over Time (Last 6h)
            </h3>

            {isLoading ? (
                <div className="h-48 flex items-center justify-center text-white/30">
                    Loading chart data...
                </div>
            ) : chartData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-white/30">
                    No historical data available
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="peopleFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00BCD4" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#00BCD4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="time"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1B2838',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'white',
                            }}
                            labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="people"
                            stroke="#00BCD4"
                            fill="url(#peopleFill)"
                            strokeWidth={2}
                            name="People Count"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};
