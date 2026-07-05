import { expect, test } from "bun:test"
import { hasBountyLabel, parseBountyAmountFromText } from "./github"

test("detects bounty labels with different names", () => {
  expect(hasBountyLabel([{ name: "💎 Bounty" }])).toBe(true)
  expect(hasBountyLabel([{ name: "Bounty" }])).toBe(true)
  expect(hasBountyLabel([{ name: "Feature" }])).toBe(false)
})

test("parses bounty amounts from issue bodies and Algora-style comments", () => {
  expect(parseBountyAmountFromText("/bounty $75")).toBe(75)
  expect(parseBountyAmountFromText("💎 $1 bounty • tscircuit")).toBe(1)
  expect(parseBountyAmountFromText("no bounty text here")).toBe(0)
})

test("returns zero when tokenless fetch is skipped", async () => {
  const { fetchGithubIssues } = await import("./github")
  expect(await fetchGithubIssues("")).toEqual({
    bounty: [],
    all: [],
    unbountied: [],
  })
})
