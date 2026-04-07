import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import clotheslineHistoryData from "../data/clotheslineHistory.json";

let currentHistory = clotheslineHistoryData.history || [];
const HISTORY_STORAGE_KEY = "@clothesline/history";
const historyListeners = new Set();
let historyHydrated = false;

async function hydrateHistory() {
    if (historyHydrated) return;

    try {
        const storedHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
            const parsedHistory = JSON.parse(storedHistory);
            if (Array.isArray(parsedHistory)) {
                currentHistory = parsedHistory;
            }
        }
    } catch (error) {
        console.error("Erro ao hidratar histórico persistido:", error);
    } finally {
        historyHydrated = true;
    }
}

async function persistHistory() {
    try {
        await AsyncStorage.setItem(
            HISTORY_STORAGE_KEY,
            JSON.stringify(currentHistory),
        );
    } catch (error) {
        console.error("Erro ao persistir histórico:", error);
    }
}

function notifyHistoryChange() {
    historyListeners.forEach((listener) => {
        listener([...currentHistory]);
    });
}

export function useClotheslineHistory() {
    const [history, setHistory] = useState([...currentHistory]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadHistory = async () => {
            try {
                await hydrateHistory();
                if (isMounted) {
                    setHistory([...currentHistory]);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Erro ao carregar histórico:", error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadHistory();

        const unsubscribe = subscribeToHistoryChanges((nextHistory) => {
            if (isMounted) {
                setHistory(nextHistory);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    const addHistoryEntry = useCallback(async (entry) => {
        return addHistoryEntryInternal(entry);
    }, []);

    const clearHistory = useCallback(async () => {
        return clearHistoryInternal();
    }, []);

    const reloadHistory = useCallback(async () => {
        try {
            setIsRefreshing(true);
            await reloadHistoryInternal();
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    return {
        history,
        isLoading,
        isRefreshing,
        addHistoryEntry,
        clearHistory,
        reloadHistory,
    };
}

function subscribeToHistoryChanges(callback) {
    historyListeners.add(callback);
    return () => {
        historyListeners.delete(callback);
    };
}

export async function addHistoryEntryInternal(entry) {
    try {
        await hydrateHistory();

        const newEntry = {
            id: String(Date.now()),
            timestamp: new Date().toISOString(),
            isExposed: entry.isExposed,
            status: entry.status,
        };

        currentHistory.unshift(newEntry);
        await persistHistory();
        notifyHistoryChange();

        return newEntry;
    } catch (error) {
        console.error("Erro ao adicionar entrada no histórico:", error);
        throw error;
    }
}

export async function clearHistoryInternal() {
    try {
        await hydrateHistory();
        currentHistory = [];
        await persistHistory();
        notifyHistoryChange();
    } catch (error) {
        console.error("Erro ao limpar histórico:", error);
        throw error;
    }
}

export async function reloadHistoryInternal() {
    historyHydrated = false;
    await hydrateHistory();
    notifyHistoryChange();
}

export function getClotheslineHistorySync() {
    return [...currentHistory];
}
