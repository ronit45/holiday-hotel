import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignOutButton from "../SignOutButton";

// Mock hooks
const mockNavigate = vi.fn();
const mockShowToast = vi.fn();
const mockMutate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../hooks/useAppContext", () => ({
  default: () => ({
    showToast: mockShowToast,
  }),
}));

vi.mock("react-query", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
      removeQueries: vi.fn(),
      clear: vi.fn(),
    }),
  };
});

vi.mock("../../hooks/useLoadingHooks", () => ({
  useMutationWithLoading: (_fn: any, options: any) => ({
    mutate: (vars: any) => {
      mockMutate(vars);
      if (options.onSuccess) {
        options.onSuccess();
      }
    },
  }),
}));

// We must also mock the UI dropdown so it renders openly or we interact with it
vi.mock("../ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe("SignOutButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should render profile button", () => {
    localStorage.setItem("user_name", "Test User");
    render(<SignOutButton />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("should trigger sign out mutation when clicked", async () => {
    render(<SignOutButton />);
    
    const signOutBtn = screen.getByText(/Sign Out/i);
    fireEvent.click(signOutBtn);
    
    expect(mockShowToast).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in");
    });
  });
});
