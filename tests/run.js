#!/usr/bin/env node
/* Test entry point.  Usage: npm test
 *
 * Self-contained by design (SOP §15): these tests resolve only files inside
 * this repository and need no packages installed. */

const { report } = require("./harness");

require("./pwa-contract.test.js");
require("./vehicle-contract.test.js");
require("./schedule-contract.test.js");
require("./ai-contract.test.js");
require("./backup-contract.test.js");
require("./deck-contract.test.js");

const summary = report();

if (summary.failed === 0) {
  console.log("\nAll contracts hold.");
} else {
  console.log("\nFAILED — do not deploy until these pass.");
}
