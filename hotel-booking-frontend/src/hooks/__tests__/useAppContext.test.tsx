import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import useAppContext from "../useAppContext";
import { AppContext } from "../../contexts/AppContext";
import type { AppContext as AppContextType } from "../../contexts/AppContext";

describe("useAppContext hook", () => {
  it("should return the context when used within an AppContext provider", () => {
    const mockContext: AppContextType = {
      showToast: () => {},
      isLoggedIn: true,
      stripePromise: null as any,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppContext.Provider value={mockContext}>
        {children}
      </AppContext.Provider>
    );

    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current).toEqual(mockContext);
    expect(result.current.isLoggedIn).toBe(true);
  });
});
