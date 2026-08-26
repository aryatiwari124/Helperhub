// ============================================================
// FILE: promises-vs-callbacks.js
// TOPIC: JavaScript — Promises vs Callbacks
// ============================================================
// Both Promises and Callbacks are mechanisms to handle
// ASYNCHRONOUS operations in JavaScript.
// This file shows WHY callbacks were used first, their
// limitations (callback hell), and how Promises solve them.
// ============================================================

// -----------------------------------------------------------
// HELPER: Simulate an async task (like a network request)
// Returns a result after a delay — used in all demos below
// -----------------------------------------------------------
function simulateAsync(value, delayMs, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(`❌ Async task failed for: ${value}`));
      } else {
        resolve(value);
      }
    }, delayMs);
  });
}

// ============================================================
// SECTION A: CALLBACKS
// ============================================================

// -----------------------------------------------------------
// A1. Basic Callback Pattern
//     A function is passed as an argument and called when
//     the async operation completes.
// -----------------------------------------------------------
export function basicCallbackDemo(onComplete) {
  const log = [];
  log.push("▶ basicCallbackDemo started");

  function fetchUser(userId, callback) {
    log.push(`  Fetching user #${userId}...`);
    setTimeout(() => {
      const user = { id: userId, name: "Arya Tiwari" };
      log.push(`  ✅ User fetched: ${JSON.stringify(user)}`);
      callback(null, user); // Node.js convention: (error, result)
    }, 800);
  }

  fetchUser(1, (err, user) => {
    if (err) {
      log.push(`  ❌ Error: ${err.message}`);
    } else {
      log.push(`  Callback received user: ${user.name}`);
    }
    onComplete(log);
  });
}

// -----------------------------------------------------------
// A2. Error-First Callback Pattern (Node.js convention)
//     First argument is always error; second is the result.
// -----------------------------------------------------------
export function errorFirstCallbackDemo(onComplete) {
  const log = [];

  function readFile(filename, callback) {
    setTimeout(() => {
      if (filename === "missing.txt") {
        callback(new Error(`File not found: ${filename}`), null);
      } else {
        callback(null, `Contents of ${filename}: "Hello World"`);
      }
    }, 600);
  }

  log.push("▶ Reading a valid file:");
  readFile("data.txt", (err, content) => {
    if (err) {
      log.push(`  ❌ ${err.message}`);
    } else {
      log.push(`  ✅ ${content}`);
    }

    log.push("▶ Reading a missing file:");
    readFile("missing.txt", (err2, content2) => {
      if (err2) {
        log.push(`  ❌ ${err2.message}`);
      } else {
        log.push(`  ✅ ${content2}`);
      }
      onComplete(log);
    });
  });
}

// -----------------------------------------------------------
// A3. CALLBACK HELL (Pyramid of Doom)
//     Multiple nested async operations become deeply indented
//     and extremely hard to read, debug, or maintain.
// -----------------------------------------------------------
export function callbackHellDemo(onComplete) {
  const log = [];
  log.push("▶ Callback Hell: Login → Get Profile → Get Posts → Get Comments");

  function login(user, cb) {
    setTimeout(() => {
      log.push(`  ✅ Logged in as ${user}`);
      cb(null, { token: "abc123" });
    }, 400);
  }

  function getProfile(token, cb) {
    setTimeout(() => {
      log.push(`  ✅ Got profile with token ${token}`);
      cb(null, { profileId: 99 });
    }, 400);
  }

  function getPosts(profileId, cb) {
    setTimeout(() => {
      log.push(`  ✅ Got posts for profile ${profileId}`);
      cb(null, [{ postId: 1 }, { postId: 2 }]);
    }, 400);
  }

  function getComments(postId, cb) {
    setTimeout(() => {
      log.push(`  ✅ Got comments for post ${postId}`);
      cb(null, ["Nice!", "Great post!"]);
    }, 400);
  }

  // 👇 This is "Callback Hell" — deeply nested, hard to follow
  login("arya@example.com", (err1, auth) => {
    if (err1) return log.push(`❌ Login failed`);
    getProfile(auth.token, (err2, profile) => {
      if (err2) return log.push(`❌ Profile failed`);
      getPosts(profile.profileId, (err3, posts) => {
        if (err3) return log.push(`❌ Posts failed`);
        getComments(posts[0].postId, (err4, comments) => {
          if (err4) return log.push(`❌ Comments failed`);
          log.push(`  💬 Comments: ${comments.join(", ")}`);
          log.push("⚠️  4 levels deep — this is Callback Hell!");
          onComplete(log);
        });
      });
    });
  });
}

