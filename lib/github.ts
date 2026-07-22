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

export interface IssuesByFilter {
  [filter: string]: Issue[]
}

const BOUNTY_AMOUNT_RE = /(?:\/bounty|💎)\s*\$([0-9][\d,]*)/i
const DOLLAR_LABEL_RE = /^\$([0-9][\d,]*)$/

function parseDollarAmount(value: string | undefined | null): number {
  if (!value) return 0
  const match = value.match(BOUNTY_AMOUNT_RE)
  if (!match?.[1]) return 0
  return Number.parseInt(match[1].replace(/,/g, ""), 10) || 0
}

function amountFromLabels(labels: any[] | undefined): number {
  if (!labels?.length) return 0
  for (const label of labels) {
    const name = typeof label === "string" ? label : label?.name
    if (!name) continue
    const dollarMatch = String(name).match(DOLLAR_LABEL_RE)
    if (dollarMatch?.[1]) {
      return Number.parseInt(dollarMatch[1].replace(/,/g, ""), 10) || 0
    }
  }
  return 0
}

function hasBountySignal(labels: any[] | undefined): boolean {
  if (!labels?.length) return false
  return labels.some((label) => {
    const name = typeof label === "string" ? label : label?.name
    if (!name) return false
    return name === "💎 Bounty" || DOLLAR_LABEL_RE.test(String(name))
  })
}

async function amountFromAlgoraComments(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
): Promise<number> {
  try {
    const comments = await octokit.paginate(octokit.issues.listComments, {
      owner,
      repo,
      issue_number: issueNumber,
      per_page: 100,
    })

    for (const comment of comments) {
      const login = comment.user?.login?.toLowerCase() ?? ""
      if (!login.includes("algora")) continue
      const amount = parseDollarAmount(comment.body)
      if (amount > 0) return amount
    }
  } catch (error) {
    console.error(
      `Failed to fetch comments for ${owner}/${repo}#${issueNumber}:`,
      error,
    )
  }
  return 0
}

export async function fetchGithubIssues(
  token: string,
): Promise<IssuesByFilter> {
  const octokit = new Octokit({ auth: token })
  const org = "tscircuit"

  // Get all repositories from the tscircuit organization
  const repos = await octokit.paginate(octokit.repos.listForOrg, {
    org,
  })

  const reposNotArchived = repos.filter((repo) => !repo.archived)

  // Fetch issues from all repositories; tolerate per-repo fetch failures
  const allIssues = await Promise.allSettled(
    reposNotArchived.map(async (repo) => {
      try {
        const issues = await octokit.paginate(octokit.issues.listForRepo, {
          owner: org,
          repo: repo.name,
          state: "open",
        })

        return issues.map((issue) => ({
          ...issue,
          repository: {
            name: repo.name,
            full_name: `${org}/${repo.name}`,
          },
        }))
      } catch (error) {
        console.error(
          `Failed to fetch issues for ${org}/${repo.name}:`,
          error,
        )
        return []
      }
    }),
  )

  // Flatten and filter issues
  const candidateIssues = allIssues
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .filter(
      (issue) =>
        !issue.pull_request && // Not a PR
        !issue.assignees?.length, // Not assigned
    )

  const processedIssues = await Promise.all(
    candidateIssues.map(async (issue) => {
      const labels = issue.labels as any[] | undefined
      let bountyAmount = 0

      if (hasBountySignal(labels)) {
        bountyAmount =
          amountFromLabels(labels) || parseDollarAmount(issue.body || "")

        // Algora often posts `/bounty $N` in a bot comment instead of the body
        if (bountyAmount === 0) {
          const [owner, repo] = issue.repository.full_name.split("/")
          if (owner && repo) {
            bountyAmount = await amountFromAlgoraComments(
              octokit,
              owner,
              repo,
              issue.number,
            )
          }
        }
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
    }),
  )

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

  return {
    bounty: getBountiedIssues(),
    all: getWeightedIssues(),
    unbountied: processedIssues
      .filter((issue) => (issue.bountyAmount ?? 0) === 0)
      .slice(0, 20), // Keep same limit as other filters
  }
}
