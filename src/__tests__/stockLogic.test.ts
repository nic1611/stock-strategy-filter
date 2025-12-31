import { describe, it, expect } from 'vitest';
import {
    processStocks,
    parseNumeric,
    deduplicateCompanies,
    sortValue
} from '../domain/stockLogic';
import type { IRawStock } from '../@types/stock';

describe('Stock Logic Domain', () => {

    it('should parse numeric values correctly', () => {
        expect(parseNumeric('R$ 1.000,00')).toBe(1000);
        expect(parseNumeric('10,5')).toBe(10.5);
        expect(parseNumeric('10,5%')).toBe(10.5);
        expect(parseNumeric('1.000')).toBe(1000);
        expect(parseNumeric('500')).toBe(500);
        expect(parseNumeric(undefined)).toBe(0);
    });

    it('should deduplicate companies keeping highest liquidity', () => {
        // Mock data
        const stocks: any[] = [
            { ticker: 'PETR3', liquidity: 100, companyName: 'Petrobras' },
            { ticker: 'PETR4', liquidity: 500, companyName: 'Petrobras' }, // Should keep this
            { ticker: 'VALE3', liquidity: 1000, companyName: 'Vale' }
        ];

        const result = deduplicateCompanies(stocks);
        expect(result).toHaveLength(2);
        expect(result.find(s => s.ticker === 'PETR4')).toBeDefined();
        expect(result.find(s => s.ticker === 'PETR3')).toBeUndefined();
    });

    it('should sort by EV/EBIT ascending', () => {
        const stocks: any[] = [
            { ticker: 'A', evEbit: 10 },
            { ticker: 'B', evEbit: 5 },
            { ticker: 'C', evEbit: 20 }
        ];
        const result = sortValue(stocks);
        expect(result[0].ticker).toBe('B');
        expect(result[1].ticker).toBe('A');
        expect(result[2].ticker).toBe('C');
    });

    it('should run full pipeline correctly', () => {
        const rawData: IRawStock[] = [
            { 'Papel': 'BAD', 'Liquidez': '500', 'Cotação': '10' },
            { 'Papel': 'GOOD', 'Liquidez': '2000000', 'EV/EBIT': '5', 'ROIC': '15%', 'Margem EBIT': '10%', 'Cotação': '20' },
            { 'Papel': 'BEST', 'Liquidez': '3000000', 'EV/EBIT': '2', 'ROIC': '25%', 'Margem EBIT': '20%', 'Cotação': '30' },
            { 'Papel': 'NEG', 'Liquidez': '2000000', 'EV/EBIT': '-5', 'ROIC': '10%', 'Margem EBIT': '10%', 'Cotação': '10' }
        ];

        const config = { minLiquidity: 1000000, minEbitMargin: 0, minRoic: 10 };
        const result = processStocks(rawData, config);

        // BAD removed (liquidity)
        // NEG removed (outlier/neg ev_ebit)
        // Sort: BEST (2) < GOOD (5)

        expect(result).toHaveLength(2);
        expect(result[0].ticker).toBe('BEST');
        expect(result[0].ranking).toBe(1);
        expect(result[1].ticker).toBe('GOOD');
        expect(result[1].ranking).toBe(2);
    });
});
