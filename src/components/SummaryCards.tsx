import { useStockStore } from '../store/useStockStore';
import { formatPercent, formatNumber } from '../utils/formatters';

export const SummaryCards = () => {
    const data = useStockStore(state => state.processedStocks);

    if (data.length === 0) return null;

    const avgDy = data.reduce((acc, curr) => acc + curr.dividendYield, 0) / data.length;
    const avgEvEbit = data.reduce((acc, curr) => acc + curr.evEbit, 0) / data.length;
    const avgRoic = data.reduce((acc, curr) => acc + curr.roic, 0) / data.length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <Card label="Avg. Dividend Yield" value={formatPercent(avgDy)} sub="Portfolio Average" color="text-blue-400" />
            <Card label="Avg. EV/EBIT" value={formatNumber(avgEvEbit)} sub="Value Indicator" color="text-yellow-400" />
            <Card label="Avg. ROIC" value={formatPercent(avgRoic)} sub="Quality Indicator" color="text-green-400" />
        </div>
    );
};

const Card = ({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center">
        <span className="text-gray-400 text-sm font-medium">{label}</span>
        <span className={`text-3xl font-bold mt-2 ${color}`}>{value}</span>
        <span className="text-gray-500 text-xs mt-1">{sub}</span>
    </div>
);
