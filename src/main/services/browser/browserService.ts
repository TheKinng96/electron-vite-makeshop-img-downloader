import { Browser } from 'puppeteer';
import * as puppeteer from 'puppeteer';

/**
 * Configuration for the BrowserManager
 */
export interface BrowserManagerConfig {
  maxInstances: number;
  launchOptions: puppeteer.LaunchOptions;
  idleTimeout: number; // Time in ms before an idle browser is closed
}

/**
 * Default configuration for the BrowserManager
 */
const DEFAULT_CONFIG: BrowserManagerConfig = {
  maxInstances: 4,
  launchOptions: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  idleTimeout: 5 * 60 * 1000 // 5 minutes
};

/**
 * Represents a browser instance with metadata
 */
interface BrowserInstance {
  browser: Browser;
  inUse: boolean;
  lastUsed: number;
}

/**
 * Manages browser instances with pooling and lifecycle management
 */
export class BrowserManager {
  private static instance: BrowserManager;
  private browserInstances: BrowserInstance[] = [];
  private config: BrowserManagerConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(config: Partial<BrowserManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanupInterval();
  }

  /**
   * Get the singleton instance of BrowserManager
   */
  public static getInstance(config?: Partial<BrowserManagerConfig>): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager(config);
    }
    return BrowserManager.instance;
  }

  /**
   * Start the cleanup interval to close idle browsers
   */
  private startCleanupInterval(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleBrowsers();
    }, 60 * 1000);
  }

  /**
   * Stop the cleanup interval
   */
  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clean up idle browsers that have exceeded the idle timeout
   */
  private async cleanupIdleBrowsers(): Promise<void> {
    const now = Date.now();
    const browsersToClose = this.browserInstances.filter(
      instance => !instance.inUse && (now - instance.lastUsed) > this.config.idleTimeout
    );

    for (const instance of browsersToClose) {
      await this.closeBrowser(instance.browser);
    }
  }

  /**
   * Close a browser and remove it from the instances list
   */
  private async closeBrowser(browser: Browser): Promise<void> {
    try {
      await browser.close();
      this.browserInstances = this.browserInstances.filter(
        instance => instance.browser !== browser
      );
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  }

  /**
   * Acquire a browser instance from the pool
   */
  public async acquireBrowser(): Promise<Browser> {
    // Check for an available browser in the pool
    const availableInstance = this.browserInstances.find(instance => !instance.inUse);
    
    if (availableInstance) {
      availableInstance.inUse = true;
      availableInstance.lastUsed = Date.now();
      return availableInstance.browser;
    }

    // If we've reached the maximum number of instances, wait for one to become available
    if (this.browserInstances.length >= this.config.maxInstances) {
      return this.waitForAvailableBrowser();
    }

    // Create a new browser instance
    return this.createNewBrowser();
  }

  /**
   * Wait for an available browser to become available
   */
  private async waitForAvailableBrowser(): Promise<Browser> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(async () => {
        const availableInstance = this.browserInstances.find(instance => !instance.inUse);
        
        if (availableInstance) {
          clearInterval(checkInterval);
          availableInstance.inUse = true;
          availableInstance.lastUsed = Date.now();
          resolve(availableInstance.browser);
        }
      }, 100);
    });
  }

  /**
   * Create a new browser instance
   */
  private async createNewBrowser(): Promise<Browser> {
    try {
      const browser = await puppeteer.launch(this.config.launchOptions);
      
      this.browserInstances.push({
        browser,
        inUse: true,
        lastUsed: Date.now()
      });
      
      return browser;
    } catch (error) {
      console.error('Error creating new browser:', error);
      throw new Error('Failed to create new browser instance');
    }
  }

  /**
   * Release a browser back to the pool
   */
  public releaseBrowser(browser: Browser): void {
    const instance = this.browserInstances.find(instance => instance.browser === browser);
    
    if (instance) {
      instance.inUse = false;
      instance.lastUsed = Date.now();
    }
  }

  /**
   * Clean up all browser instances
   */
  public async cleanup(): Promise<void> {
    this.stopCleanupInterval();
    
    const closePromises = this.browserInstances.map(instance => 
      this.closeBrowser(instance.browser)
    );
    
    await Promise.all(closePromises);
    this.browserInstances = [];
  }

  /**
   * Get the current number of browser instances
   */
  public getInstanceCount(): number {
    return this.browserInstances.length;
  }

  /**
   * Get the number of browsers currently in use
   */
  public getInUseCount(): number {
    return this.browserInstances.filter(instance => instance.inUse).length;
  }
} 