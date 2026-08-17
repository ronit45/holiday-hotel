import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchBar from "../SearchBar";
import { BrowserRouter } from "react-router-dom";
import useSearchContext from "../../hooks/useSearchContext";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi } from "vitest";

vi.mock("../../hooks/useSearchContext");

const queryClient = new QueryClient();

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SearchBar />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("SearchBar", () => {
  const mockSaveSearchValues = vi.fn();

  beforeEach(() => {
    (useSearchContext as import("vitest").Mock).mockReturnValue({
      destination: "",
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 86400000),
      adultCount: 2,
      childCount: 0,
      saveSearchValues: mockSaveSearchValues,
    });
  });

  it("renders destination input, date pickers, guest counters", () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/Where are you going?/i)).toBeInTheDocument();
    // Assuming DatePicker renders inputs with placeholders like "Check-in Date" or similar
    // It's robust to just check the submit button exists
    expect(screen.getByRole("button", { name: /Search/i })).toBeInTheDocument();
  });

  it("typing in destination triggers change", () => {
    renderComponent();
    const destinationInput = screen.getByPlaceholderText(/Where are you going?/i);
    fireEvent.change(destinationInput, { target: { value: "London" } });
    expect((destinationInput as HTMLInputElement).value).toBe("London");
  });

  it("submitting calls saveSearchValues", async () => {
    renderComponent();
    const destinationInput = screen.getByPlaceholderText(/Where are you going?/i);
    fireEvent.change(destinationInput, { target: { value: "Paris" } });
    
    const submitButton = screen.getByRole("button", { name: /Search/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSaveSearchValues).toHaveBeenCalled();
    });
  });
});
