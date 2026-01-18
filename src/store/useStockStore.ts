import { create } from 'zustand';
import type { IStock, IRawStock, IFilterConfig } from '../@types/stock';
import { processStocks } from '../domain/stockLogic';

interface StockState {
    rawStocks: (IRawStock | IStock)[];
    processedStocks: (IStock & { ranking: number })[];
    isProcessing: boolean;
    config: IFilterConfig;
    selectedStock: (IStock & { ranking: number }) | null;

    setRawData: (data: IRawStock[]) => void;
    updateConfig: (newConfig: Partial<IFilterConfig>) => void;
    applyFilters: () => void;
    reset: () => void;
    setSelectedStock: (stock: (IStock & { ranking: number }) | null) => void;
}

const DEFAULT_CONFIG: IFilterConfig = {
    minLiquidity: 1000000,
    minEbitMargin: 0,
    minRoic: 10,
};

export const useStockStore = create<StockState>((set, get) => ({
    rawStocks: [],
    processedStocks: [],
    isProcessing: false,
    config: DEFAULT_CONFIG,
    selectedStock: null,

    setRawData: (data) => {
        set({ rawStocks: data });
        get().applyFilters();
    },

    updateConfig: (newConfig) => {
        set((state) => ({ config: { ...state.config, ...newConfig } }));
        get().applyFilters();
    },

    applyFilters: () => {
        const { rawStocks, config } = get();
        if (!rawStocks.length) return;

        set({ isProcessing: true });

        // Wrap in setTimeout to allow UI update
        setTimeout(() => {
            try {
                const result = processStocks(rawStocks as any[], config);
                set({ processedStocks: result, isProcessing: false });
            } catch (error) {
                console.error("Processing failed", error);
                set({ isProcessing: false });
            }
        }, 0);
    },

    reset: () => {
        set({
            rawStocks: [],
            processedStocks: [],
            config: DEFAULT_CONFIG,
            selectedStock: null
        });
    },

    setSelectedStock: (stock) => {
        set({ selectedStock: stock });
    }
}));
