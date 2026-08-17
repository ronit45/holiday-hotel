import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "../Pagination";

describe("Pagination Component", () => {
  it("should not render if pages <= 0", () => {
    const { container } = render(<Pagination page={1} pages={0} onPageChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render correct number of page buttons", () => {
    render(<Pagination page={1} pages={3} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
  });

  it("should disable Prev button on first page", () => {
    render(<Pagination page={1} pages={3} onPageChange={() => {}} />);
    const prevButton = screen.getByRole("button", { name: /prev/i });
    expect(prevButton).toBeDisabled();
  });

  it("should disable Next button on last page", () => {
    render(<Pagination page={3} pages={3} onPageChange={() => {}} />);
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it("should call onPageChange when clicking a page number", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} pages={3} onPageChange={onPageChange} />);
    
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("should call onPageChange with correct values for Prev and Next", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pages={3} onPageChange={onPageChange} />);
    
    fireEvent.click(screen.getByRole("button", { name: /prev/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
    
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
