import { useState, useEffect } from 'react';
import { subscribeToChanges } from '../services/storage';

export function useData<T>(fetcher: () => Promise<T>, deps: any[] = []): T | undefined {
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

        const unsubscribe = subscribeToChanges(() => {
            fetchData();
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, deps);

    return data;
}
