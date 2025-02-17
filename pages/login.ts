import { Locator, Page } from '@playwright/test'

export class LoginPage {
    page: Page;
    userName: Locator;
    password: Locator;
    submitButton: Locator;
    loginError: Locator;

    constructor(page: Page) {
        this.page = page;
        this.userName = this.page.locator("#user-name");
        this.password = this.page.locator("#password");
        this.submitButton = this.page.locator("#login-button");
        this.loginError = this.page.locator('[data-test="error"]');
    }

    async login(userName: string, password: string) {
        await this.userName.fill(userName);
        await this.password.fill(password);
    }
}
