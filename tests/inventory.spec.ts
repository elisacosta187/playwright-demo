import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login";
import { InventoryPage } from "../pages/inventory";

test.describe("Inventory Tests", () => {
  let login: LoginPage;
  let inventory: InventoryPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    inventory = new InventoryPage(page);
    await test.step('Go to login page', async () => {
      await login.page.goto("https://www.saucedemo.com/");
    })
    await test.step('Login with valid credentials', async () => {
      await login.login("standard_user", "secret_sauce");
    })
    await test.step('Click submit button', async () => {
      await login.submitButton.click();
    })
    await test.step('Expect to land on inventory page', async () => {
      await expect(login.page).toHaveURL(/inventory/);
    })    
  });

  test("Adding an item to the cart updates the cart icon", async () => {
    await test.step('Add first available item to the cart', async () => {
      await inventory.addToCartButton.first().click();
    })
    await test.step('Check cart icon is updated accordingly', async () => {
      await expect(inventory.cartBadge).toHaveText("1");
    })
  });

  test("Removing an item from the cart updates the cart icon", async () => {
    await test.step('Add first available item to the cart', async () => {
      await inventory.addToCartButton.first().click();
    })
    await test.step('Check cart icon is updated accordingly', async () => {
      await expect(inventory.cartBadge).toHaveText("1");
    })
    await test.step('Remove item from cart', async () => {
      await inventory.removeFromCartButton.first().click();
    })
    await test.step('Check cart icon is updated accordingly', async () => {
      await expect(inventory.cartBadge).not.toHaveText("1");
    })
  });
});
