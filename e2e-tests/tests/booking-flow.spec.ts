import { test, expect } from "@playwright/test";

const UI_URL = "http://localhost:5174/";

test.describe("Booking Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(UI_URL);

    // get the sign in button
    await page.getByRole("link", { name: "Sign In" }).click();

    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

    await page.locator("[name=email]").fill("1@1.com");
    await page.locator("[name=password]").fill("password123");

    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Sign in Successful!")).toBeVisible();
  });

  test("should book a hotel and then cancel the booking", async ({ page }) => {
    // 1. Search and Book
    await page.goto(UI_URL);
    await page.getByPlaceholder("Where are you going?").fill("Dublin");

    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 3);
    const formattedCheckIn = checkInDate.toISOString().split("T")[0];
    
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 5);
    const formattedCheckOut = checkOutDate.toISOString().split("T")[0];

    // Wait for the inputs to be ready
    await page.waitForTimeout(500);

    // Select check-in and check-out
    await page.getByPlaceholder("Check-out Date").fill(formattedCheckOut);
    await page.getByPlaceholder("Check-in Date").fill(formattedCheckIn);

    await page.getByRole("button", { name: "Search" }).click();

    await page.getByText("Dublin Getaways").click();
    await page.getByRole("button", { name: "Book now" }).click();

    await expect(page.getByText("Total Cost:")).toBeVisible();

    const stripeFrame = page.frameLocator("iframe").first();
    await stripeFrame
      .locator('[placeholder="Card number"]')
      .fill("4242424242424242");
    await stripeFrame.locator('[placeholder="MM / YY"]').fill("04/30");
    await stripeFrame.locator('[placeholder="CVC"]').fill("242");
    await stripeFrame.locator('[placeholder="ZIP"]').fill("24225");

    await page.getByRole("button", { name: "Confirm Booking" }).click();
    await expect(page.getByText("Booking Saved!")).toBeVisible();

    // 2. Verify in My Bookings
    await page.getByRole("link", { name: "My Bookings" }).click();
    
    // Check if Dublin Getaways appears in the bookings list
    await expect(page.locator("h2").filter({ hasText: "Dublin Getaways" }).first()).toBeVisible();
    
    // 3. Cancel the booking
    // Find the first Cancel Booking button in the page
    const cancelBtn = page.getByRole("button", { name: "Cancel Booking" }).first();
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();
    
    // In the dialog
    await page.getByPlaceholder("Optional: Tell us why you are cancelling...").fill("Plans changed");
    await page.getByRole("button", { name: "Confirm Cancellation" }).click();
    
    // Wait for success toast
    await expect(page.getByText("Booking cancelled successfully")).toBeVisible();
    
    // Verify status changed to cancelled (and refund shown)
    // The pill might say "Cancelled" 
    await expect(page.getByText("Refunded:")).first().toBeVisible();
  });
});
