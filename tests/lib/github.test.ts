import { expect, test } from "bun:test"
import { extractBountyAmount } from "@/lib/github"

test("extractBountyAmount prefers body bounty text", async () => {
  const octokit = {
    paginate: async () => [],
  } as any

  const amount = await extractBountyAmount(
    octokit,
    "tscircuit",
    {
      number: 1,
      body: "Fix this /bounty $75 please",
      labels: [{ name: "💎 Bounty" }],
    },
    "issue-roulette",
  )

  expect(amount).toBe(75)
})

test("extractBountyAmount falls back to label bounty text", async () => {
  const octokit = {
    paginate: async () => [],
  } as any

  const amount = await extractBountyAmount(
    octokit,
    "tscircuit",
    {
      number: 2,
      body: "No bounty text here",
      labels: [{ name: "💎 $12 bounty • tscircuit" }],
    },
    "issue-roulette",
  )

  expect(amount).toBe(12)
})

test("extractBountyAmount falls back to comments when needed", async () => {
  const octokit = {
    issues: {
      listComments: () => undefined,
    },
    paginate: async () => [
      { body: "Algora bot comment: 💎 $3 bounty • tscircuit" },
    ],
  } as any

  const amount = await extractBountyAmount(
    octokit,
    "tscircuit",
    {
      number: 3,
      body: "",
      labels: [{ name: "💎 Bounty" }],
    },
    "issue-roulette",
  )

  expect(amount).toBe(3)
})
