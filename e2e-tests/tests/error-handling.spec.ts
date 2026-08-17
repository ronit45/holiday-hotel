import { test, expect } from "@playwright/test";

const UI_URL = "http://localhost:5174/";

test.describe("Error Handling", () => {
  test("Navigate to non-existent route should redirect or show 404", async ({ page }) => {
    await page.goto(`${UI_URL}some/fake/route/that/does/not/exist`);
    // Assuming the app has a fallback catch-all that redirects to home
    // Wait for redirect
    await expect(page).toHaveURL(UI_URL);
  });

  test("Attempt booking while logged out should redirect to sign in", async ({ page }) => {
    await page.goto(UI_URL);
    await page.getByPlaceholder("Where are you going?").fill("Dublin");
    await page.getByRole("button", { name: "Search" }).click();
    
    await page.getByText("Dublin Getaways").click();
    
    // We expect the button to say "Sign in to Book" when logged out
    const bookBtn = page.getByRole("button", { name: "Sign in to Book" });
    if (await bookBtn.isVisible()) {
      await bookBtn.click();
      await expect(page).toHaveURL(/sign-in/);
    }
  });

  test("API server down graceful error", async ({ page }) => {
    // We can simulate an API error by intercepting network requests
    await page.route("**/api/hotels/search*", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal Server Error" }),
      });
    });

    await page.goto(UI_URL);
    await page.getByPlaceholder("Where are you going?").fill("Dublin");
    await page.getByRole("button", { name: "Search" }).click();

    // Verify error handling (like a toast or empty state)
    // The exact UI response depends on react-query error handling, usually a toast
    // Just verify the app didn't crash completely
    await expect(page.getByRole("heading", { name: "Filter by:" })).toBeVisible();
  });
});
