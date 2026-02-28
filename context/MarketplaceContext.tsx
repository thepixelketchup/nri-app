import React, { createContext, useContext, useState } from 'react';

type MarketplaceFilters = {
    category: string;
    type: string;
    location: string;
};

type MarketplaceContextType = {
    filters: MarketplaceFilters;
    setFilters: (filters: MarketplaceFilters) => void;
    resetFilters: () => void;
};

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
    const [filters, setFilters] = useState<MarketplaceFilters>({
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
        <MarketplaceContext.Provider value={value}>
            {children}
        </MarketplaceContext.Provider>
    );
}

export function useMarketplace() {
    const context = useContext(MarketplaceContext);
    if (context === undefined) {
        throw new Error('useMarketplace must be used within a MarketplaceProvider');
    }
    return context;
}
