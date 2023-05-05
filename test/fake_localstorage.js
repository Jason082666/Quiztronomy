const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key],
    setItem: (key, value) => (store[key] = value.toString()),
    clear: () => (store = {}),
    removeItem: (key) => delete store[key],
  };
})();

export default function setupLocalStorage() {
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
  });
}

localStorage.setItem("testId","123456")
localStorage.setItem("testName", "Jason");