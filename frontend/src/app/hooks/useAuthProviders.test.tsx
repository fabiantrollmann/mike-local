import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthProviders } from "./useAuthProviders";

const { getAuthProviders } = vi.hoisted(() => ({
    getAuthProviders: vi.fn(),
}));

vi.mock("@/app/lib/authApi", () => ({ getAuthProviders }));

describe("useAuthProviders", () => {
    beforeEach(() => {
        getAuthProviders.mockReset();
    });

    it("loads the public provider policy", async () => {
        getAuthProviders.mockResolvedValue({
            emailPassword: true,
            google: true,
            sso: false,
        });

        const { result } = renderHook(() => useAuthProviders());
        expect(result.current).toBeNull();
        await waitFor(() =>
            expect(result.current).toEqual({
                emailPassword: true,
                google: true,
                sso: false,
            }),
        );
    });

    it("fails closed when the policy cannot be loaded", async () => {
        getAuthProviders.mockRejectedValue(new Error("unavailable"));

        const { result } = renderHook(() => useAuthProviders());
        await waitFor(() =>
            expect(result.current).toEqual({
                emailPassword: true,
                google: false,
                sso: false,
            }),
        );
    });
});
