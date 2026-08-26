# JavaScript: Promises vs Callbacks

Callbacks pass a function to be invoked later. Nested callbacks can make sequencing and error propagation difficult.

```js
readFile(path, (error, data) => {
  if (error) return done(error);
  parse(data, (parseError, value) => done(parseError, value));
});
```

Promises represent a future result and compose through `.then()` or `async/await`:

```js
const value = await parse(await readFile(path));
```

Use one error boundary. HelperHub wraps promise-returning Express controllers with `asyncHandler` so rejected operations reach the centralized error middleware.
