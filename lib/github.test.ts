import assert from "node:assert/strict"
import test from "node:test"
import { parseBountyAmount } from "./github"

test("parses bounty amounts with cents", () => {
  assert.equal(
    parseBountyAmount("Implement this feature\n\n/bounty $12.50"),
    12.5,
  )
})
