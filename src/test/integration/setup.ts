import { beforeAll, afterAll } from 'vitest';

// Set up test environment
beforeAll(() => {
  // Mock browser environment
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768,
  });
});

afterAll(() => {
  // Cleanup if needed
});