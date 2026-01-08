// jest.setup.js
// Jest setup file
// Add custom matchers or global test setup here

// Suppress console logs in tests unless in verbose mode
if (!process.env.VERBOSE) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // Keep error to see actual errors
    error: console.error,
  }
}
