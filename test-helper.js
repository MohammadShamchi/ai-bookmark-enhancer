// AI Bookmark Enhancer - Testing Helper Script
// Run this in Chrome console to create test bookmarks and verify functionality

console.log('🧪 AI Bookmark Enhancer Testing Helper Loaded');

// Test bookmark sets
const testBookmarks = {
  small: [
    { title: 'GitHub', url: 'https://github.com' },
    { title: 'Stack Overflow', url: 'https://stackoverflow.com' },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
    { title: 'YouTube', url: 'https://youtube.com' },
    { title: 'Netflix', url: 'https://netflix.com' },
    { title: 'Amazon', url: 'https://amazon.com' },
    { title: 'Reddit', url: 'https://reddit.com' },
    { title: 'Twitter', url: 'https://twitter.com' },
    { title: 'LinkedIn', url: 'https://linkedin.com' },
    { title: 'TechCrunch', url: 'https://techcrunch.com' },
    { title: 'BBC News', url: 'https://bbc.com/news' },
    { title: 'ESPN', url: 'https://espn.com' },
    { title: 'Spotify', url: 'https://spotify.com' },
    { title: 'ChatGPT', url: 'https://chat.openai.com' },
    { title: 'Vercel', url: 'https://vercel.com' },
  ],

  medium: [
    // Development & Programming
    { title: 'GitHub', url: 'https://github.com' },
    { title: 'Stack Overflow', url: 'https://stackoverflow.com' },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
    { title: 'W3Schools', url: 'https://www.w3schools.com' },
    { title: 'CodePen', url: 'https://codepen.io' },
    { title: 'JSFiddle', url: 'https://jsfiddle.net' },
    { title: 'Replit', url: 'https://replit.com' },
    { title: 'GitLab', url: 'https://gitlab.com' },
    { title: 'Bitbucket', url: 'https://bitbucket.org' },
    { title: 'Docker Hub', url: 'https://hub.docker.com' },

    // News & Information
    { title: 'TechCrunch', url: 'https://techcrunch.com' },
    { title: 'BBC News', url: 'https://bbc.com/news' },
    { title: 'CNN', url: 'https://cnn.com' },
    { title: 'Reuters', url: 'https://reuters.com' },
    { title: 'The Verge', url: 'https://theverge.com' },
    { title: 'Ars Technica', url: 'https://arstechnica.com' },
    { title: 'Hacker News', url: 'https://news.ycombinator.com' },
    { title: 'Product Hunt', url: 'https://producthunt.com' },

    // Social Media
    { title: 'Twitter', url: 'https://twitter.com' },
    { title: 'LinkedIn', url: 'https://linkedin.com' },
    { title: 'Reddit', url: 'https://reddit.com' },
    { title: 'Facebook', url: 'https://facebook.com' },
    { title: 'Instagram', url: 'https://instagram.com' },
    { title: 'TikTok', url: 'https://tiktok.com' },

    // E-commerce
    { title: 'Amazon', url: 'https://amazon.com' },
    { title: 'eBay', url: 'https://ebay.com' },
    { title: 'Etsy', url: 'https://etsy.com' },
    { title: 'Shopify', url: 'https://shopify.com' },
    { title: 'WooCommerce', url: 'https://woocommerce.com' },

    // Entertainment
    { title: 'YouTube', url: 'https://youtube.com' },
    { title: 'Netflix', url: 'https://netflix.com' },
    { title: 'Spotify', url: 'https://spotify.com' },
    { title: 'Twitch', url: 'https://twitch.tv' },
    { title: 'Disney+', url: 'https://disneyplus.com' },
    { title: 'Hulu', url: 'https://hulu.com' },

    // Productivity
    { title: 'Google Drive', url: 'https://drive.google.com' },
    { title: 'Notion', url: 'https://notion.so' },
    { title: 'Trello', url: 'https://trello.com' },
    { title: 'Slack', url: 'https://slack.com' },
    { title: 'Zoom', url: 'https://zoom.us' },
    { title: 'Microsoft Teams', url: 'https://teams.microsoft.com' },

    // Learning
    { title: 'Coursera', url: 'https://coursera.org' },
    { title: 'Udemy', url: 'https://udemy.com' },
    { title: 'Khan Academy', url: 'https://khanacademy.org' },
    { title: 'edX', url: 'https://edx.org' },

    // AI & Tools
    { title: 'ChatGPT', url: 'https://chat.openai.com' },
    { title: 'Claude', url: 'https://claude.ai' },
    { title: 'Midjourney', url: 'https://midjourney.com' },
    { title: 'Figma', url: 'https://figma.com' },
    { title: 'Canva', url: 'https://canva.com' },
  ],

  edgeCases: [
    { title: '', url: 'https://example.com' }, // Empty title
    { title: 'Very Long Title '.repeat(20), url: 'https://long.com' }, // Long title
    { title: 'Localhost', url: 'http://localhost:3000' }, // Localhost
    { title: 'IP Address', url: 'http://192.168.1.1' }, // IP
    { title: 'Special Chars !@#$%', url: 'https://special.com' }, // Special chars
    { title: 'Emoji 😀🎉', url: 'https://emoji.com' }, // Emoji
    { title: 'Chinese 中文', url: 'https://chinese.com' }, // Non-Latin
    { title: 'Data URL', url: 'data:text/plain,test' }, // Data URL
    { title: 'FTP', url: 'ftp://example.com' }, // FTP
    { title: 'File', url: 'file:///path/to/file' }, // File protocol
    { title: 'Mailto', url: 'mailto:test@example.com' }, // Mailto
    { title: 'Tel', url: 'tel:+1234567890' }, // Tel
    { title: 'JavaScript', url: "javascript:alert('test')" }, // JavaScript
    { title: 'HTTPS', url: 'https://secure.example.com' }, // HTTPS
    { title: 'HTTP', url: 'http://insecure.example.com' }, // HTTP
  ],
};

