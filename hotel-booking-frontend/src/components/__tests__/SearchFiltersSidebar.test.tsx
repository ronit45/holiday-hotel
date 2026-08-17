import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchFiltersSidebar } from "../search/SearchFiltersSidebar";
import { BrowserRouter } from "react-router-dom";

const mockProps = {
  selectedStars: ["4"],
  handleStarsChange: vi.fn(),
  selectedHotelTypes: ["Budget"],
  handleHotelTypeChange: vi.fn(),
  selectedFacilities: ["Free WiFi"],
  handleFacilityChange: vi.fn(),
  selectedPrice: 100,
  setSelectedPrice: vi.fn(),
};

describe("SearchFiltersSidebar", () => {
  it("renders star rating, hotel type, facilities, price filters", () => {
    render(
      <BrowserRouter>
        <SearchFiltersSidebar {...mockProps} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Property Rating/i)).toBeInTheDocument();
    expect(screen.getByText(/Hotel Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Facilities/i)).toBeInTheDocument();
    expect(screen.getByText(/Max Price/i)).toBeInTheDocument();
  });

  it("clicking a star checkbox calls handler", () => {
    render(
      <BrowserRouter>
        <SearchFiltersSidebar {...mockProps} />
      </BrowserRouter>
    );

    const fiveStarCheckbox = screen.getByLabelText(/5 Stars/i);
    fireEvent.click(fiveStarCheckbox);

    expect(mockProps.handleStarsChange).toHaveBeenCalled();
  });

  it("price slider displays value", () => {
    render(
      <BrowserRouter>
        <SearchFiltersSidebar {...mockProps} />
      </BrowserRouter>
    );

    const priceSelect = screen.getByRole("combobox");
    expect(priceSelect).toBeInTheDocument();
  });
});
