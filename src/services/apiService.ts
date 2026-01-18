import type { StockPriceHistory, PriceDataPoint } from '../@types/market';
import { TimePeriod } from '../@types/market';

/**
 * Robust fetch with exponential backoff and CORS proxy fallback
 */
const fetchWithRetry = async (url: string, attempt: number = 0): Promise<any> => {
    const proxies = [
        (u: string) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
        (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
    ];

    const endpoints = [
        url,
        url.replace('query1', 'query2')
    ];

    let lastError = null;

    for (const proxiedUrlGenerator of proxies) {
        for (const targetUrl of endpoints) {
            try {
                const finalUrl = proxiedUrlGenerator(targetUrl);
                const response = await fetch(finalUrl);

                if (response.status === 429) {
                    if (attempt < 2) {
                        const waitTime = Math.pow(2, attempt) * 2000;
                        console.warn(`Rate limited (429). Waiting ${waitTime}ms before retry...`);
                        await new Promise(r => setTimeout(r, waitTime));
                        return fetchWithRetry(url, attempt + 1);
                    }
                }

                if (!response.ok) continue;

                const text = await response.text();
                return JSON.parse(text);
            } catch (e) {
                lastError = e;
                continue;
            }
        }
    }
    throw lastError || new Error('All attempts failed');
};

/**
 * Fetch real stock price history from Yahoo Finance API
 */
export const fetchStockPriceHistory = async (
    ticker: string,
    companyName: string,
    _currentPrice: number,
    period: TimePeriod = TimePeriod.ONE_MONTH
): Promise<StockPriceHistory> => {
    try {
        const symbol = `${ticker}.SA`;
        const range = getYahooFinanceRange(period);
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=1d`;

        const data = await fetchWithRetry(yahooUrl);

        if (!data.chart?.result?.[0]) {
            throw new Error('No data available for this stock');
        }

        const result = data.chart.result[0];
        const timestamps = result.timestamp || [];
        const quotes = result.indicators?.quote?.[0];

        if (!quotes || !timestamps.length) {
            throw new Error('Invalid data format from Yahoo Finance');
        }

        const history: PriceDataPoint[] = timestamps
            .map((ts: number, i: number) => ({
                date: new Date(ts * 1000).toISOString().split('T')[0],
                price: quotes.close[i] ? Number(quotes.close[i].toFixed(2)) : 0,
                day: i + 1
            }))
            .filter((point: PriceDataPoint) => point.price > 0);

        if (history.length === 0) {
            throw new Error('No valid price data available');
        }

        const lastPrice = history[history.length - 1].price;
        const firstPrice = history[0].price;
        const variation = ((lastPrice - firstPrice) / firstPrice) * 100;

        return {
            ticker,
            companyName,
            currentPrice: lastPrice,
            variation,
            history
        };
    } catch (error) {
        console.error('Error fetching stock price history:', error);
        throw error;
    }
};

const getYahooFinanceRange = (period: TimePeriod): string => {
    switch (period) {
        case TimePeriod.ONE_MONTH: return '1mo';
        case TimePeriod.SIX_MONTHS: return '6mo';
        case TimePeriod.ONE_YEAR: return '1y';
        case TimePeriod.FIVE_YEARS: return '5y';
        case TimePeriod.MAX: return 'max';
        default: return '1mo';
    }
};
