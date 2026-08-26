# JavaScript: Event Loop

JavaScript runs synchronous code on a call stack. Promise callbacks run in the microtask queue, while timers and I/O callbacks run in later task phases.

```js
console.log('A');
setTimeout(() => console.log('timer'), 0);
Promise.resolve().then(() => console.log('microtask'));
console.log('B');
// A, B, microtask, timer
```

This is why an `await` yields control and why CPU-heavy parsing or loops can still block an Express process. Use bounded work, streaming, worker threads, or a queue for expensive CPU operations.
