import { useEffect, useRef } from "react";
import { addHistoryEntryInternal } from "../services/clotheslineHistoryService";

export function useClotheslineHistoryTracker(
    isExposed,
    status = "Manual",
    isEnabled = true,
) {
    const previousStateRef = useRef(null);

    useEffect(() => {
        if (!isEnabled) {
            previousStateRef.current = isExposed;
            return;
        }

        const handleStateChange = async () => {
            if (
                previousStateRef.current !== null &&
                previousStateRef.current !== isExposed
            ) {
                try {
                    await addHistoryEntryInternal({
                        isExposed,
                        status,
                    });
                } catch (error) {
                    console.error(
                        "Erro ao registrar mudança no histórico:",
                        error,
                    );
                }
            }

            previousStateRef.current = isExposed;
        };

        handleStateChange();
    }, [isEnabled, isExposed, status]);
}
