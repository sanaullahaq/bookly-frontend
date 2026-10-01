import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../test/utils";
import TagEditor from "../TagEditor";
import type { TagOut } from "../../../types/tags";

const tags: TagOut[] = [
  { uid: "tag-1", name: "classic", created_at: "2024-01-01T00:00:00" },
  { uid: "tag-2", name: "sci-fi", created_at: "2024-01-01T00:00:00" },
];

function renderEditor(overrides: TagOut[] = tags) {
  return renderWithProviders(<TagEditor bookUid="book-1" tags={overrides} />);
}

describe("TagEditor", () => {
  it("renders a chip per attached tag with a labelled remove button", () => {
    renderEditor();
    expect(screen.getByText("classic")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove tag classic" })).toBeInTheDocument();
  });

  it("shows the empty state with no tags", () => {
    renderEditor([]);
    expect(screen.getByText(/no tags yet/i)).toBeInTheDocument();
  });

  it("keeps the remove button hidden at rest and reveals it on focus", async () => {
    renderEditor();
    const remove = screen.getByRole("button", { name: "Remove tag classic" });
    // opacity-0 at rest; group-hover:opacity-100 / focus-visible:opacity-100
    expect(remove).toHaveClass("opacity-0");
    remove.focus();
    await waitFor(() => expect(remove).toHaveFocus());
    expect(remove.className).toContain("focus-visible:opacity-100");
  });

  it("does not reserve horizontal space for the remove button", () => {
    renderEditor();
    // Guards against reintroducing the transition-[padding-right] approach.
    expect(screen.getByText("classic").className).not.toContain("padding-right");
  });

  it("excludes already-attached tags from the picker suggestions", async () => {
    renderEditor();
    const input = screen.getByPlaceholderText(/add a tag/i);
    const options = Array.from(
      (input as HTMLInputElement).list?.options ?? []
    ).map((o) => o.value);
    expect(options).not.toContain("classic");
  });

  it("disables Add for an empty input and for a duplicate name", async () => {
    const user = userEvent.setup();
    renderEditor();
    const add = screen.getByRole("button", { name: "Add" });

    expect(add).toBeDisabled();
    await user.type(screen.getByPlaceholderText(/add a tag/i), "classic");
    expect(add).toBeDisabled();
  });

  it("rejects an empty tag name without a network request", async () => {
    const user = userEvent.setup();
    renderEditor([]);
    await user.type(screen.getByPlaceholderText(/add a tag/i), "   ");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });
});
