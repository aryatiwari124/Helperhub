# JavaScript: Hoisting

Declarations are processed before execution, but their behavior differs.

- Function declarations can be called before their source line.
- `var` is hoisted and initialized as `undefined`.
- `let`, `const`, and `class` are hoisted but remain in the temporal dead zone until initialized.

Prefer `const` and `let`, declare values before use, and avoid relying on hoisting. This makes asynchronous control flow and route registration easier to read and review.
