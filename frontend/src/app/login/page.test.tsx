import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

const {
    authProviders,
    login,
    startGoogleOAuth,
    refreshSession,
    replace,
    push,
} = vi.hoisted(
    () => ({
        authProviders: {
            emailPassword: true,
            google: true,
            sso: true,
        },
        login: vi.fn(),
        startGoogleOAuth: vi.fn(),
        refreshSession: vi.fn(),
        replace: vi.fn(),
        push: vi.fn(),
    }),
);

vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace, push }),
}));

vi.mock("@/app/lib/authApi", () => ({
    login,
    startGoogleOAuth,
}));

vi.mock("@/app/hooks/useAuthProviders", () => ({
    useAuthProviders: () => authProviders,
}));

vi.mock("@/app/contexts/AuthContext", () => ({
    useAuth: () => ({
        isAuthenticated: false,
        authLoading: false,
        refreshSession,
    }),
}));

vi.mock("@/app/components/site-logo", () => ({
    SiteLogo: () => <div>Mike</div>,
}));

describe("LoginPage", () => {
    beforeEach(() => {
        login.mockReset();
        startGoogleOAuth.mockReset();
        refreshSession.mockReset();
        refreshSession.mockResolvedValue(null);
        replace.mockReset();
        push.mockReset();
        authProviders.google = true;
        authProviders.sso = true;
    });

    it("allows an existing account to submit a password shorter than the new minimum", async () => {
        login.mockResolvedValue({ user: { id: "user-1" } });
        const user = userEvent.setup();
        render(<LoginPage />);

        expect(screen.getByLabelText("Password")).not.toHaveAttribute(
            "placeholder",
        );

        await user.type(
            screen.getByRole("textbox", { name: "Email" }),
            "existing@example.com",
        );
        await user.type(screen.getByLabelText("Password"), "oldpass");
        await user.click(screen.getByRole("button", { name: "Log in" }));

        expect(login).toHaveBeenCalledWith("existing@example.com", "oldpass");
        expect(push).toHaveBeenCalledWith("/onboarding/profile");
    });

    it("places Google and SSO after the primary login action", () => {
        render(<LoginPage />);

        const login = screen.getByRole("button", { name: "Log in" });
        const google = screen.getByRole("button", {
            name: "Continue with Google",
        });
        const sso = screen.getByRole("button", { name: "Continue with SSO" });
        expect(
            login.compareDocumentPosition(google) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(
            google.compareDocumentPosition(sso) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it("shows only email and password when external providers are disabled", () => {
        authProviders.google = false;
        authProviders.sso = false;

        render(<LoginPage />);

        expect(
            screen.queryByRole("button", { name: "Continue with Google" }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Continue with SSO" }),
        ).not.toBeInTheDocument();
        expect(screen.queryByText("or")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Log in" })).toBeVisible();
    });
});
