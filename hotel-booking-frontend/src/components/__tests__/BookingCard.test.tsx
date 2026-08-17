import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingCard } from "../bookings/BookingCard";
import { BrowserRouter } from "react-router-dom";
import { BookingType } from "../../../shared/types";

const mockBooking: BookingType = {
  _id: "1",
  userId: "user1",
  hotelId: "hotel1",
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  phone: "123",
  adultCount: 2,
  childCount: 1,
  checkIn: new Date("2026-01-01").toISOString(),
  checkOut: new Date("2026-01-05").toISOString(),
  totalCost: 500,
  status: "confirmed",
  paymentStatus: "paid",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cancellationReason: "",
  paymentMethod: "card",
  refundAmount: 0,
  specialRequests: ""
};

describe("BookingCard", () => {
  it("renders booking details correctly", () => {
    render(
      <BrowserRouter>
        <BookingCard booking={mockBooking} />
      </BrowserRouter>
    );
    expect(screen.getByText(/Dates:/i)).toBeInTheDocument();
    expect(screen.getByText(/2 adults, 1 children/i)).toBeInTheDocument();
  });

  it("shows correct status badge for confirmed", () => {
    render(
      <BrowserRouter>
        <BookingCard booking={mockBooking} />
      </BrowserRouter>
    );
    expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
  });

  it("shows cancel button for cancellable bookings", () => {
    render(
      <BrowserRouter>
        <BookingCard booking={mockBooking} onCancel={vi.fn()} />
      </BrowserRouter>
    );
    // Button might be present for cancellation
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("hides cancel button for cancelled bookings", () => {
    render(
      <BrowserRouter>
        <BookingCard booking={{ ...mockBooking, status: "cancelled" }} onCancel={vi.fn()} />
      </BrowserRouter>
    );
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
  });
});
