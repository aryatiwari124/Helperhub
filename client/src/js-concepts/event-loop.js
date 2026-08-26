// ============================================================
// FILE: event-loop.js
// TOPIC: JavaScript — The Event Loop
// ============================================================
// JavaScript is SINGLE-THREADED — it can only do one thing at
// a time. The Event Loop is the mechanism that allows JS to
// perform non-blocking async operations despite this constraint.
//
// KEY COMPONENTS:
//  1. Call Stack       — Where synchronous code executes (LIFO)
//  2. Web APIs         — Browser-provided async capabilities
//                        (setTimeout, fetch, DOM events, etc.)
//  3. Task Queue       — Holds callbacks from Web APIs (Macrotasks)
//  4. Microtask Queue  — Holds Promise callbacks & queueMicrotask()
//  5. Event Loop       — Continuously checks: if stack is empty,
//                        drain microtask queue, then take ONE macrotask
// ============================================================

// -----------------------------------------------------------
// 1. CALL STACK — Synchronous Execution (LIFO)
//    Functions are pushed when called, popped when returned.
// -----------------------------------------------------------
export function callStackDemo() {
  const log = [];

  function third() {
    log.push("  3️⃣  third()  ← pushed onto stack, executes, then popped");
    return "result from third";
  }

  function second() {
    log.push("  2️⃣  second() ← pushed, calls third()");
    const result = third();
    log.push(`  2️⃣  second() ← third() returned: "${result}", now second() pops`);
    return "result from second";
  }

  function first() {
    log.push("  1️⃣  first()  ← pushed, calls second()");
    const result = second();
    log.push(`  1️⃣  first()  ← second() returned: "${result}", now first() pops`);
  }

  log.push("▶ Call Stack Demo (synchronous, LIFO order):");
  log.push("  [Stack grows ↓ as functions are called, shrinks ↑ as they return]");
  first();
  log.push("  ✅ All done — stack is empty again.");

  return log;
}

// -----------------------------------------------------------
// 2. EXECUTION ORDER: Sync → Microtasks → Macrotasks
//
//    Rule:
//      • Synchronous code runs FIRST (call stack)
//      • ALL microtasks run NEXT (before any macrotask)
//        – Promise .then/.catch/.finally callbacks
//        – queueMicrotask()
//        – MutationObserver callbacks
//      • ONE macrotask runs NEXT (setTimeout, setInterval, etc.)
//      • Then microtasks again, then next macrotask, and so on
// -----------------------------------------------------------
export function executionOrderDemo() {
  const log = [];

  log.push("▶ Execution Order: Sync → Microtasks → Macrotasks");
  log.push("  (Watch the order carefully!)");
  log.push("");

  // MACROTASK: setTimeout with 0ms — goes to Task Queue
  setTimeout(() => {
    log.push("  4️⃣  setTimeout callback (Macrotask, Task Queue)");
  }, 0);

  // MICROTASK: Promise.resolve — goes to Microtask Queue
  Promise.resolve().then(() => {
    log.push("  2️⃣  Promise.resolve().then() (Microtask Queue)");
  });

  // MICROTASK: queueMicrotask — also goes to Microtask Queue
  queueMicrotask(() => {
    log.push("  3️⃣  queueMicrotask() callback (Microtask Queue)");
  });

  // SYNCHRONOUS: runs immediately on the call stack
  log.push("  1️⃣  Synchronous code (Call Stack) — runs first");

  // Return log immediately (async callbacks fill in later)
  return log;
}

// -----------------------------------------------------------
// 3. MICROTASK QUEUE DEEP DIVE
//    Microtasks can schedule MORE microtasks — they all drain
//    before any macrotask runs!
// -----------------------------------------------------------
export function microtaskChainDemo() {
  const log = [];

  log.push("▶ Microtask Chain — microtasks can queue more microtasks");

  setTimeout(() => {
    log.push("  🔴 Macrotask (setTimeout) — only runs AFTER all microtasks!");
  }, 0);

  Promise.resolve()
    .then(() => {
      log.push("  ✅ Microtask 1");
      // Scheduling another microtask from inside a microtask
      return Promise.resolve();
    })
    .then(() => {
      log.push("  ✅ Microtask 2 (chained from Microtask 1)");
      return Promise.resolve();
    })
    .then(() => {
      log.push("  ✅ Microtask 3 (chained from Microtask 2)");
    });

  log.push("  ⬛ Synchronous code finishes");
  log.push("  [Microtask queue will drain completely before setTimeout fires]");

  return log;
}

