import { describe, expect, mock, test } from "bun:test"

mock.module("@octokit/rest", () => ({
  Octokit: class {
    repos = {
      listForOrg: "listForOrg",
    }
    issues = {
      listForRepo: "listForRepo",
    }
    search = {
      issuesAndPullRequests: async () => ({
        data: {
          items: [
            {
              id: 1,
              title: "Recent issue from search",
              body: "/bounty $20",
              html_url: "https://github.com/tscircuit/recent-repo/issues/1",
              created_at: new Date().toISOString(),
              state: "open",
              labels: [{ name: "💎 Bounty" }],
              user: { login: "seveibar", avatar_url: "" },
              repository_url:
                "https://api.github.com/repos/tscircuit/recent-repo",
            },
          ],
        },
      }),
    }
    async paginate(fn: string, params: Record<string, unknown>) {
      if (fn === "listForOrg") {
        return [
          {
            name: "old-repo",
            archived: false,
            open_issues_count: 1,
            pushed_at: "2024-01-01T00:00:00Z",
          },
          {
            name: "recent-repo",
            archived: false,
            open_issues_count: 1,
            pushed_at: new Date().toISOString(),
          },
        ]
      }
      if (fn === "listForRepo") {
        if (params.repo === "recent-repo") {
          return [
            {
              id: 2,
              title: "Recent unbountied issue",
              body: "Needs fix",
              html_url: "https://github.com/tscircuit/recent-repo/issues/2",
              created_at: new Date().toISOString(),
              state: "open",
              labels: [],
              user: { login: "seveibar", avatar_url: "" },
            },
          ]
        }
        return [
          {
            id: 3,
            title: "Old unbountied issue",
            body: "Old issue",
            html_url: "https://github.com/tscircuit/old-repo/issues/3",
            created_at: "2024-01-01T00:00:00Z",
            state: "open",
            labels: [],
            user: { login: "seveibar", avatar_url: "" },
          },
        ]
      }
      return []
    }
  },
}))

const { fetchGithubIssues, selectWeightedIssues } = await import(
  "../lib/github"
)

const makeIssue = (id: number, daysAgo: number, bountyAmount = 0) => {
  const now = new Date("2026-10-18T00:00:00Z")
  const createdAt = new Date(
    now.getTime() - daysAgo * 24 * 60 * 60 * 1000,
  ).toISOString()
  return {
    id,
    title: `Issue ${id}`,
    body: bountyAmount > 0 ? `/bounty $${bountyAmount}` : "",
    html_url: `https://github.com/tscircuit/repo/issues/${id}`,
    created_at: createdAt,
    user: { login: "seveibar", avatar_url: "" },
    repository: { name: "repo", full_name: "tscircuit/repo" },
    bountyAmount,
  }
}

describe("selectWeightedIssues", () => {
  test("prioritizes recent issues even when hundreds of old issues exist", () => {
    const now = new Date("2026-10-18T00:00:00Z")
    const recentIssues = Array.from({ length: 15 }, (_, idx) =>
      makeIssue(idx + 1, 2),
    )
    const oldIssues = Array.from({ length: 500 }, (_, idx) =>
      makeIssue(100 + idx, 120),
    )

    const selected = selectWeightedIssues(
      [...oldIssues, ...recentIssues],
      now,
      20,
    )
    expect(selected.length).toBe(20)

    const recentSelectedCount = selected.filter(
      (issue) => issue.id <= 15,
    ).length
    expect(recentSelectedCount).toBeGreaterThanOrEqual(8)
  })

  test("fetchGithubIssues includes recent issues across all, bounty, and unbountied filters", async () => {
    const result = await fetchGithubIssues("test-token")
    expect(result.bounty.some((i) => i.id === 1)).toBe(true)
    expect(result.all.some((i) => i.id === 1 || i.id === 2)).toBe(true)
    expect(result.unbountied.some((i) => i.id === 2)).toBe(true)
  })
})
