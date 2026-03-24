import Fuse, { type IFuseOptions } from 'fuse.js';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface MarketplaceItem {
    id: string;
    title: string;
    description?: string;
    keywords?: string[];
    location?: string;
    marketType?: string;
    type?: string;
    createdAt?: { seconds: number; nanoseconds: number } | string | number;
    viewCount?: number;
    contactCount?: number;
    saveCount?: number;
    [key: string]: unknown;
}

export interface SearchRankingOptions {
    preferredLocation?: string;
    weights?: {
        relevance: number;
        recency: number;
        engagement: number;
        location: number;
    };
}

interface UseMarketplaceSearchResult {
    filteredItems: MarketplaceItem[];
    isFiltering: boolean;
}

const DEBOUNCE_MS = 300;

const RECENCY_HALF_LIFE_MS = 7 * 24 * 60 * 60 * 1000;

const DEFAULT_WEIGHTS = {
    relevance: 0.50,
    recency: 0.25,
    engagement: 0.15,
    location: 0.10,
};

const FUSE_OPTIONS: IFuseOptions<MarketplaceItem> = {
    keys: [
        { name: 'title', weight: 0.6 },
        { name: 'description', weight: 0.3 },
        { name: 'keywords', weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
    useExtendedSearch: false,
    distance: 200,
};

function getAgeMs(item: MarketplaceItem): number {
    const c = item.createdAt;
    if (!c) return Infinity;
    if (typeof c === 'object' && 'seconds' in c) return Date.now() - c.seconds * 1000;
    if (typeof c === 'string') return Date.now() - new Date(c).getTime();
    if (typeof c === 'number') return Date.now() - c;
    return Infinity;
}

function recencyScore(item: MarketplaceItem): number {
    const ageMs = getAgeMs(item);
    if (!isFinite(ageMs) || ageMs < 0) return 0;
    return Math.exp((-ageMs * Math.LN2) / RECENCY_HALF_LIFE_MS);
}

function engagementScore(item: MarketplaceItem): number {
    const combined =
        (item.viewCount ?? 0) * 1.0 +
        (item.contactCount ?? 0) * 2.0 +
        (item.saveCount ?? 0) * 1.5;
    return Math.min(Math.log1p(combined) / Math.log1p(1000), 1);
}

function locationScore(item: MarketplaceItem, preferredLocation?: string): number {
    if (!preferredLocation) return 0;
    return item.location?.toLowerCase() === preferredLocation.toLowerCase() ? 1 : 0;
}

function compositeScore(
    item: MarketplaceItem,
    fuseScore: number | null,
    weights: typeof DEFAULT_WEIGHTS,
    preferredLocation?: string,
): number {
    const relevance = fuseScore !== null ? 1 - fuseScore : 1; // invert Fuse score
    const recency = recencyScore(item);
    const engagement = engagementScore(item);
    const location = locationScore(item, preferredLocation);

    return (
        weights.relevance * relevance +
        weights.recency * recency +
        weights.engagement * engagement +
        weights.location * location
    );
}

export function useMarketplaceSearch(
    items: MarketplaceItem[],
    query: string,
    options: SearchRankingOptions = {},
): UseMarketplaceSearchResult {
    const { preferredLocation, weights: weightOverrides } = options;
    const weights = { ...DEFAULT_WEIGHTS, ...weightOverrides };

    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [query]);

    const fuse = useMemo(() => new Fuse(items, FUSE_OPTIONS), [items]);

    const filteredItems = useMemo<MarketplaceItem[]>(() => {
        const trimmed = debouncedQuery.trim();

        if (!trimmed) {
            return [...items].sort(
                (a, b) =>
                    compositeScore(b, null, weights, preferredLocation) -
                    compositeScore(a, null, weights, preferredLocation),
            );
        }

        return fuse
            .search(trimmed)
            .map(result => ({
                item: result.item,
                score: compositeScore(result.item, result.score ?? 0, weights, preferredLocation),
            }))
            .sort((a, b) => b.score - a.score)
            .map(r => r.item);
    }, [fuse, debouncedQuery, items, preferredLocation, weights]);

    return {
        filteredItems,
        isFiltering: debouncedQuery.trim().length > 0,
    };
}
