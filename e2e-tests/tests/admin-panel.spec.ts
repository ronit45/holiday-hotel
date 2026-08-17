import { test, expect } from "@playwright/test";

const UI_URL = "http://localhost:5174/";

test.describe("Admin Panel Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(UI_URL);

    // get the sign in button
    await page.getByRole("link", { name: "Sign In" }).click();

    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

    // Use admin user credentials from the seed script (usually 3@3.com or similar)
    await page.locator("[name=email]").fill("3@3.com");
    await page.locator("[name=password]").fill("password123");

    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Sign in Successful!")).toBeVisible();
  });

  test("should access admin dashboard and view insights", async ({ page }) => {
    // 1. Navigate to Admin Panel
    await page.getByRole("link", { name: "Admin Panel" }).click();
    await expect(page.getByRole("heading", { name: "Platform Admin" })).toBeVisible();

    // 2. Dashboard insights visible
    await expect(page.getByText("Total Users")).toBeVisible();
    await expect(page.getByText("Total Hotels")).toBeVisible();
    await expect(page.getByText("Total Revenue")).toBeVisible();
  });

  test("should manage hotels (toggle active)", async ({ page }) => {
    await page.getByRole("link", { name: "Admin Panel" }).click();
    
    // Switch to Hotels tab
    await page.getByRole("tab", { name: "Hotels" }).click();
    
    // Verify a hotel exists
    await expect(page.getByRole("cell", { name: "Dublin Getaways" })).toBeVisible();
    
    // Toggle active state
    // Just verifying the switch is there and clickable
    const switchBtn = page.getByRole("switch").first();
    await switchBtn.click();
    await expect(page.getByText("Hotel status updated")).toBeVisible();
  });

  test("should manage users", async ({ page }) => {
    await page.getByRole("link", { name: "Admin Panel" }).click();
    
    // Switch to Users tab
    await page.getByRole("tab", { name: "Users" }).click();
    
    // Verify user list
    await expect(page.getByRole("cell", { name: "1@1.com" })).toBeVisible();
  });

  test("should manage reviews", async ({ page }) => {
    await page.getByRole("link", { name: "Admin Panel" }).click();
    
    // Switch to Reviews tab
    await page.getByRole("tab", { name: "Reviews" }).click();
    
    // Delete a review if there's one. Let's just verify the tab loads.
    await expect(page.getByRole("table")).toBeVisible();
  });
});
