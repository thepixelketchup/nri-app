import React, { createContext, useContext, useState } from 'react';

type MarketFilters = {
    category: string;
    type: string;
    location: string;
};

type MarketContextType = {
    filters: MarketFilters;
    setFilters: (filters: MarketFilters) => void;
    resetFilters: () => void;
};

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export function MarketProvider({ children }: { children: React.ReactNode }) {
    const [filters, setFilters] = useState<MarketFilters>({
        category: 'all',
        type: 'all',
        location: '',
    });

    const resetFilters = React.useCallback(() => {
        setFilters({ category: 'all', type: 'all', location: '' });
    }, []);

    const value = React.useMemo(() => ({
        filters,
        setFilters,
        resetFilters
    }), [filters, resetFilters]);

    return (
        <MarketContext.Provider value={value}>
            {children}
        </MarketContext.Provider>
    );
}

export function useMarket() {
    const context = useContext(MarketContext);
    if (context === undefined) {
        throw new Error('useMarket must be used within a MarketProvider');
    }
    return context;
}
