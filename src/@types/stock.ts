export interface IStock {
    ticker: string;
    companyName: string;
    price: number;
    ebitMargin: number; // Margem EBIT
    evEbit: number; // EV/EBIT
    dividendYield: number; // Div. Yield
    liquidity: number; // Volume Financeiro (R$)
    roic: number; // ROIC
}

export interface IRawStock {
    [key: string]: string | number;
}

export interface IFilterConfig {
    minLiquidity: number; // Default 1,000,000
    minEbitMargin: number; // Default 0
    minRoic: number; // Default 10%
}
