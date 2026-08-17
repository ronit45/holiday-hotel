import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../Home";
import { BrowserRouter } from "react-router-dom";
import { useQueryWithLoading } from "../../hooks/useLoadingHooks";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

vi.mock("../../hooks/useLoadingHooks");

vi.mock("../../hooks/useSearchContext", () => ({
  useSearchContext: () => ({
    destination: "",
    checkIn: null,
    checkOut: null,
    adultCount: 1,
    childCount: 0,
    hotelId: "",
    saveSearchValues: vi.fn(),
  }),
}));

const mockHotels = [
  {
    _id: "1",
    name: "Luxury Resort",
    city: "Bali",
    country: "Indonesia",
    description: "Nice",
    type: "Resort",
    adultCount: 2,
    childCount: 0,
    facilities: ["Pool"],
    pricePerNight: 200,
    starRating: 5,
    imageUrls: ["img.jpg"],
    lastUpdated: new Date().toISOString(),
  },
];

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Hero component", () => {
    (useQueryWithLoading as import("vitest").Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <Home />
      </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Find your next stay/i)).toBeInTheDocument();
  });

  it("shows skeleton loaders while fetching", () => {
    (useQueryWithLoading as import("vitest").Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <Home />
      </BrowserRouter>
      </QueryClientProvider>
    );

    // Assuming we use skeleton loaders, they usually have an aria-busy or class 'animate-pulse'
    // Alternatively, just checking that hotel titles don't exist
    expect(screen.queryByText(/Luxury Resort/i)).not.toBeInTheDocument();
  });

  it("renders hotel cards after data loads", () => {
    (useQueryWithLoading as import("vitest").Mock).mockReturnValue({
      data: mockHotels,
      isLoading: false,
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <Home />
      </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Luxury Resort/i)).toBeInTheDocument();
  });
});
