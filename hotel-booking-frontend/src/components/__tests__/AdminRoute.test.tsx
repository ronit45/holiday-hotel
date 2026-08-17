import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminRoute from "../AdminRoute";
import { BrowserRouter } from "react-router-dom";
import * as useAppContext from "../../hooks/useAppContext";

vi.mock("../../hooks/useAppContext");

describe("AdminRoute", () => {
  it("shows spinner while loading role", () => {
    (useAppContext.useAppContext as import("vitest").Mock).mockReturnValue({
      role: undefined,
      isLoadingRole: true,
    });

    render(
      <BrowserRouter>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </BrowserRouter>
    );

    // LoadingSpinner usually has a visually-hidden text or SVG
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("redirects non-admin users to home", () => {
    (useAppContext.useAppContext as import("vitest").Mock).mockReturnValue({
      role: "guest",
      isLoadingRole: false,
    });

    render(
      <BrowserRouter>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </BrowserRouter>
    );

    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("renders children for admin user", () => {
    (useAppContext.useAppContext as import("vitest").Mock).mockReturnValue({
      role: "admin",
      isLoadingRole: false,
    });

    render(
      <BrowserRouter>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </BrowserRouter>
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });
});
