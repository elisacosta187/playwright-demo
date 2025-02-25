import { test, expect } from "@playwright/test";
import { LoginPage } from "pages/login";

test.describe("Login Tests", () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.page.goto("https://www.saucedemo.com/");
  });

  test("Successful login takes me to inventory page", async ({ page }) => {
    await login.login("standard_user", "secret_sauce");
    await login.submitButton.click();
    await expect(login.page).toHaveURL(/inventory/);
  });

  test("Invalid login shows error", async ({ page }) => {
    await login.login("invalid_user", "wrong_password");
    await login.submitButton.click();
    await expect(login.loginError).toBeVisible();
  });

  test("Check page status is OK", async ({ page }) => {
    const response = await page.request.get("https://www.saucedemo.com/");
    expect(response.status()).toBe(200);
  });
});
