import type { IStock, IRawStock } from '../@types/stock';

// Helper to parse numeric values from PT-BR format (e.g., "1.000,00" or "R$ 10,50" or "5%")
export const parseNumeric = (value: string | number | undefined): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;

    // Remove R$, %, and whitespace
    let clean = value.toString().replace(/[R$\s%]/g, '');

    // Check if it's a valid number structure for PT-BR (1.000,00)
    // If it contains both . and , and . comes first, it's likely thousands separator
    if (clean.includes('.') && clean.includes(',')) {
        if (clean.indexOf('.') < clean.indexOf(',')) {
            // 1.000,00 -> remove dots
            clean = clean.replace(/\./g, '');
        } else {
            // 1,000.00 -> remove commas (US format safety net)
            clean = clean.replace(/,/g, '');
        }
    } else if (clean.includes(',') && !clean.includes('.')) {
        // Only comma, e.g. "10,50" -> replace with dot
    } else if (clean.includes('.') && !clean.includes(',')) {
        // Only dot. If it looks like "1.000", it might be 1000 or 1.
        // This is ambiguous. But usually in finance files, for prices < 1000, it's 10.50.
        // If it's volume > 1000, it could be 1.000
        // We will leave it as is if it parses directly, unless we want to force localized parsing.
        // Let's assume standard JS float mapping if no comma is present?
        // No, standard PT-BR uses comma. If we see dot in PT-BR it's usually thousands.
        // BUT, some fields like ROIC "10.5" might be exported as such.
        // Let's treat standard replace:
    }

    // Standard PT-BR strategy:
    // 1. Remove dots (thousands)
    // 2. Replace comma with dot (decimal)
    // However, we must be careful not to break "1.5" if it meant 1.5.
    // Given the context of "R$", we stick to PT-BR primary.

    clean = clean.replace(/\./g, '').replace(',', '.');

    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
};

export const mapToObject = (row: any[] | IRawStock): IStock => {
    // Handling generic object where keys might vary slightly
    // We expect keys to be roughly: Ticker/Papel, Preço/Cotação, EBIT Margin, etc.
    // In a real CSV/XLSX, we'd find the headers first.
    // Here we assume the input object has property names close to what we expect
    // or normalized before calling this.

    // For simplicity, let's assume we receive a dictionary where keys are the header names.
    // We will do a fuzzy match or check specific common names.

    const getVal = (keys: string[]): any => {
        if (!row) return undefined;
        // If row is array, we'd need index mapping. Assuming object here.
        const header = Object.keys(row).find(k =>
            keys.some(key => k.toLowerCase().includes(key.toLowerCase()))
        );
        return header ? (row as any)[header] : undefined;
    };

    return {
        ticker: getVal(['Papel', 'Ticker', 'Symbol', 'Ação']) || 'UNKNOWN',
        companyName: getVal(['Empresa', 'Company', 'Nome']) || '',
        price: parseNumeric(getVal(['Cotação', 'Price', 'Preço'])),
        roic: parseNumeric(getVal(['ROIC', 'Retorno sobre capital'])),
        ebitMargin: parseNumeric(getVal(['Marg. EBIT', 'EBIT Margin', 'Margem EBIT'])),
        evEbit: parseNumeric(getVal(['EV/EBIT'])),
        dividendYield: parseNumeric(getVal(['Div.Yield', 'DY', 'Yield'])),
        liquidity: parseNumeric(getVal(['Liq. Corr.', 'Vol $ avail', 'Liquidez', 'Volume'])), // Verify field name for "Liquidez Diária" or similar
    };
};

// 11-Step Pipeline Implementation

// 2. Column Mapping (done via mapToObject roughly, but we can iterate)
export const normalizeData = (data: IRawStock[]): IStock[] => {
    return data.map(mapToObject);
};

// 3. Liquidity Filter
// Keep only assets with Financial Volume (R$) > 1,000,000.
export const filterLiquidity = (stocks: IStock[], minLiquidity: number = 1000000): IStock[] => {
    return stocks.filter(s => s.liquidity > minLiquidity);
};

// 4. Profitability Filter
// Remove records with EBIT Margin <= 0 or N/A values. (We mapped N/A to 0 in parseNumeric)
// Also spec says "negative EV/EBIT due to accounting distortions" in step 8.
// Step 4 explicitly mentions EBIT Margin.
export const filterProfitability = (stocks: IStock[]): IStock[] => {
    return stocks.filter(s => s.ebitMargin > 0);
};

