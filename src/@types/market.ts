export const TimePeriod = {
    ONE_MONTH: '1M',
    SIX_MONTHS: '6M',
    ONE_YEAR: '1Y',
    FIVE_YEARS: '5Y',
    MAX: 'MAX'
} as const;

export type TimePeriod = typeof TimePeriod[keyof typeof TimePeriod];

export interface PriceDataPoint {
    date: string;
    price: number;
    day: number;
}

export interface YahooBulkFundamental {
    ticker: string;
    companyName: string;
    price: number;
    roic: number;
    ebitMargin: number;
    evEbit: number;
    dividendYield: number;
    liquidity: number;
}

export interface StockPriceHistory {
    ticker: string;
    companyName: string;
    currentPrice: number;
    variation: number;
    history: PriceDataPoint[];
}
