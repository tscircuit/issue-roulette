import { Octokit } from "@octokit/rest"

export interface Issue {
  id: number
  title: string
  body: string
  html_url: string
  created_at: string
  user: {
    login: string
    avatar_url: string
  }
  repository: {
    name: string
    full_name: string
  }
  bountyAmount?: number // Amount of bounty in dollars, if this is a bountied issue
}

export async function fetchGithubIssues(
  token: string,
  filterType: "all" | "bounty" | "unbountied" = "all",
): Promise<Issue[]> {
  const octokit = new Octokit({ auth: token })
  const org = "tscircuit"

  // Get all repositories from the tscircuit organization
  const { data: repos } = await octokit.repos.listForOrg({
    org,
    per_page: 100,
  })

  // Fetch issues from all repositories
  const allIssues = await Promise.all(
    repos.map(async (repo) => {
      const { data: issues } = await octokit.issues.listForRepo({
        owner: org,
        repo: repo.name,
        state: "open",
        per_page: 100,
      })

      return issues.map((issue) => ({
        ...issue,
        repository: {
          name: repo.name,
          full_name: `${org}/${repo.name}`,
        },
      }))
    }),
  )

  // Flatten and filter issues
  const processedIssues = allIssues
    .flat()
    .filter(
      (issue) =>
        !issue.pull_request && // Not a PR
        !issue.assignees?.length, // Not assigned
    )
    .map((issue) => {
      // Check for bounty label and parse amount
      const hasBountyLabel = issue.labels?.some(
        (label: any) => label.name === "💎 Bounty",
      )
      let bountyAmount = 0
      if (hasBountyLabel) {
        const bountyMatch = (issue.body || "").match(/\/bounty\s*\$(\d+)/i)
        bountyAmount = bountyMatch ? parseInt(bountyMatch[1], 10) : 0
      }

      return {
        id: issue.id,
        title: issue.title,
        body: issue.body || "",
        html_url: issue.html_url,
        created_at: issue.created_at,
        user: {
          login: issue.user?.login || "unknown",
          avatar_url: issue.user?.avatar_url || "",
        },
        repository: issue.repository,
        bountyAmount,
      }
    })

  // Calculate dates for weighting
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Function to get bountied issues sorted by amount
  const getBountiedIssues = () => {
    return processedIssues
      .filter((issue) => (issue.bountyAmount ?? 0) > 0)
      .sort((a, b) => (b.bountyAmount ?? 0) - (a.bountyAmount ?? 0))
      .slice(0, 20) // Keep same limit as weighted issues
  }

  // Function to get weighted random issues (original logic)
  const getWeightedIssues = () => {
    return processedIssues
      .map((issue) => {
        const createdAt = new Date(issue.created_at)
        let weight = 0.05 // Default weight for old issues

        if (createdAt >= weekAgo) {
          weight = 0.7 // 70% for past week
        } else if (createdAt >= monthAgo) {
          weight = 0.25 // 25% for past month
        }

        return {
          ...issue,
          weight,
          random: Math.random() * weight, // Weighted random value
        }
      })
      .sort((a, b) => b.random - a.random) // Sort by weighted random value
      .map(({ weight, random, ...issue }) => issue) // Remove helper properties
      .slice(0, 20) // Limit to 20 issues
  }

  // Return filtered issues based on filter type
  switch (filterType) {
    case "bounty":
      return getBountiedIssues()
    case "unbountied":
      return processedIssues
        .filter((issue) => (issue.bountyAmount ?? 0) === 0)
        .slice(0, 20) // Keep same limit as other filters
    default:
      return getWeightedIssues()
  }
}
