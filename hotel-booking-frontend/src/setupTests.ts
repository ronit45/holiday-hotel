import '@testing-library/jest-dom';

// Create a root element so modules importing main.tsx don't crash
const root = document.createElement("div");
root.setAttribute("id", "root");
document.body.appendChild(root);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});
