import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStockStore } from '../store/useStockStore';
import { fetchStockPriceHistory } from '../services/apiService';
import { TimePeriod } from '../@types/market';
import type { StockPriceHistory } from '../@types/market';

const TIME_PERIODS = [
    { label: '1M', value: TimePeriod.ONE_MONTH },
    { label: '6M', value: TimePeriod.SIX_MONTHS },
    { label: '1Y', value: TimePeriod.ONE_YEAR },
    { label: '5Y', value: TimePeriod.FIVE_YEARS },
    { label: 'MAX', value: TimePeriod.MAX }
];

export const PriceHistoryChart = () => {
    const selectedStock = useStockStore((state) => state.selectedStock);
    const [period, setPeriod] = useState<string>(TimePeriod.ONE_MONTH);
    const [chartData, setChartData] = useState<StockPriceHistory | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedStock) {
            setChartData(null);
            return;
        }

        const loadChartData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await fetchStockPriceHistory(
                    selectedStock.ticker,
                    selectedStock.companyName,
                    selectedStock.price,
                    period as TimePeriod
                );
                setChartData(data);
            } catch (err) {
                setError('Failed to load price history');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadChartData();
    }, [selectedStock, period]);

    if (!selectedStock) {
        return (
            <div className="w-full h-[400px] bg-[#121212] rounded-lg border border-[#333] flex items-center justify-center">
                <p className="text-gray-500 text-sm">Select a stock from the table to view price history</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full h-[400px] bg-[#121212] rounded-lg border border-[#333] flex items-center justify-center">
                <p className="text-gray-400">Loading chart data...</p>
            </div>
        );
    }

    if (error || !chartData) {
        return (
            <div className="w-full h-[400px] bg-[#121212] rounded-lg border border-[#333] flex items-center justify-center">
                <p className="text-red-400">{error || 'Failed to load chart'}</p>
            </div>
        );
    }

    const isPositive = chartData.variation >= 0;

    return (
        <div className="w-full bg-[#121212] rounded-lg border border-[#333] p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {chartData.ticker} <span className="text-gray-500 font-normal text-lg">{chartData.companyName}</span>
                    </h2>
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-white">
                            R$ {chartData.currentPrice.toFixed(2)}
                        </span>
                        <span className={`text-sm font-medium ${isPositive ? 'text-[#22c55e]' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{chartData.variation.toFixed(2)}%
                        </span>
                    </div>
                </div>

                {/* Time Period Selector */}
                <div className="flex gap-2">
                    {TIME_PERIODS.map((tp) => (
                        <button
                            key={tp.value}
                            onClick={() => setPeriod(tp.value)}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${period === tp.value
                                ? 'bg-[#2a2a2a] text-white'
                                : 'bg-transparent text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {tp.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData.history}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 11 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 11 }}
                            tickFormatter={(value) => `R$${value}`}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #333',
                                borderRadius: '6px',
                                color: '#fff'
                            }}
                            labelStyle={{ color: '#999' }}
                            formatter={(value: number | undefined) => value !== undefined ? [`R$ ${value.toFixed(2)}`, 'Price'] : ['', '']}
                            labelFormatter={(label) => {
                                const date = new Date(label);
                                return date.toLocaleDateString('pt-BR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                });
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#colorPrice)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
