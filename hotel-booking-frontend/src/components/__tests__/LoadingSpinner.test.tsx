import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner Component", () => {
  it("should render with default message when no props provided", () => {
    render(<LoadingSpinner />);
    expect(screen.getByText("Hotel room is getting ready...")).toBeInTheDocument();
    expect(screen.getByText("Please wait while we prepare everything for you...")).toBeInTheDocument();
  });

  it("should render custom message when passed as prop", () => {
    const customMessage = "Processing your payment...";
    render(<LoadingSpinner message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});
