import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login";
import { InventoryPage } from "../pages/inventory"; // New page object

test.describe("Inventory Tests", () => {
  let login: LoginPage;
  let inventory: InventoryPage; // New inventory page object

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    inventory = new InventoryPage(page); // Initialize inventory page
    await login.page.goto("https://www.saucedemo.com/");
    await login.login("standard_user", "secret_sauce");
    await login.submitButton.click();
    await expect(login.page).toHaveURL(/inventory/);
  });

  test("Adding an item to the cart updates the cart icon", async () => {
    await inventory.addToCartButton.first().click();
    await expect(inventory.cartBadge).toHaveText("1");
  });

  test("Removing an item from the cart updates the cart icon", async () => {
    await inventory.addToCartButton.first().click();
    await expect(inventory.cartBadge).toHaveText("1");
    await inventory.removeFromCartButton.first().click();
    await expect(inventory.cartBadge).not.toBeVisible(); // Assuming it disappears when empty
  });
});
