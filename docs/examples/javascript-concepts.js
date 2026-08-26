// Run with: node docs/examples/javascript-concepts.js

function createCounter() {
  let count = 0;
  return () => ++count;
}

function promiseVersion(value) {
  return Promise.resolve(value).then((result) => result.toUpperCase());
}

async function main() {
  const next = createCounter();
  console.log('closure:', next(), next());
  console.log('async/await:', await promiseVersion('helperhub'));
  console.log('event loop: sync');
  setTimeout(() => console.log('event loop: timer'), 0);
  Promise.resolve().then(() => console.log('event loop: microtask'));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