// -----------------------------------------------------------
// 4. setTimeout vs setInterval
//    Both are Web API macrotasks — they don't block the stack.
// -----------------------------------------------------------
export function setTimeoutDemo(onUpdate) {
  const log = [];

  log.push("▶ setTimeout — fires ONCE after delay (non-blocking)");
  log.push("  ⏳ 0ms timeout scheduled...");
  log.push("  ⬛ Synchronous code runs immediately (stack not blocked)");

  // Even with 0ms, this runs AFTER the current synchronous code
  const t1 = setTimeout(() => {
    log.push("  ✅ setTimeout(0ms) callback — ran after sync code finished");
    onUpdate([...log]);
  }, 0);

  const t2 = setTimeout(() => {
    log.push("  ✅ setTimeout(300ms) callback");
    onUpdate([...log]);
  }, 300);

  log.push("  ⬛ More synchronous code — runs before any setTimeout callback!");

  // Return cleanup function
  return () => {
    clearTimeout(t1);
    clearTimeout(t2);
  };
}

export function setIntervalDemo(onUpdate, onCleanup) {
  const log = [];
  log.push("▶ setInterval — fires REPEATEDLY every N ms");

  let count = 0;
  const intervalId = setInterval(() => {
    count++;
    log.push(`  ⏱️  Tick #${count} (interval fires every 400ms)`);
    onUpdate([...log]);

    if (count >= 3) {
      clearInterval(intervalId);
      log.push("  ✅ Interval cleared after 3 ticks");
      onUpdate([...log]);
      if (onCleanup) onCleanup();
    }
  }, 400);

  return () => clearInterval(intervalId);
}

// -----------------------------------------------------------
// 5. STARVATION — Blocking the Event Loop
//    Heavy sync code blocks the stack → UI freezes, no async!
// -----------------------------------------------------------
export function blockingCodeDemo(onComplete) {
  const log = [];

  log.push("▶ Blocking the Event Loop with heavy synchronous work");
  log.push("  ⚠️  Starting blocking loop (simulated fast)...");

  // Schedule a macrotask BEFORE blocking
  setTimeout(() => {
    log.push("  ✅ setTimeout callback finally ran (was delayed by blocking loop)");
    onComplete([...log]);
  }, 0);

  // Simulate heavy computation (blocking)
  const start = performance.now();
  let sum = 0;
  for (let i = 0; i < 50_000_000; i++) {
    sum += i;
  }
  const duration = (performance.now() - start).toFixed(1);

  log.push(`  🔴 Blocking loop finished: sum=${sum.toLocaleString()}, took ${duration}ms`);
  log.push("  ⚠️  During this loop, the setTimeout callback was STUCK waiting");
  log.push("  💡 Use Web Workers for heavy computation to avoid blocking!");

  return log;
}

// -----------------------------------------------------------
// 6. REAL-WORLD: fetch() and the Event Loop
//    fetch → Web API → Promise → Microtask Queue
// -----------------------------------------------------------
export function fetchEventLoopDemo() {
  const log = [];

  log.push("▶ fetch() and the Event Loop");
  log.push("  1️⃣  Synchronous code starts");

  // fetch goes to Web API (network), then its .then → microtask queue
  const fetchPromise = fetch("https://jsonplaceholder.typicode.com/todos/1")
    .then((res) => res.json())
    .then((data) => {
      log.push(`  ✅ fetch resolved → Microtask: got todo "${data.title}"`);
      return log;
    })
    .catch(() => {
      log.push("  ❌ fetch failed (network error)");
      return log;
    });

  log.push("  2️⃣  fetch() called → handed off to Web API (non-blocking)");
  log.push("  3️⃣  Synchronous code continues immediately");
  log.push("  4️⃣  [Waiting for network response...]");

  return fetchPromise;
}

// -----------------------------------------------------------
// 7. PROMISE + setTimeout ORDERING QUIZ
//    Classic interview question: What is the output order?
// -----------------------------------------------------------
export function orderingQuizDemo() {
  const log = [];

  log.push("▶ Classic Event Loop Ordering Quiz:");
  log.push("  [Predict the order before running!]");
  log.push("");

  // --- Code under quiz ---
  log.push("  Code:");
  log.push("    console.log('A');              // sync");
  log.push("    setTimeout(() => log('B'), 0); // macrotask");
  log.push("    Promise.resolve().then(        // microtask");
  log.push("      () => log('C')");
  log.push("    );");
  log.push("    console.log('D');              // sync");
  log.push("");
  log.push("  Actual output order:");

  // Actual execution
  const output = [];
  const push = (v) => output.push(v);

  push("A"); // sync

  setTimeout(() => {
    push("B"); // macrotask
    log.push(`  ${output.join(" → ")}`);
    log.push("  ✅ A and D ran first (sync), then C (microtask), then B (macrotask)");
  }, 0);

  Promise.resolve().then(() => push("C")); // microtask

  push("D"); // sync

  return log;
}

