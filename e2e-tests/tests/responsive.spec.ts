import { test, expect } from "@playwright/test";

const UI_URL = "http://localhost:5174/";

test.describe("Responsive Flow", () => {
  // Only run this test in mobile projects, or run in all and check viewport
  test("should open and close hamburger menu", async ({ page, isMobile }) => {
    // Only perform the hamburger test if it's a mobile viewport
    if (!isMobile) return;

    await page.goto(UI_URL);

    // Verify hamburger button is visible
    const menuBtn = page.locator('button[aria-label="Open Menu"]');
    await expect(menuBtn).toBeVisible();

    // Open menu
    await menuBtn.click();
    
    // Verify mobile nav is visible (e.g., sheet content)
    const mobileNav = page.locator('[role="dialog"]');
    await expect(mobileNav).toBeVisible();

    // Verify links are visible
    await expect(page.getByRole("link", { name: "Sign In" }).last()).toBeVisible();

    // Close menu (clicking outside or close button)
    const closeBtn = page.locator('button[aria-label="Close"]');
    await closeBtn.click();

    await expect(mobileNav).not.toBeVisible();
  });

  test("should render search bar correctly on mobile", async ({ page, isMobile }) => {
    if (!isMobile) return;
    
    await page.goto(UI_URL);

    // Verify input fields stack or adapt (basic visibility check)
    const destinationInput = page.getByPlaceholder("Where are you going?");
    await expect(destinationInput).toBeVisible();
    
    // Fill and search
    await destinationInput.fill("Dublin");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page.getByText("Hotels found in Dublin")).toBeVisible();
  });
});
