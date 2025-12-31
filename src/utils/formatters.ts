export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const formatCompactCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(value);
};

export const formatPercent = (value: number) => {
    // Value might be 10 (for 10%) or 0.10.
    // Based on logic, we assumed input 10 means 10%.
    // So we just add %.
    return `${value.toFixed(2)}%`;
};

export const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        maximumFractionDigits: 2
    }).format(value);
};
