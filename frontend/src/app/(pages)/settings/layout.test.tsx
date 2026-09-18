import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SettingsLayout from "./layout";

const state = vi.hoisted(() => ({
    localModelsOnly: false,
    push: vi.fn(),
    replace: vi.fn(),
}));
let pathname = "/settings/memory";

vi.mock("next/navigation", () => ({
    usePathname: () => pathname,
    useRouter: () => ({ push: state.push, replace: state.replace }),
}));

vi.mock("@/app/contexts/AuthContext", () => ({
    useAuth: () => ({
        isAuthenticated: true,
        authLoading: false,
    }),
}));

vi.mock("@/app/contexts/UserProfileContext", () => ({
    useUserProfile: () => ({
        profile: {
            apiKeys: {
                localModelsOnly: state.localModelsOnly || undefined,
            },
        },
    }),
}));

describe("SettingsLayout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        pathname = "/settings/memory";
        state.localModelsOnly = false;
    });

    it("exposes Memory as a dedicated settings page and marks it current", async () => {
        const user = userEvent.setup();
        render(
            <SettingsLayout>
                <div>Memory content</div>
            </SettingsLayout>,
        );

        const memoryTab = screen.getByRole("button", { name: "Memory" });
        expect(memoryTab).toHaveAttribute("aria-current", "page");
        expect(screen.getByText("Memory content")).toBeVisible();
        expect(
            screen.getByRole("button", { name: "Bring Your Own Keys" }),
        ).toBeVisible();

        await user.click(screen.getByRole("button", { name: "Features" }));
        expect(state.push).toHaveBeenCalledWith("/settings/features");
    });

    it("hides Bring Your Own Keys when only local models are allowed", () => {
        state.localModelsOnly = true;

        render(
            <SettingsLayout>
                <div>Model settings</div>
            </SettingsLayout>,
        );

        expect(
            screen.queryByRole("button", { name: "Bring Your Own Keys" }),
        ).not.toBeInTheDocument();
        expect(screen.getByText("Model settings")).toBeVisible();
    });

    it("redirects a direct BYOK URL when only local models are allowed", () => {
        state.localModelsOnly = true;
        pathname = "/settings/byok";

        render(
            <SettingsLayout>
                <div>API key settings</div>
            </SettingsLayout>,
        );

        expect(state.replace).toHaveBeenCalledWith("/settings/models");
        expect(screen.queryByText("API key settings")).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Bring Your Own Keys" }),
        ).not.toBeInTheDocument();
    });
});
