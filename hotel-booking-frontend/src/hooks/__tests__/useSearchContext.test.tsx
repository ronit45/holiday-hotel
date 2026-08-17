import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import useSearchContext from "../useSearchContext";
import { SearchContext } from "../../contexts/SearchContext";
import type { SearchContext as SearchContextType } from "../../contexts/SearchContext";

describe("useSearchContext hook", () => {
  it("should return the context when used within a SearchContext provider", () => {
    const mockContext: SearchContextType = {
      destination: "London",
      checkIn: new Date("2025-06-05"),
      checkOut: new Date("2025-06-10"),
      adultCount: 2,
      childCount: 0,
      hotelId: "123",
      saveSearchValues: () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SearchContext.Provider value={mockContext}>
        {children}
      </SearchContext.Provider>
    );

    const { result } = renderHook(() => useSearchContext(), { wrapper });

    expect(result.current).toEqual(mockContext);
    expect(result.current.destination).toBe("London");
    expect(result.current.adultCount).toBe(2);
  });
});
