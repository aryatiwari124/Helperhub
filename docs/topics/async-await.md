# JavaScript: async/await

`async` functions return promises. `await` pauses that function until a promise settles, while the event loop remains available for other work.

```js
async function loadEstimate(api) {
  const response = await api.post('/estimate', input);
  return response.data.estimate;
}
```

Use `try/catch` at the boundary that can translate an error into an HTTP response or user message. `asyncHandler.js` applies this consistently to Express routes. Run independent requests with `Promise.all` rather than awaiting them serially when they do not depend on each other.
