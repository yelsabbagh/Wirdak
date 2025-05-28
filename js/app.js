/**
 * Wirdak - Islamic Dhikr Habit Tracking App
 * app.js - Main application logic and initialization
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize managers
  const storage = new StorageManager();
  const adhkarData = new AdhkarDataManager();
  const notifications = new NotificationManager(storage);
  const backupManager = new DataBackupManager(storage);
  const shareManager = new SocialShareManager();
  
  // UI Elements (placeholders, will be selected later)
  let currentView = null;
  let language = "en";
  let theme = "light";
  
  /**
   * Initialize the application
   */
  async function initializeApp() {
    console.log("Initializing Wirdak App...");
    
    // Initialize storage first
    await storage.initialize();
    
    // Load preferences
    const prefs = await storage.getPreferences();
    language = prefs.language || "en";
    theme = prefs.theme || "light";
    applyTheme(theme);
    applyLanguage(language);
    
    // Initialize Adhkar data
    const dataLoaded = await adhkarData.initialize();
    if (!dataLoaded) {
      showError("Failed to load essential Adhkar data. Please check your connection and try again.");
      return;
    }
    
    // Initialize notifications
    await notifications.initialize();
    
    // Register service worker
    registerServiceWorker();
    
    // Setup UI and event listeners
    setupUI();
    setupEventListeners();
    
    // Navigate to the initial view (e.g., dashboard)
    navigateTo("dashboard");
    
    console.log("Wirdak App Initialized.");
  }
  
  /**
   * Register the PWA service worker
   */
  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js")
        .then(registration => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch(error => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }
  
  /**
   * Setup the main UI elements
   */
  function setupUI() {
    // This function will select DOM elements and set up initial states
    // Example: document.getElementById("loading-spinner").style.display = "none";
    // Example: renderDashboard();
    console.log("Setting up UI...");
    // Placeholder for actual UI setup
  }
  
  /**
   * Setup global event listeners
   */
  function setupEventListeners() {
    // Navigation links
    document.querySelectorAll("[data-navigate]").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetView = e.target.getAttribute("data-navigate");
        navigateTo(targetView);
      });
    });
    
    // Theme toggle
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }
    
    // Language toggle
    const langToggle = document.getElementById("language-toggle");
    if (langToggle) {
      langToggle.addEventListener("click", toggleLanguage);
    }
    
    // Export button
    const exportButton = document.getElementById("export-data-button");
    if (exportButton) {
      exportButton.addEventListener("click", handleExportData);
    }
    
    // Import button/input
    const importInput = document.getElementById("import-data-input");
    if (importInput) {
      importInput.addEventListener("change", handleImportData);
    }
    
    // Share buttons
    document.querySelectorAll("[data-share]").forEach(button => {
      button.addEventListener("click", handleShare);
    });
    
    // Listen for custom events
    document.addEventListener("wirdak-import-success", (e) => {
      showSuccess(e.detail.message);
      setTimeout(() => window.location.reload(), 2000);
    });
    
    document.addEventListener("wirdak-import-error", (e) => {
      showError(e.detail.message);
    });
    
    console.log("Setting up Event Listeners...");
    // Placeholder for actual event listener setup
  }
  
  /**
   * Navigate to a specific view/page
   */
  function navigateTo(viewId) {
    console.log(`Navigating to: ${viewId}`);
    // Hide current view
    if (currentView) {
      document.getElementById(currentView).classList.add("hidden");
    }
    
    // Show new view
    const nextView = document.getElementById(viewId);
    if (nextView) {
      nextView.classList.remove("hidden");
      currentView = viewId;
      // Update active state in navigation if applicable
      updateNavActiveState(viewId);
      // Load content for the view
      loadViewContent(viewId);
    } else {
      console.error(`View with ID ${viewId} not found.`);
      // Optionally navigate to a default view like dashboard
      if (viewId !== "dashboard") navigateTo("dashboard");
    }
  }
  
  /**
   * Update active state in navigation menu
   */
  function updateNavActiveState(activeViewId) {
    document.querySelectorAll(".nav-link").forEach(link => {
      if (link.getAttribute("data-navigate") === activeViewId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
  
  /**
   * Load dynamic content for a specific view
   */
  function loadViewContent(viewId) {
    switch (viewId) {
      case "dashboard":
        renderDashboard();
        break;
      case "dhikr-list":
        renderDhikrList();
        break;
      case "quran-tracker":
        renderQuranTracker();
        break;
      case "progress":
        renderProgress();
        break;
      case "settings":
        renderSettings();
        break;
      // Add other views as needed
    }
  }
  
  // --- View Rendering Functions (Placeholders) ---
  function renderDashboard() {
    console.log("Rendering Dashboard...");
    // Fetch data (streaks, highlighted dhikr) and update DOM
  }
  
  function renderDhikrList() {
    console.log("Rendering Dhikr List...");
    // Fetch all dhikr, categories, custom dhikr and update DOM
    // Initialize search functionality
  }
  
  function renderQuranTracker() {
    console.log("Rendering Quran Tracker...");
    // Initialize Quran tracking UI
  }
  
  function renderProgress() {
    console.log("Rendering Progress...");
    // Fetch progress data, achievements and update DOM
  }
  
  function renderSettings() {
    console.log("Rendering Settings...");
    // Load current settings into the form fields
  }
  
  // --- Event Handlers ---
  async function handleExportData() {
    const result = await backupManager.exportUserData();
    if (result.success) {
      showSuccess("Data exported successfully!");
    } else {
      showError(result.message);
    }
  }
  
  async function handleImportData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const result = await backupManager.importUserData(file);
      // Success message handled by custom event listener
    } catch (error) {
      showError(error.message);
    }
    // Reset file input
    event.target.value = null;
  }
  
  function handleShare(event) {
    const platform = event.target.closest("[data-share]").getAttribute("data-share");
    switch (platform) {
      case "whatsapp":
        shareManager.shareToWhatsApp(language);
        break;
      case "telegram":
        shareManager.shareToTelegram(language);
        break;
      case "twitter":
        shareManager.shareToTwitter(language);
        break;
      case "facebook":
        shareManager.shareToFacebook();
        break;
    }
  }
  
  // --- Theme and Language ---
  function applyTheme(newTheme) {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${newTheme}-theme`);
    theme = newTheme;
    // Update theme toggle button state if exists
  }
  
  async function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    applyTheme(newTheme);
    const prefs = await storage.getPreferences();
    prefs.theme = newTheme;
    await storage.savePreferences(prefs);
  }
  
  function applyLanguage(newLang) {
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    language = newLang;
    // Update UI text using translation files (implementation needed)
    // Update language toggle button state if exists
  }
  
  async function toggleLanguage() {
    const newLang = language === "en" ? "ar" : "en";
    applyLanguage(newLang);
    const prefs = await storage.getPreferences();
    prefs.language = newLang;
    await storage.savePreferences(prefs);
    // Reload or re-render UI elements with new language
    // For simplicity, might just reload the page or re-render current view
    loadViewContent(currentView); 
  }
  
  // --- Utility Functions ---
  function showMessage(message, type = "info") {
    // Placeholder for a more sophisticated toast/notification system
    console.log(`[${type.toUpperCase()}] ${message}`);
    const messageArea = document.getElementById("message-area");
    if (messageArea) {
      const msgDiv = document.createElement("div");
      msgDiv.className = `alert alert-${type}`;
      msgDiv.textContent = message;
      messageArea.appendChild(msgDiv);
      setTimeout(() => msgDiv.remove(), 5000);
    }
  }
  
  function showSuccess(message) {
    showMessage(message, "success");
  }
  
  function showError(message) {
    showMessage(message, "error");
  }
  
  // Start the application
  initializeApp();
});
