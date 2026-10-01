import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const qc = createTestQueryClient();
  return {
    qc,
    ...render(
      <MemoryRouter>
        <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
      </MemoryRouter>,
      options
    ),
  };
}