// ============================================================
// SECTION B: PROMISES
// ============================================================

// -----------------------------------------------------------
// B1. Basic Promise — Creating & Consuming
//     A Promise is an object representing eventual completion
//     (or failure) of an async operation.
//     States: pending → fulfilled | rejected
// -----------------------------------------------------------
export function basicPromiseDemo() {
  const log = [];
  log.push("▶ Promise States: pending → fulfilled | rejected");

  // Creating a Promise
  const myPromise = new Promise((resolve, reject) => {
    log.push("  Promise is PENDING...");
    setTimeout(() => {
      const success = true;
      if (success) {
        resolve("✅ Promise FULFILLED with data!");
      } else {
        reject(new Error("❌ Promise REJECTED"));
      }
    }, 500);
  });

  // Consuming a Promise
  return myPromise
    .then((result) => {
      log.push(`  .then() received: ${result}`);
      return log;
    })
    .catch((err) => {
      log.push(`  .catch() received: ${err.message}`);
      return log;
    });
}

// -----------------------------------------------------------
// B2. Promise Chaining
//     Solves callback hell — flat, readable, sequential async
// -----------------------------------------------------------
export function promiseChainingDemo() {
  const log = [];
  log.push("▶ Promise Chaining: Login → Get Profile → Get Posts → Get Comments");

  function loginP(user) {
    return simulateAsync({ token: "abc123" }, 300).then((auth) => {
      log.push(`  ✅ Logged in as ${user}`);
      return auth;
    });
  }

  function getProfileP(auth) {
    return simulateAsync({ profileId: 99 }, 300).then((profile) => {
      log.push(`  ✅ Got profile with token ${auth.token}`);
      return profile;
    });
  }

  function getPostsP(profile) {
    return simulateAsync([{ postId: 1 }, { postId: 2 }], 300).then((posts) => {
      log.push(`  ✅ Got posts for profile ${profile.profileId}`);
      return posts;
    });
  }

  function getCommentsP(posts) {
    return simulateAsync(["Nice!", "Great post!"], 300).then((comments) => {
      log.push(`  ✅ Got comments for post ${posts[0].postId}`);
      log.push(`  💬 Comments: ${comments.join(", ")}`);
      return comments;
    });
  }

  // 👇 Flat chaining — much cleaner than callback hell!
  return loginP("arya@example.com")
    .then(getProfileP)
    .then(getPostsP)
    .then(getCommentsP)
    .then(() => {
      log.push("✅ Done! Promise chaining is flat and readable.");
      return log;
    })
    .catch((err) => {
      log.push(`❌ Error caught: ${err.message}`);
      return log;
    });
}

// -----------------------------------------------------------
// B3. Promise Error Handling
//     A single .catch() handles errors from any step in the chain
// -----------------------------------------------------------
export function promiseErrorHandlingDemo() {
  const log = [];
  log.push("▶ Promise Error Handling with .catch()");

  return simulateAsync("Step 1 OK", 200)
    .then((result) => {
      log.push(`  ✅ ${result}`);
      return simulateAsync("Step 2 OK", 200);
    })
    .then((result) => {
      log.push(`  ✅ ${result}`);
      return simulateAsync("Step 3", 200, true); // ← This will FAIL
    })
    .then((result) => {
      log.push(`  ✅ ${result}`); // ← Skipped because step 3 failed
    })
    .catch((err) => {
      log.push(`  ❌ Caught by .catch(): ${err.message}`);
      log.push("  ✅ Single .catch() handles errors from any step!");
      return log;
    })
    .finally(() => {
      log.push("  🔚 .finally() always runs (cleanup, loading spinners, etc.)");
      return log;
    });
}

// -----------------------------------------------------------
// B4. Promise.all — Run multiple Promises in PARALLEL
//     Resolves when ALL promises resolve, or rejects on first failure
// -----------------------------------------------------------
export function promiseAllDemo() {
  const log = [];
  log.push("▶ Promise.all — Running 3 tasks in PARALLEL");

  const task1 = simulateAsync("Task 1 done", 300).then((r) => {
    log.push(`  ⚡ ${r}`);
    return r;
  });
  const task2 = simulateAsync("Task 2 done", 500).then((r) => {
    log.push(`  ⚡ ${r}`);
    return r;
  });
  const task3 = simulateAsync("Task 3 done", 200).then((r) => {
    log.push(`  ⚡ ${r}`);
    return r;
  });

  return Promise.all([task1, task2, task3])
    .then((results) => {
      log.push(`  ✅ All done! Results: [${results.join(", ")}]`);
      log.push("  ⏱️  Total time ≈ max(300, 500, 200) = 500ms (parallel!)");
      return log;
    })
    .catch((err) => {
      log.push(`  ❌ One task failed: ${err.message}`);
      return log;
    });
}

