import { Browser, Page, ElementHandle } from 'puppeteer';

/**
 * Default navigation options for Puppeteer
 */
export const DEFAULT_NAVIGATION_OPTIONS = {
  waitUntil: 'networkidle0' as const,
  timeout: 30000
};

/**
 * Default screenshot options for Puppeteer
 */
export const DEFAULT_SCREENSHOT_OPTIONS = {
  fullPage: true,
  type: 'jpeg' as const,
  quality: 80
};

/**
 * Navigate to a URL and wait for the page to load
 * @param page Puppeteer page
 * @param url URL to navigate to
 * @param options Navigation options
 * @returns Response object
 */
export async function navigateToUrl(
  page: Page,
  url: string,
  options = DEFAULT_NAVIGATION_OPTIONS
) {
  try {
    return await page.goto(url, options);
  } catch (error) {
    console.error(`Error navigating to ${url}:`, error);
    throw new Error(`Failed to navigate to ${url}`);
  }
}

/**
 * Wait for an element to be visible on the page
 * @param page Puppeteer page
 * @param selector CSS selector
 * @param timeout Timeout in milliseconds
 * @returns Element handle if found
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<ElementHandle<Element> | null> {
  try {
    return await page.waitForSelector(selector, { visible: true, timeout });
  } catch (error) {
    console.warn(`Element not found: ${selector}`);
    return null;
  }
}

/**
 * Extract text content from elements matching a selector
 * @param page Puppeteer page
 * @param selector CSS selector
 * @returns Array of text content
 */
export async function extractTextFromElements(
  page: Page,
  selector: string
): Promise<string[]> {
  return await page.evaluate((sel) => {
    const elements = document.querySelectorAll(sel);
    return Array.from(elements).map(el => el.textContent || '');
  }, selector);
}

/**
 * Extract attribute values from elements matching a selector
 * @param page Puppeteer page
 * @param selector CSS selector
 * @param attribute Attribute name
 * @returns Array of attribute values
 */
export async function extractAttributeFromElements(
  page: Page,
  selector: string,
  attribute: string
): Promise<string[]> {
  return await page.evaluate((sel, attr) => {
    const elements = document.querySelectorAll(sel);
    return Array.from(elements).map(el => el.getAttribute(attr) || '');
  }, selector, attribute);
}

/**
 * Take a screenshot of the page
 * @param page Puppeteer page
 * @param options Screenshot options
 * @returns Buffer containing the screenshot
 */
export async function takeScreenshot(
  page: Page,
  options = DEFAULT_SCREENSHOT_OPTIONS
): Promise<Buffer> {
  try {
    return await page.screenshot(options) as Buffer;
  } catch (error) {
    console.error('Error taking screenshot:', error);
    throw new Error('Failed to take screenshot');
  }
}

/**
 * Create a new page with common settings
 * @param browser Puppeteer browser
 * @returns New page
 */
export async function createPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 800 });
  
  // Set user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );
  
  return page;
}

/**
 * Check if an element exists on the page
 * @param page Puppeteer page
 * @param selector CSS selector
 * @returns True if element exists
 */
export async function elementExists(
  page: Page,
  selector: string
): Promise<boolean> {
  const element = await page.$(selector);
  return element !== null;
}

/**
 * Click on an element
 * @param page Puppeteer page
 * @param selector CSS selector
 * @returns True if click was successful
 */
export async function clickElement(
  page: Page,
  selector: string
): Promise<boolean> {
  try {
    await page.click(selector);
    return true;
  } catch (error) {
    console.error(`Error clicking element ${selector}:`, error);
    return false;
  }
}

/**
 * Type text into an input field
 * @param page Puppeteer page
 * @param selector CSS selector
 * @param text Text to type
 * @returns True if typing was successful
 */
export async function typeText(
  page: Page,
  selector: string,
  text: string
): Promise<boolean> {
  try {
    await page.type(selector, text);
    return true;
  } catch (error) {
    console.error(`Error typing text into ${selector}:`, error);
    return false;
  }
}

/**
 * Wait for network to be idle
 * @param page Puppeteer page
 * @param timeout Timeout in milliseconds
 * @returns True if network is idle
 */
export async function waitForNetworkIdle(
  page: Page,
  timeout = 5000
): Promise<boolean> {
  try {
    await page.waitForNetworkIdle({ timeout });
    return true;
  } catch (error) {
    console.warn('Network did not become idle within timeout');
    return false;
  }
} 