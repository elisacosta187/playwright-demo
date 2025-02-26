# 🎭 Demo - Playwright

This project contains automated UI tests for SauceDemo, a demo e-commerce site.

## How to setup the project

### Clone the repository

SSH

```
git clone https://github.com/elisacosta187/playwright-demo.git
```

HTTPS

```
git clone git@github.com:elisacosta187/playwright-demo.git
```

### Install dependencies

```
yarn install
yarn playwright install
```

### Run all tests

```
yarn playwright test
```

### Run specific test folder

```
yarn playwright test /path/to/test
```

## Makefile commands

| Command                   | Description                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `docker-install`          | Install dependencies, husky hooks and playwright browsers.                         |
| `sh`                      | Execute a shell inside the running playwright container.                           |
| `docker-test`             | Run all tests but those including @snapshot in the test name locally.              |
| `docker-test-snapshots`   | Run only tests containing @snapshot in the test name                               |
| `docker-update-snapshots` | Run only tests containing @snapshot in the test name, updating existing snapshots. |
| `generate-doc`            | Generate test documentation based on test steps.                                   |
| `clean`                   | Delete test reports folders.                                                       |

## Useful Commands

| Command                      | Description                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `npx playwright show-report` | Open html test report (`playwright-report` folder by default or specify folder name)           |
| `npx playwright open `       | Open Playwright inpector and an instance of Chromium to debug locators or record test actions. |
| `npx playwright codegen `    | Open Playwright inpector and an instance of Chromium to record test actions.                   |

## Useful links

[Playwright documentation](https://playwright.dev/docs/intro)

[Playwright GitHub repository](https://github.com/microsoft/playwright)

[Playwright VSCode extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