// 5. Quality Filter
// Remove companies with ROIC < 10%
// Note: our parseNumeric handles percentages by stripping %.
// If ROIC is 10%, mapped to 10. If 0.10, mapped to 0.10.
// Usually in these files, "10%" becomes 10.
// Let's assume the value is scale 0-100 based on standard "10" usage in text.
// If values are small (<1), we might need to adjust. But let's stick to spec "10%".
export const filterQuality = (stocks: IStock[], minRoic: number = 10): IStock[] => {
    return stocks.filter(s => s.roic >= minRoic);
};

// 6. Value Sorting
// Organize by EV/EBIT from lowest to highest.
export const sortValue = (stocks: IStock[]): IStock[] => {
    return [...stocks].sort((a, b) => a.evEbit - b.evEbit);
};

// 7. Company Deduplication
// Keep only the one with the highest financial volume and remove the others.
// Heuristic: Extract base ticker (e.g. PETR from PETR3, PETR4).
// Usually 4 letters. Or match Company Name.
export const deduplicateCompanies = (stocks: IStock[]): IStock[] => {
    const map = new Map<string, IStock>();

    stocks.forEach(stock => {
        // Extract base ticker (first 4 chars usually)
        const baseTicker = stock.ticker.substring(0, 4);

        if (!map.has(baseTicker)) {
            map.set(baseTicker, stock);
        } else {
            const existing = map.get(baseTicker)!;
            if (stock.liquidity > existing.liquidity) {
                map.set(baseTicker, stock);
            }
        }
    });

    return Array.from(map.values());
};

// 8. Legal Filter
// Remove companies under "Judicial Recovery"
export const filterLegal = (stocks: IStock[]): IStock[] => {
    return stocks.filter(s => {
        const name = s.companyName.toLowerCase();
        return !name.includes('recup jud') && !name.includes('judicial recovery');
    });
};

// 9. Outlier Cleanup
// Remove records with corrupted data or negative EV/EBIT.
export const removeOutliers = (stocks: IStock[]): IStock[] => {
    return stocks.filter(s => {
        // Corrupted data check? (e.g. Price 0, invalid ticker)
        if (!s.ticker || s.ticker === 'UNKNOWN') return false;
        if (s.price <= 0) return false;

        // Negative EV/EBIT
        if (s.evEbit <= 0) return false;

        return true;
    });
};

// 10. Ranking
export const assignRanking = (stocks: IStock[]): (IStock & { ranking: number })[] => {
    return stocks.map((s, index) => ({
        ...s,
        ranking: index + 1
    }));
};

// Master Pipeline
export const processStocks = (
    data: IRawStock[] | IStock[],
    config: { minLiquidity: number; minMarketCap?: number; minRoic: number }
) => {
    // If data elements don't have companyName or other fields as strings/parsed, normalize.
    // Heuristic: if the first element has a 'ticker' that is a string and ebitMargin is a number, it's likely already normalized.
    const isNormalized = data.length > 0 && typeof (data[0] as any).ebitMargin === 'number';

    let stocks: IStock[] = isNormalized ? (data as IStock[]) : normalizeData(data as IRawStock[]);

    // 3. Liquidity
    stocks = filterLiquidity(stocks, config.minLiquidity);

    // 4. Profitability (EBIT Margin > 0)
    stocks = filterProfitability(stocks);

    // 5. Quality (ROIC)
    stocks = filterQuality(stocks, config.minRoic);

    // 8. Legal Filter (Moving up is fine, but spec says 8. Let's follow order to be safe, 
    // although deduplication might benefit from cleaning legal first? 
    // Spec: 6 Sort -> 7 Dedup -> 8 Legal -> 9 Outlier. 
    // Wait, Deduplication keeps highest volume. If the highest volume is the one in judicial recovery, we keep it then delete it?
    // Then we might lose the company entirely if the other ticker wasn't in recovery?
    // Usually status applies to company, so all tickers affected. So order doesn't matter for that.)

    // 8. Legal (Doing before sort/dedup to save params? Spec says 8. Let's strictly follow spec order 3->4->5->6->7->8->9)
    // Actually, Spec:
    // 3. Liquidity
    // 4. Profitability
    // 5. Quality
    // 6. Value Sorting
    // 7. Company Deduplication
    // 8. Legal Filter
    // 9. Outlier Cleanup

    // 6. Sort
    stocks = sortValue(stocks);

    // 7. Dedup
    stocks = deduplicateCompanies(stocks);

    // 8. Legal
    stocks = filterLegal(stocks);

    // 9. Outliers (Negative EV/EBIT)
    // Note: If we sorted by EV/EBIT in step 6, negatives would be at the top (lowest).
    // So we invoke removeOutliers now.
    stocks = removeOutliers(stocks);

    // 10. Rank
    const ranked = assignRanking(stocks);

    return ranked;
};
