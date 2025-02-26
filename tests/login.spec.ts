import { test, expect } from "@playwright/test";
import { LoginPage } from "pages/login";

test.describe("Login Tests", () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await test.step('Go to login page', async () => {
      await login.page.goto("https://www.saucedemo.com/");
    })
  });

  test("Successful login takes me to inventory page", async ({ page }) => {
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

  test("Invalid login shows error", async ({ page }) => {
    await test.step('Login with invalid credentials', async () => {
      await login.login("invalid_user", "wrong_password");
    })
    await test.step('Click submit button', async () => {
      await login.submitButton.click();
    })
    await test.step('Expect to see login error', async () => {
      await expect(login.loginError).toBeVisible();
    })
  });

  test("Check page status is OK", async ({ page }) => {
    const response = await page.request.get("https://www.saucedemo.com/");
    await test.step('Check page status is OK', async () => {
      expect(response.status()).toBe(200);
    })
  });
});
