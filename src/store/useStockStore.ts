import { create } from 'zustand';
import type { IStock, IRawStock, IFilterConfig } from '../@types/stock';
import { processStocks } from '../domain/stockLogic';

interface StockState {
    rawStocks: IRawStock[];
    processedStocks: (IStock & { ranking: number })[];
    isProcessing: boolean;
    config: IFilterConfig;

    setRawData: (data: IRawStock[]) => void;
    updateConfig: (newConfig: Partial<IFilterConfig>) => void;
    applyFilters: () => void;
    reset: () => void;
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

    setRawData: (data) => {
        set({ rawStocks: data });
        // Auto process on upload? Or wait for user?
        // Spec doesn't strictly say, but "Upload -> Display" implies immediate feedback usually.
        // Let's trigger process.
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

        // Wrap in setTimeout to allow UI update if dataset is huge (though 500 lines is small)
        setTimeout(() => {
            try {
                const result = processStocks(rawStocks, config);
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
            config: DEFAULT_CONFIG
        });
    }
}));
