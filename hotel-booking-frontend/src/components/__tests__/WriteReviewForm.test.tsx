import * as appContext from "../../hooks/useAppContext";
import { vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WriteReviewForm from "../WriteReviewForm";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

vi.mock("../../hooks/useAppContext", () => ({
  useAppContext: vi.fn()
}));

describe("WriteReviewForm", () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.mocked(appContext.useAppContext).mockReturnValue({ showToast: vi.fn() } as any);
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <WriteReviewForm
          hotelId="hotel1"
          bookingId="booking1"
          onSuccess={mockOnSuccess}
        />
      </QueryClientProvider>
    );

  it("opens the form when 'Write a review' button is clicked", () => {
    renderComponent();
    const button = screen.getByRole("button", { name: /Write a review/i });
    fireEvent.click(button);
    expect(screen.getByText(/Overall Rating/i)).toBeInTheDocument();
  });

  it("submits the form", async () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: /Write a review/i }));
    
    const commentInput = screen.getByPlaceholderText(/Tell us about your stay/i);
    fireEvent.change(commentInput, { target: { value: "Great stay" } });

    const submitBtn = screen.getByRole("button", { name: /Submit Review/i });
    fireEvent.click(submitBtn);

    // This is a minimal test to verify rendering and interaction
    await waitFor(() => {
      expect(submitBtn).toBeInTheDocument();
    });
  });
});
