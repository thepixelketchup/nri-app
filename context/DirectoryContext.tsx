import React, { createContext, useContext, useState } from 'react';

type DirectoryFilters = {
    category: string;
    city: string; // "Amstelveen", "Amsterdam", etc. or "" for all
};

type DirectoryContextType = {
    filters: DirectoryFilters;
    setFilters: (filters: DirectoryFilters) => void;
    resetFilters: () => void;
};

const DirectoryContext = createContext<DirectoryContextType | undefined>(undefined);

export function DirectoryProvider({ children }: { children: React.ReactNode }) {
    const [filters, setFilters] = useState<DirectoryFilters>({
        category: 'all',
        city: '',
    });

    const resetFilters = React.useCallback(() => {
        setFilters({ category: 'all', city: '' });
    }, []);

    const value = React.useMemo(() => ({
        filters,
        setFilters,
        resetFilters
    }), [filters, resetFilters]);

    return (
        <DirectoryContext.Provider value={value}>
            {children}
        </DirectoryContext.Provider>
    );
}

export function useDirectory() {
    const context = useContext(DirectoryContext);
    if (context === undefined) {
        throw new Error('useDirectory must be used within a DirectoryProvider');
    }
    return context;
}
