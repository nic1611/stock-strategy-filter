import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
    getFilteredRowModel,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import type { IStock } from '../@types/stock';
import { useStockStore } from '../store/useStockStore';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import { ArrowUpDown, Search } from 'lucide-react';

const columnHelper = createColumnHelper<IStock & { ranking: number }>();

export const StockTable = () => {
    const data = useStockStore((state) => state.processedStocks);
    const selectedStock = useStockStore((state) => state.selectedStock);
    const setSelectedStock = useStockStore((state) => state.setSelectedStock);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    // Limit to 40 stocks
    const limitedData = useMemo(() => data.slice(0, 40), [data]);

    const columns = useMemo(() => [
        columnHelper.accessor('ranking', {
            header: '#',
            cell: info => <span className="font-bold text-gray-400">#{info.getValue()}</span>,
        }),
        columnHelper.accessor('ticker', {
            header: 'Ticker',
            cell: info => <span className="font-bold text-white">{info.getValue()}</span>,
        }),
        columnHelper.accessor('companyName', {
            header: 'Company',
            cell: info => <span className="text-gray-400 truncate max-w-[180px] block font-light" title={info.getValue()}>{info.getValue()}</span>,
        }),
        columnHelper.accessor('evEbit', {
            header: 'EV/EBIT',
            cell: info => <span className="text-gray-300 font-medium">{formatNumber(info.getValue())}</span>,
        }),
        columnHelper.accessor('roic', {
            header: 'ROIC %',
            cell: info => {
                const val = info.getValue();
                const isPositive = val > 0;
                return <span className={`${isPositive ? 'text-[#4ade80]' : 'text-red-400'} font-medium`}>{val > 0 ? '+' : ''}{formatPercent(val)}</span>;
            },
        }),
        columnHelper.accessor('dividendYield', {
            header: 'Div. Yield',
            cell: info => <span className="text-gray-300">{formatPercent(info.getValue())}</span>,
        }),
        columnHelper.accessor('liquidity', {
            header: 'Volume (R$)',
            cell: info => <span className="text-gray-300">{formatCurrency(info.getValue())}</span>,
        }),
    ], []);

    const table = useReactTable({
        data: limitedData,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (data.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#1e1e1e] rounded-xl border border-[#2d2d2d] shadow-2xl p-8 text-center">
                <p className="text-gray-400 font-medium text-lg">No stocks found matching the criteria.</p>
                <p className="text-gray-600 text-sm mt-2">Try adjusting the filters or checking your data source.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-transparent">
            {/* Table Header (Top Bar inside Card) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#333] bg-[#121212] rounded-t-lg">
                {/* Replicating the distinct header background from image */}
                <div className="flex gap-4">
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Search..."
                        className="bg-[#262626] border-none text-gray-200 pl-9 pr-4 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-600 w-48"
                    />
                </div>
            </div>

            <div className="overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex-1 bg-[#121212]">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-[#121212] text-gray-300 font-semibold sticky top-0 z-10">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-6 py-3 cursor-pointer hover:text-white transition select-none border-b border-[#333]" onClick={header.column.getToggleSortingHandler()}>
                                        <div className="flex items-center gap-2">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => {
                            const isSelected = selectedStock?.ticker === row.original.ticker;
                            return (
                                <tr
                                    key={row.id}
                                    onClick={() => {
                                        setSelectedStock(row.original);
                                        // Scroll to chart with a small delay to ensure it's rendered if it was toggled
                                        setTimeout(() => {
                                            document.getElementById('chart-section')?.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start'
                                            });
                                        }, 100);
                                    }}
                                    className={`transition group cursor-pointer ${isSelected
                                        ? 'bg-[#2a2a3d] border-l-2 border-l-blue-500'
                                        : 'bg-[#121212]'
                                        } hover:bg-[#2a2a2d]`}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-3.5 whitespace-nowrap border-b border-transparent group-hover:border-[#333]">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
