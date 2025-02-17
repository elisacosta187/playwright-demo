import { Page, Locator } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly removeFromCartButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.locator(".inventory_item button:has-text('Add to cart')");
    this.removeFromCartButton = page.locator(".inventory_item button:has-text('Remove')");
    this.cartBadge = page.locator(".shopping_cart_badge");
  }
}