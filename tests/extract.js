/* Pull a top-level `function name(...) { ... }` out of src/app.jsx and evaluate it alone.
 * Same technique schedule-contract.test.js uses for getStatus(): the app stays one file,
 * and its pure rules can still be tested without React or a browser. */

function extractFunction(source, name) {
  const start = source.indexOf("function " + name + "(");
  if (start === -1) throw new Error(name + " not found in src/app.jsx");
  let depth = 0;
  for (let i = source.indexOf("{", start); i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) {
      // eslint-disable-next-line no-new-func
      return new Function(source.slice(start, i + 1) + "; return " + name + ";")();
    }
  }
  throw new Error("could not find the end of " + name);
}

module.exports = { extractFunction };
