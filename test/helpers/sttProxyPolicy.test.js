const test = require("node:test");
const assert = require("node:assert/strict");

const {
  isAllowedSttTarget,
  pickRequestHeaders,
  pickFormFields,
  shapeProxyResponse,
} = require("../../src/helpers/sttProxyPolicy");

test("allows https and loopback http only", () => {
  assert.equal(isAllowedSttTarget("https://stt.titaniumlabs.us/v1/audio/transcriptions"), true);
  assert.equal(isAllowedSttTarget("http://localhost:8000/v1/audio/transcriptions"), true);
  assert.equal(isAllowedSttTarget("http://127.0.0.1:8000/v1"), true);
  assert.equal(isAllowedSttTarget("http://example.com/v1"), false);
  assert.equal(isAllowedSttTarget("http://192.168.1.5/v1"), false);
  assert.equal(isAllowedSttTarget("file:///etc/passwd"), false);
  assert.equal(isAllowedSttTarget("https://user:pw@example.com/"), false);
  assert.equal(isAllowedSttTarget("not a url"), false);
  assert.equal(isAllowedSttTarget(undefined), false);
});

test("keeps only credential headers", () => {
  assert.deepEqual(
    pickRequestHeaders({ Authorization: "Bearer x", "api-key": "k", Host: "evil", Cookie: "c" }),
    { Authorization: "Bearer x", "api-key": "k" }
  );
  assert.deepEqual(pickRequestHeaders(null), {});
});

test("keeps only string form field pairs", () => {
  assert.deepEqual(pickFormFields([["model", "m"], ["bad"], [1, "x"], ["a", 2]]), [["model", "m"]]);
  assert.deepEqual(pickFormFields(undefined), []);
});

test("shapes responses and nulls bodies for null-body statuses", () => {
  assert.deepEqual(
    shapeProxyResponse({
      status: 401,
      statusText: "Unauthorized",
      headers: { a: "b" },
      body: "no",
    }),
    { status: 401, statusText: "Unauthorized", headers: { a: "b" }, body: "no" }
  );
  assert.equal(shapeProxyResponse({ status: 204, body: "x" }).body, null);
  assert.equal(shapeProxyResponse({ status: 422 }).body, "");
});
