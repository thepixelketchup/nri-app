import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, orderBy, query, limit, where } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

export type MarketplaceFilters = {
    // Global
    category: string; // all, housing, eclassifieds
    type: string; // all, offered, wanted
    location: string;
    searchQuery: string;
    minPrice: string;
    maxPrice: string;
    sortBy: 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc';
    // Marketplace Specific
    condition: string; // all, new, used, like_new
    // Housing Specific
    housingType: string; // all, rent, sale
    propertyType: string; // all, apartment, house, studio
    bedrooms: string; // all, 1, 2, 3, 4+
};

const defaultFilters: MarketplaceFilters = {
    category: 'all',
    type: 'all',
    location: '',
    searchQuery: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'date_desc',
    condition: 'all',
    housingType: 'all',
    propertyType: 'all',
    bedrooms: 'all',
};

type MarketplaceContextType = {
    filters: MarketplaceFilters;
    setFilters: React.Dispatch<React.SetStateAction<MarketplaceFilters>>;
    updateFilter: (key: keyof MarketplaceFilters, value: any) => void;
    resetFilters: () => void;
    // Data operations
    items: any[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    fetchListings: (isRefresh?: boolean) => Promise<void>;
};

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
    const [filters, setFilters] = useState<MarketplaceFilters>(defaultFilters);
    const [rawItems, setRawItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateFilter = useCallback((key: keyof MarketplaceFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(defaultFilters);
    }, []);

    const fetchListings = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        if (isRefresh) setRefreshing(true);
        setError(null);

        try {
            const marketRef = collection(db, 'public', 'data', 'market');
            let constraints: any[] = [];
            
            // To support custom filtering client-side, we fetch a larger chunk of documents 
            // from the selected category and location. This minimizes excessive Firestore indexing.
            if (filters.category !== 'all') {
                constraints.push(where('marketType', '==', filters.category));
            }
            if (filters.type !== 'all') {
                constraints.push(where('type', '==', filters.type));
            }
            if (filters.location) {
                constraints.push(where('location', '==', filters.location));
            }
            
            // Order by date. Search and sorting variations are handled client-side
            constraints.push(orderBy('createdAt', 'desc'));
            constraints.push(limit(100)); // Increased limit since we filter locally

            const q = query(marketRef, ...constraints);
            const snapshot = await getDocs(q);
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            
            setRawItems(list);
        } catch (err: any) {
            console.error("Market fetch error:", err);
            setError("Failed to fetch listings.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters.category, filters.type, filters.location]);

    // Apply Client-Side Filtering & Sorting exactly as the user asked
    const processedItems = useMemo(() => {
        let result = [...rawItems];

        // 1. Text Search
        const searchWord = filters.searchQuery.trim().toLowerCase();
        if (searchWord) {
            result = result.filter(item => {
                const titleMatch = item.title?.toLowerCase().includes(searchWord);
                const descMatch = item.description?.toLowerCase().includes(searchWord);
                const keywordMatch = Array.isArray(item.keywords) && item.keywords.some((k: string) => k.toLowerCase().includes(searchWord));
                return titleMatch || descMatch || keywordMatch;
            });
        }

        // 2. Price Range
        if (filters.minPrice) {
            const min = parseFloat(filters.minPrice);
            if (!isNaN(min)) result = result.filter(item => (item.price || 0) >= min);
        }
        if (filters.maxPrice) {
            const max = parseFloat(filters.maxPrice);
            if (!isNaN(max)) result = result.filter(item => (item.price || 0) <= max);
        }

        // 3. Category Specific Attributes
        if (filters.category === 'housing') {
            if (filters.housingType !== 'all') result = result.filter(item => item.housingType === filters.housingType);
            if (filters.propertyType !== 'all') result = result.filter(item => item.propertyType === filters.propertyType);
            if (filters.bedrooms !== 'all') {
                if (filters.bedrooms === '4+') {
                    result = result.filter(item => parseInt(item.bedrooms || '0') >= 4);
                } else {
                    result = result.filter(item => item.bedrooms?.toString() === filters.bedrooms);
                }
            }
        } else if (filters.category === 'eclassifieds') {
            if (filters.condition !== 'all') result = result.filter(item => item.condition === filters.condition);
        }

        // 4. Sorting
        result.sort((a, b) => {
            switch (filters.sortBy) {
                case 'price_asc':
                    return (a.price || 0) - (b.price || 0);
                case 'price_desc':
                    return (b.price || 0) - (a.price || 0);
                case 'date_asc':
                    return (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0);
                case 'date_desc':
                default:
                    return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
            }
        });

        return result;
    }, [rawItems, filters]);

    // Initial Fetch when core equality constraints change
    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const value = useMemo(() => ({
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        items: processedItems,
        loading,
        refreshing,
        error,
        fetchListings
    }), [filters, processedItems, loading, refreshing, error, fetchListings, resetFilters, updateFilter]);

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