// -----------------------------------------------------------
// B5. Promise.allSettled — Waits for ALL, regardless of outcome
// -----------------------------------------------------------
export function promiseAllSettledDemo() {
  const log = [];
  log.push("▶ Promise.allSettled — All results (success + failure)");

  const p1 = simulateAsync("Success A", 200);
  const p2 = simulateAsync("Fail B", 300, true); // will reject
  const p3 = simulateAsync("Success C", 100);

  return Promise.allSettled([p1, p2, p3]).then((results) => {
    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        log.push(`  ✅ Promise ${i + 1}: fulfilled → ${result.value}`);
      } else {
        log.push(`  ❌ Promise ${i + 1}: rejected  → ${result.reason.message}`);
      }
    });
    return log;
  });
}

// -----------------------------------------------------------
// B6. Promise.race — First settled Promise wins
// -----------------------------------------------------------
export function promiseRaceDemo() {
  const log = [];
  log.push("▶ Promise.race — First to settle wins");

  const slow = simulateAsync("Slow (800ms)", 800).then((r) => {
    log.push(`  ⏳ ${r}`);
    return r;
  });
  const fast = simulateAsync("Fast (200ms)", 200).then((r) => {
    log.push(`  ⚡ ${r}`);
    return r;
  });
  const medium = simulateAsync("Medium (500ms)", 500).then((r) => {
    log.push(`  🕐 ${r}`);
    return r;
  });

  return Promise.race([slow, fast, medium])
    .then((winner) => {
      log.push(`  🏆 Winner: "${winner}" (settled first!)`);
      return log;
    });
}

// -----------------------------------------------------------
// B7. Async / Await — Syntactic sugar over Promises
//     Makes async code look and behave like synchronous code
// -----------------------------------------------------------
export async function asyncAwaitDemo() {
  const log = [];
  log.push("▶ async/await — Same Promise chain, cleaner syntax");

  try {
    log.push("  Fetching user...");
    const user = await simulateAsync({ id: 1, name: "Arya Tiwari" }, 300);
    log.push(`  ✅ User: ${JSON.stringify(user)}`);

    log.push("  Fetching orders for user...");
    const orders = await simulateAsync(["Order #1", "Order #2"], 300);
    log.push(`  ✅ Orders: ${orders.join(", ")}`);

    log.push("  Fetching shipping for first order...");
    const shipping = await simulateAsync({ status: "Delivered" }, 300);
    log.push(`  ✅ Shipping: ${JSON.stringify(shipping)}`);

    log.push("✅ async/await makes Promise chains look synchronous!");
  } catch (err) {
    log.push(`  ❌ try/catch caught: ${err.message}`);
  } finally {
    log.push("  🔚 finally block always executes");
  }

  return log;
}

// ============================================================
// SECTION C: COMPARISON TABLE  (for UI rendering)
// ============================================================
export const comparisonTable = [
  {
    feature: "Syntax",
    callbacks: "Nested function arguments",
    promises: ".then() / .catch() chain",
    asyncAwait: "await keyword in async fn",
  },
  {
    feature: "Readability",
    callbacks: "❌ Deeply nested (callback hell)",
    promises: "✅ Flat chain",
    asyncAwait: "✅✅ Looks synchronous",
  },
  {
    feature: "Error Handling",
    callbacks: "❌ Error in every callback",
    promises: "✅ Single .catch()",
    asyncAwait: "✅ try / catch / finally",
  },
  {
    feature: "Parallel execution",
    callbacks: "⚠️ Manual tracking required",
    promises: "✅ Promise.all / Promise.race",
    asyncAwait: "✅ await Promise.all()",
  },
  {
    feature: "Chaining",
    callbacks: "❌ Pyramid of doom",
    promises: "✅ .then() chaining",
    asyncAwait: "✅ Sequential awaits",
  },
  {
    feature: "Debugging",
    callbacks: "❌ Stack traces unclear",
    promises: "✅ Better stack traces",
    asyncAwait: "✅✅ Clearest stack traces",
  },
  {
    feature: "Browser support",
    callbacks: "✅ Universal",
    promises: "✅ ES6+ (2015)",
    asyncAwait: "✅ ES8+ (2017)",
  },
];
