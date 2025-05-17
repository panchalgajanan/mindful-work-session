import { toast } from "sonner";

class WebsiteBlockerService {
  private static instance: WebsiteBlockerService;
  private blockedWebsites: Set<string> = new Set();
  private isActive: boolean = false;

  private constructor() {}

  static getInstance(): WebsiteBlockerService {
    if (!WebsiteBlockerService.instance) {
      WebsiteBlockerService.instance = new WebsiteBlockerService();
    }
    return WebsiteBlockerService.instance;
  }

  // Initialize the blocker with a list of websites
  initialize(websites: string[]) {
    this.blockedWebsites = new Set(websites.map(site => this.normalizeUrl(site)));
  }

  // Activate website blocking
  activate() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.startBlocking();
    toast.info("Website blocking activated");
  }

  // Deactivate website blocking
  deactivate() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.stopBlocking();
    toast.info("Website blocking deactivated");
  }

  // Add a website to the blocklist
  addWebsite(website: string) {
    const normalizedUrl = this.normalizeUrl(website);
    this.blockedWebsites.add(normalizedUrl);
    if (this.isActive) {
      this.startBlocking();
    }
  }

  // Remove a website from the blocklist
  removeWebsite(website: string) {
    const normalizedUrl = this.normalizeUrl(website);
    this.blockedWebsites.delete(normalizedUrl);
    if (this.isActive) {
      this.startBlocking();
    }
  }

  // Get all blocked websites
  getBlockedWebsites(): string[] {
    return Array.from(this.blockedWebsites);
  }

  // Check if a website is blocked
  isWebsiteBlocked(url: string): boolean {
    if (!this.isActive) return false;
    
    const normalizedUrl = this.normalizeUrl(url);
    return Array.from(this.blockedWebsites).some(blockedSite => 
      normalizedUrl.includes(blockedSite)
    );
  }

  // Start blocking websites
  private startBlocking() {
    // Create a content script to block websites
    const script = document.createElement('script');
    script.textContent = `
      (function() {
        const blockedSites = ${JSON.stringify(Array.from(this.blockedWebsites))};
        
        function checkUrl() {
          const currentUrl = window.location.hostname;
          if (blockedSites.some(site => currentUrl.includes(site))) {
            document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">' +
              '<h1 style="color: #e74c3c;">Website Blocked</h1>' +
              '<p>This website is blocked during your focus session.</p>' +
              '<p>Stay focused and come back during your break!</p>' +
              '</div>';
          }
        }
        
        // Check immediately
        checkUrl();
        
        // Set up mutation observer to catch dynamic changes
        const observer = new MutationObserver(checkUrl);
        observer.observe(document.body, { childList: true, subtree: true });
      })();
    `;
    document.head.appendChild(script);
  }

  // Stop blocking websites
  private stopBlocking() {
    // Remove any blocking scripts
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (script.textContent?.includes('Website Blocked')) {
        script.remove();
      }
    });
  }

  // Normalize URL for consistent comparison
  private normalizeUrl(url: string): string {
    return url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

export default WebsiteBlockerService; 