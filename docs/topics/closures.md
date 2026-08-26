# JavaScript: Closures

A closure is a function plus the lexical variables it can still access after the outer function returns.

```js
function createCounter() {
  let count = 0;
  return () => ++count;
}
const next = createCounter();
next(); // 1
```

Closures are useful for private state and middleware factories. HelperHub's `createRateLimit({ windowMs, max })` closes over its configuration while returning a request handler. Be careful with long-lived closures: captured objects remain reachable and cannot be collected until the closure is released.
