import { useEffect, useState } from "react";
import type { AuthProviderAvailability } from "@mike/contracts";
import { getAuthProviders } from "@/app/lib/authApi";

const SAFE_FALLBACK: AuthProviderAvailability = {
    emailPassword: true,
    google: false,
    sso: false,
};

export function useAuthProviders(): AuthProviderAvailability | null {
    const [providers, setProviders] =
        useState<AuthProviderAvailability | null>(null);

    useEffect(() => {
        let cancelled = false;
        void getAuthProviders()
            .then((availableProviders) => {
                if (!cancelled) setProviders(availableProviders);
            })
            .catch(() => {
                if (!cancelled) setProviders(SAFE_FALLBACK);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return providers;
}