// -----------------------------------------------------------
// 8. EVENT LOOP — Visual Flow (structured data for UI)
// -----------------------------------------------------------
export const eventLoopFlow = [
  {
    step: 1,
    name: "Call Stack",
    color: "#6366f1",
    icon: "📦",
    description:
      "Synchronous JS code executes here. Functions are pushed (called) and popped (returned). Only ONE thing runs at a time.",
    examples: ["console.log()", "function calls", "variable declarations"],
  },
  {
    step: 2,
    name: "Web APIs",
    color: "#0ea5e9",
    icon: "🌐",
    description:
      "Browser (or Node.js) provides async capabilities outside the JS engine. Timers, network requests, DOM events all live here.",
    examples: ["setTimeout", "fetch()", "addEventListener", "setInterval"],
  },
  {
    step: 3,
    name: "Microtask Queue",
    color: "#10b981",
    icon: "⚡",
    description:
      "HIGH PRIORITY queue. Drained completely before any macrotask. Promise callbacks and queueMicrotask() go here.",
    examples: ["Promise.then()", "Promise.catch()", "queueMicrotask()", "MutationObserver"],
  },
  {
    step: 4,
    name: "Task Queue (Macrotask)",
    color: "#f59e0b",
    icon: "📋",
    description:
      "LOWER PRIORITY queue. After microtasks drain, the Event Loop picks ONE macrotask. Then microtasks drain again.",
    examples: ["setTimeout callback", "setInterval callback", "I/O callbacks", "UI rendering"],
  },
  {
    step: 5,
    name: "Event Loop",
    color: "#ec4899",
    icon: "🔄",
    description:
      "The orchestrator. Constantly checks: Is the Call Stack empty? → Drain ALL microtasks → Run ONE macrotask → Repeat.",
    examples: ["Checks stack is empty", "Drains microtasks first", "Picks next macrotask"],
  },
];

// -----------------------------------------------------------
// 9. COMPARISON TABLE  (for UI rendering)
// -----------------------------------------------------------
export const queueComparisonTable = [
  {
    aspect: "Queue Type",
    microtask: "Microtask Queue",
    macrotask: "Task Queue (Macrotask Queue)",
  },
  {
    aspect: "Priority",
    microtask: "⬆️ HIGH — runs before macrotasks",
    macrotask: "⬇️ LOW — runs after all microtasks",
  },
  {
    aspect: "Drained",
    microtask: "ALL at once (entire queue)",
    macrotask: "ONE per event loop tick",
  },
  {
    aspect: "Sources",
    microtask: "Promise.then/catch/finally, queueMicrotask, MutationObserver",
    macrotask: "setTimeout, setInterval, setImmediate, I/O, UI events",
  },
  {
    aspect: "Risk",
    microtask: "⚠️ Infinite loop → starves macrotasks",
    macrotask: "⚠️ Heavy sync in callback → blocks UI",
  },
];

// -----------------------------------------------------------
// 10. KEY RULES SUMMARY  (for UI cards)
// -----------------------------------------------------------
export const eventLoopRules = [
  {
    icon: "1️⃣",
    title: "Sync code always runs first",
    detail:
      "The call stack must be empty before any async callback (microtask or macrotask) can run.",
  },
  {
    icon: "2️⃣",
    title: "Microtasks before Macrotasks",
    detail:
      "After the stack empties, ALL pending microtasks (Promises) run before even a 0ms setTimeout fires.",
  },
  {
    icon: "3️⃣",
    title: "Microtasks drain completely",
    detail:
      "If a microtask schedules another microtask, that runs too — before any macrotask gets a turn.",
  },
  {
    icon: "4️⃣",
    title: "One macrotask per tick",
    detail:
      "After microtasks drain, the Event Loop picks exactly ONE macrotask, then checks microtasks again.",
  },
  {
    icon: "5️⃣",
    title: "Never block the stack",
    detail:
      "Heavy synchronous loops freeze the UI and delay all async callbacks. Use Web Workers or chunked async work.",
  },
  {
    icon: "6️⃣",
    title: "setTimeout(fn, 0) is not instant",
    detail:
      "Even 0ms setTimeout goes to the Task Queue — it waits until the stack is empty AND all microtasks are done.",
  },
];
