import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../../../test/server";
import { renderWithProviders } from "../../../test/utils";
import BooksListPage from "../BooksListPage";

describe("BooksListPage", () => {
  it("renders books from the API", async () => {
    renderWithProviders(<BooksListPage />);
    expect(await screen.findByText("The Great Gatsby")).toBeInTheDocument();
    expect(screen.getByText(/F\. Scott Fitzgerald/)).toBeInTheDocument();
  });

  it("renders tag chips on a book card", async () => {
    renderWithProviders(<BooksListPage />);
    expect(await screen.findByText("classic")).toBeInTheDocument();
  });

  it("shows the empty state when there are no books", async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_BASE_URL}/books/`, () =>
        HttpResponse.json([])
      )
    );
    renderWithProviders(<BooksListPage />);
    expect(
      await screen.findByText(/no books yet\. create your first book!/i)
    ).toBeInTheDocument();
  });

  it("shows the error state when the request fails", async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_BASE_URL}/books/`, () =>
        HttpResponse.json({ message: "Server exploded", error_code: "internal_error" }, { status: 500 })
      )
    );
    renderWithProviders(<BooksListPage />);
    expect(await screen.findByText(/server exploded/i)).toBeInTheDocument();
  });

  it("shows the loading spinner before data arrives", async () => {
    renderWithProviders(<BooksListPage />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  });
});
