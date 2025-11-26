import { useState, useEffect } from 'react';
import { subscribeToChanges } from '../services/storage';

export function useData<T>(fetcher: () => Promise<T>, deps: any[] = [], relevantEntities?: string | string[]): T | undefined {
    const [data, setData] = useState<T | undefined>(undefined);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const result = await fetcher();
                if (isMounted) setData(result);
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };

        fetchData();

        const unsubscribe = subscribeToChanges((changedEntity?: string) => {
            // If no specific entity changed (global reset) OR 
            // if we don't care about specific entities (legacy behavior) OR
            // if the changed entity is one we care about
            if (!changedEntity || !relevantEntities) {
                fetchData();
            } else {
                const entities = Array.isArray(relevantEntities) ? relevantEntities : [relevantEntities];
                if (entities.includes(changedEntity)) {
                    fetchData();
                }
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, deps);

    return data;
}