// Helper functions
window.testHelpers = {
  // Create test bookmarks
  createTestBookmarks: async function (set = 'small') {
    console.log(`📚 Creating ${set} test bookmark set...`);
    const bookmarks = testBookmarks[set];
    if (!bookmarks) {
      console.error(
        '❌ Invalid bookmark set. Use: small, medium, or edgeCases'
      );
      return;
    }

    const created = [];
    for (const bm of bookmarks) {
      try {
        const result = await chrome.bookmarks.create({
          parentId: '1', // Bookmarks bar
          title: bm.title,
          url: bm.url,
        });
        created.push(result);
        console.log(`✅ Created: ${bm.title}`);
      } catch (error) {
        console.error(`❌ Failed to create ${bm.title}:`, error);
      }
    }

    console.log(`📊 Created ${created.length}/${bookmarks.length} bookmarks`);
    return created;
  },

  // Clear all test bookmarks
  clearTestBookmarks: async function () {
    console.log('🧹 Clearing test bookmarks...');
    try {
      const bookmarks = await chrome.bookmarks.getTree();
      const bookmarkBar = bookmarks[0].children[0];

      // Remove all bookmarks from bookmark bar
      for (const child of bookmarkBar.children) {
        if (child.url) {
          // It's a bookmark, not a folder
          await chrome.bookmarks.remove(child.id);
          console.log(`🗑️ Removed: ${child.title}`);
        }
      }

      console.log('✅ Test bookmarks cleared');
    } catch (error) {
      console.error('❌ Error clearing bookmarks:', error);
    }
  },

  // Check extension state
  checkExtensionState: async function () {
    console.log('🔍 Checking extension state...');

    try {
      // Check if API key is set
      const result = await chrome.storage.sync.get(['openaiApiKey']);
      console.log('🔑 API Key:', result.openaiApiKey ? 'Set' : 'Not set');

      // Check selected model
      const modelResult = await chrome.storage.sync.get(['selectedModel']);
      console.log('🤖 Selected Model:', modelResult.selectedModel || 'Default');

      // Check job state
      const jobResult = await chrome.storage.local.get([
        'bookmarkOrganizationJob',
      ]);
      console.log(
        '⚙️ Job State:',
        jobResult.bookmarkOrganizationJob ? 'Active' : 'None'
      );
    } catch (error) {
      console.error('❌ Error checking extension state:', error);
    }
  },

  // Test API key validation
  testApiKeyValidation: function () {
    console.log('🧪 Testing API key validation...');

    const testCases = [
      { key: '', expected: 'too short' },
      { key: 'sk-short', expected: 'too short' },
      { key: 'pk-wrongprefix12345678901234567890', expected: 'wrong prefix' },
      { key: 'sk-test123456789012345678901234567890', expected: 'valid' },
    ];

    testCases.forEach((testCase, index) => {
      console.log(
        `Test ${index + 1}: "${testCase.key}" → Expected: ${testCase.expected}`
      );
    });
  },

  // Performance test
  performanceTest: function () {
    console.log('⚡ Starting performance test...');

    const startTime = performance.now();

    // Test popup open time
    setTimeout(() => {
      const popupTime = performance.now() - startTime;
      console.log(`📊 Popup open time: ${popupTime.toFixed(2)}ms`);
    }, 100);

    // Test memory usage (approximate)
    if (performance.memory) {
      console.log(
        `💾 Memory usage: ${(
          performance.memory.usedJSHeapSize /
          1024 /
          1024
        ).toFixed(2)}MB`
      );
    }
  },

  // Accessibility test helpers
  accessibilityTest: function () {
    console.log('♿ Running accessibility tests...');

    // Check for focus indicators
    const focusableElements = document.querySelectorAll(
      'button, input, [tabindex]'
    );
    console.log(`🎯 Found ${focusableElements.length} focusable elements`);

    // Check for ARIA labels
    const ariaElements = document.querySelectorAll(
      '[aria-label], [aria-labelledby]'
    );
    console.log(`🏷️ Found ${ariaElements.length} elements with ARIA labels`);

    // Check color contrast (basic)
    const textElements = document.querySelectorAll(
      'p, span, h1, h2, h3, h4, h5, h6'
    );
    console.log(`📝 Found ${textElements.length} text elements`);
  },

  // Console error checker
  checkConsoleErrors: function () {
    console.log('🔍 Checking for console errors...');

    // Override console.error to track errors
    const originalError = console.error;
    const errors = [];

    console.error = function (...args) {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };

    setTimeout(() => {
      console.error = originalError;
      console.log(`📊 Found ${errors.length} console errors:`, errors);
    }, 5000);
  },
};

// Auto-run basic checks
console.log('🚀 Running initial checks...');
window.testHelpers.checkExtensionState();
window.testHelpers.checkConsoleErrors();

console.log(`
🧪 Testing Helper Commands Available:

📚 Create test bookmarks:
  testHelpers.createTestBookmarks('small')    // 15 bookmarks
  testHelpers.createTestBookmarks('medium')   // 50+ bookmarks
  testHelpers.createTestBookmarks('edgeCases') // Edge cases

🧹 Clear test bookmarks:
  testHelpers.clearTestBookmarks()

🔍 Check extension state:
  testHelpers.checkExtensionState()

🧪 Test API validation:
  testHelpers.testApiKeyValidation()

⚡ Performance test:
  testHelpers.performanceTest()

♿ Accessibility test:
  testHelpers.accessibilityTest()

📊 Check console errors:
  testHelpers.checkConsoleErrors()
`);

console.log('✅ Testing Helper Ready!');
