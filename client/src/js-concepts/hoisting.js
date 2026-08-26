// ============================================================
// FILE: hoisting.js
// TOPIC: JavaScript — Hoisting
// ============================================================
// Hoisting is JavaScript's default behaviour of moving
// declarations to the top of the current scope (script or
// function) BEFORE code execution begins.
// Only DECLARATIONS are hoisted, NOT initializations.
// ============================================================

// -----------------------------------------------------------
// 1. VAR HOISTING
//    - var declarations are hoisted and initialized to undefined
// -----------------------------------------------------------
export function varHoistingDemo() {
  const results = [];

  // Accessing 'message' BEFORE its declaration
  // → Does NOT throw an error; prints undefined (var is hoisted)
  results.push(`Before declaration: message = ${message}`); // undefined

  var message = "Hello, Hoisting!";

  // Accessing 'message' AFTER its assignment
  results.push(`After declaration:  message = ${message}`); // "Hello, Hoisting!"

  return results;
}

// What JavaScript actually sees (after hoisting):
// var message;            ← hoisted to top (undefined)
// console.log(message);  ← undefined
// message = "Hello...";  ← assignment stays in place

// -----------------------------------------------------------
// 2. FUNCTION DECLARATION HOISTING
//    - Entire function body is hoisted (can be called before it appears)
// -----------------------------------------------------------
export function functionDeclarationHoistingDemo() {
  const results = [];

  // Called BEFORE the function is defined in code — works fine!
  const result = greet("World");
  results.push(`Called greet() before its definition: "${result}"`);

  // Function Declaration (entire body is hoisted)
  function greet(name) {
    return `Hello, ${name}!`;
  }

  results.push(`Called greet() after its definition: "${greet("JS")}"`);
  return results;
}

// -----------------------------------------------------------
// 3. FUNCTION EXPRESSION HOISTING
//    - Only the var declaration is hoisted (not the function body)
//    - Calling it before assignment → TypeError
// -----------------------------------------------------------
export function functionExpressionHoistingDemo() {
  const results = [];

  // var sayHi is hoisted as 'undefined'
  // Calling it here would throw: TypeError: sayHi is not a function
  results.push(`typeof sayHi before assignment: ${typeof sayHi}`); // "undefined"

  var sayHi = function (name) {
    return `Hi, ${name}!`;
  };

  results.push(`typeof sayHi after assignment:  ${typeof sayHi}`); // "function"
  results.push(`Result after assignment: "${sayHi("Arya")}"`);
  return results;
}

// -----------------------------------------------------------
// 4. LET & CONST HOISTING — THE TEMPORAL DEAD ZONE (TDZ)
//    - let/const ARE hoisted but NOT initialized
//    - Accessing them before declaration → ReferenceError (TDZ)
// -----------------------------------------------------------
export function letConstHoistingDemo() {
  const results = [];

  // Uncommenting the line below would throw:
  // ReferenceError: Cannot access 'count' before initialization
  // console.log(count);

  let count = 42;
  results.push(`let count after declaration: ${count}`);

  // Same for const:
  // console.log(PI); // ReferenceError
  const PI = 3.14159;
  results.push(`const PI after declaration: ${PI}`);

  results.push(
    "⚠️  Accessing let/const before declaration → ReferenceError (Temporal Dead Zone)"
  );

  return results;
}

// -----------------------------------------------------------
// 5. CLASS HOISTING
//    - Classes are hoisted but stay in TDZ — NOT initialized
//    - Must be defined before use
// -----------------------------------------------------------
export function classHoistingDemo() {
  const results = [];

  // Uncommenting this would throw:
  // ReferenceError: Cannot access 'Animal' before initialization
  // const a = new Animal("Dog");

  class Animal {
    constructor(name) {
      this.name = name;
    }
    speak() {
      return `${this.name} makes a sound.`;
    }
  }

  const dog = new Animal("Dog");
  results.push(`Class instance after definition: ${dog.speak()}`);
  results.push(
    "⚠️  Classes are NOT usable before their definition (TDZ applies)"
  );

  return results;
}

// -----------------------------------------------------------
// 6. HOISTING IN NESTED SCOPES
//    - Each function has its OWN scope; hoisting is per-scope
// -----------------------------------------------------------
export function nestedScopeHoistingDemo() {
  const results = [];

  var x = "global x";

  function inner() {
    // 'x' inside inner() is hoisted (var) → undefined, shadows global x
    results.push(`inner — x before local declaration: ${x}`); // undefined (NOT "global x")
    var x = "local x";
    results.push(`inner — x after  local declaration: ${x}`); // "local x"
  }

  inner();
  results.push(`outer — x after inner() call: ${x}`); // "global x"

  return results;
}

// -----------------------------------------------------------
// 7. SUMMARY TABLE  (returned as structured data for UI)
// -----------------------------------------------------------
export const hoistingSummary = [
  {
    declaration: "var",
    hoisted: "✅ Yes",
    initialized: "✅ undefined",
    tdz: "❌ No",
    note: "Safe to access before declaration (returns undefined)",
  },
  {
    declaration: "let",
    hoisted: "✅ Yes",
    initialized: "❌ No",
    tdz: "✅ Yes",
    note: "ReferenceError if accessed before declaration",
  },
  {
    declaration: "const",
    hoisted: "✅ Yes",
    initialized: "❌ No",
    tdz: "✅ Yes",
    note: "ReferenceError if accessed before declaration",
  },
  {
    declaration: "function declaration",
    hoisted: "✅ Yes",
    initialized: "✅ Fully",
    tdz: "❌ No",
    note: "Can be called anywhere in the scope",
  },
  {
    declaration: "function expression (var)",
    hoisted: "✅ Yes",
    initialized: "✅ undefined",
    tdz: "❌ No",
    note: "TypeError if called before assignment",
  },
  {
    declaration: "class",
    hoisted: "✅ Yes",
    initialized: "❌ No",
    tdz: "✅ Yes",
    note: "ReferenceError if instantiated before definition",
  },
];
