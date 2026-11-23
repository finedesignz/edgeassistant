const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("EdgeAssistant cloud card is first in the speech-to-text mode list", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../../src/components/SettingsPage.tsx"),
    "utf8"
  );
  const start = src.indexOf("const transcriptionTabs");
  assert.ok(start > 0);
  const block = src.slice(start, start + 700);
  assert.ok(
    block.indexOf('id: "titanium"') > 0 &&
      block.indexOf('id: "titanium"') < block.indexOf("...transcriptionModes"),
    "titanium card must precede the spread of the other modes"
  );
});
