import { vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAdvancedSearch } from "../queries/useAdvancedSearch";
import { useSearchParams } from "react-router-dom";
import useSearchContext from "../../hooks/useSearchContext";
import { useQueryWithLoading } from "../../hooks/useLoadingHooks";

// Mock dependencies
vi.mock("react-router-dom", () => ({
  useSearchParams: vi.fn(),
}));

vi.mock("../../hooks/useSearchContext");
vi.mock("../../hooks/useLoadingHooks");
vi.mock("../../api-client");

describe("useAdvancedSearch", () => {
  const mockSaveSearchValues = vi.fn();
  let mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    vi.clearAllMocks();

    (useSearchParams as import("vitest").Mock).mockReturnValue([mockSearchParams, vi.fn()]);

    (useSearchContext as import("vitest").Mock).mockReturnValue({
      destination: "London",
      checkIn: new Date("2026-01-01"),
      checkOut: new Date("2026-01-05"),
      adultCount: 2,
      childCount: 0,
      saveSearchValues: mockSaveSearchValues,
    });

    (useQueryWithLoading as import("vitest").Mock).mockReturnValue({
      data: { data: [], pagination: { total: 0, pages: 1, page: 1 } },
      isLoading: false,
    });
  });

  it("initializes filter state from search context", () => {
    const { result } = renderHook(() => useAdvancedSearch());

    expect(result.current.searchContext.destination).toBe("London");
    expect(result.current.filters.page).toBe(1);
    expect(result.current.filters.selectedStars).toEqual([]);
  });

  it("handleStarsChange toggles stars correctly and resets page", () => {
    const { result } = renderHook(() => useAdvancedSearch());

    act(() => {
      result.current.filters.setPage(2);
      result.current.filters.handleStarsChange({
        target: { value: "4", checked: true },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.filters.selectedStars).toContain("4");
    expect(result.current.filters.page).toBe(1); // resets page to 1

    act(() => {
      result.current.filters.handleStarsChange({
        target: { value: "4", checked: false },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.filters.selectedStars).not.toContain("4");
  });

  it("handleSortChange updates sort option", () => {
    const { result } = renderHook(() => useAdvancedSearch());

    act(() => {
      result.current.filters.handleSortChange("pricePerNightAsc");
    });

    expect(result.current.filters.sortOption).toBe("pricePerNightAsc");
  });

  it("clearFilters resets all filters", () => {
    const { result } = renderHook(() => useAdvancedSearch());

    act(() => {
      result.current.filters.handleStarsChange({
        target: { value: "5", checked: true },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.filters.setSelectedPrice(100);
      result.current.filters.handleSortChange("starRating");
      result.current.filters.clearFilters();
    });

    expect(result.current.filters.selectedStars).toEqual([]);
    expect(result.current.filters.selectedPrice).toBeUndefined();
    expect(result.current.filters.sortOption).toBe("");
  });
});
