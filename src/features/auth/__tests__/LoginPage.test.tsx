import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/server";
import { renderWithProviders } from "../../../test/utils";
import LoginPage from "../LoginPage";

describe("LoginPage", () => {
  it("renders email and password fields", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    // Scoped to the textbox: the show/hide toggle button also carries a
    // /password/i accessible name ("Show password"), so an unscoped
    // getByLabelText(/password/i) throws "found multiple elements".
    expect(screen.getByLabelText(/password/i, { selector: "input" })).toBeInTheDocument();
  });

  it("renders the login button and the signup link", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/signup");
  });

  it("shows the backend error message on a rejected login", async () => {
    server.use(
      http.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, () =>
        HttpResponse.json(
          {
            message: "Invalid credentials",
            resolution: "Check your email and password",
            error_code: "invalid_credentials",
          },
          { status: 400 }
        )
      )
    );
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i, { selector: "input" }), "wrongpass");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it("stores tokens after a successful login", async () => {
    const { useAuthStore } = await import("../authStore");
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i, { selector: "input" }), "correctpass");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("link", { name: /sign up/i })).toBeInTheDocument();
    expect(useAuthStore.getState().accessToken).toBe("mock-access-token");
    expect(useAuthStore.getState().user?.email).toBe("test@example.com");
  });
});
