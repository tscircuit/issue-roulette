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

type IssueLabel = {
  name?: string | null
}

const BOUNTY_AMOUNT_PATTERNS = [
  /\/bounty\s*\$([0-9,]+(?:\.\d+)?)/i,
  /(?:💎\s*)?\$([0-9,]+(?:\.\d+)?)\s*bounty\b/i,
  /bounty\s*\$([0-9,]+(?:\.\d+)?)/i,
]

export const hasBountyLabel = (
  labels: IssueLabel[] | null | undefined,
): boolean =>
  labels?.some((label) => label.name?.toLowerCase().includes("bounty")) ?? false

export const parseBountyAmountFromText = (text?: string | null): number => {
  if (!text) return 0

  for (const pattern of BOUNTY_AMOUNT_PATTERNS) {
    const match = text.match(pattern)
    if (!match) continue

    const amount = Number.parseFloat(match[1].replaceAll(",", ""))
    if (Number.isFinite(amount) && amount > 0) return amount
  }

  return 0
}

const getCommentBodies = async (
  octokit: Octokit,
  org: string,
  repo: string,
  issueNumber: number,
): Promise<string[]> => {
  const comments = await octokit.paginate(octokit.issues.listComments, {
    owner: org,
    repo,
    issue_number: issueNumber,
    per_page: 100,
  })

  return comments.map((comment) => comment.body || "")
}

type RawIssue = {
  body?: string | null
  labels?: IssueLabel[] | null
  number: number
}

const getIssueBountyAmount = async (
  octokit: Octokit,
  org: string,
  repo: string,
  issue: RawIssue,
): Promise<number> => {
  const bodyAmount = parseBountyAmountFromText(issue.body)
  if (bodyAmount > 0) return bodyAmount

  if (!hasBountyLabel(issue.labels)) return 0

  const commentBodies = await getCommentBodies(octokit, org, repo, issue.number)
  for (const commentBody of commentBodies) {
    const commentAmount = parseBountyAmountFromText(commentBody)
    if (commentAmount > 0) return commentAmount
  }

  return 0
}

export async function fetchGithubIssues(
  token: string,
): Promise<IssuesByFilter> {
  if (!token) {
    return {
      bounty: [],
      all: [],
      unbountied: [],
    }
  }

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
        console.error(`Failed to fetch issues for ${org}/${repo.name}:`, error)
        return []
      }
    }),
  )

  // Flatten and filter issues
  const processedIssues = allIssues
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .filter(
      (issue) =>
        !issue.pull_request && // Not a PR
        !issue.assignees?.length, // Not assigned
    )
    .map((issue) => ({
      rawIssue: issue,
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
    }))

  const enrichedIssues = await Promise.all(
    processedIssues.map(async ({ rawIssue, ...rest }) => {
      const bountyAmount = await getIssueBountyAmount(
        octokit,
        org,
        rest.repository.name,
        {
          body: rawIssue.body,
          labels: rawIssue.labels as IssueLabel[] | undefined,
          number: rawIssue.number,
        },
      )

      return {
        ...rest,
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
    return enrichedIssues
      .filter((issue) => (issue.bountyAmount ?? 0) > 0)
      .sort((a, b) => (b.bountyAmount ?? 0) - (a.bountyAmount ?? 0))
      .slice(0, 20) // Keep same limit as weighted issues
  }

  // Function to get weighted random issues (original logic)
  const getWeightedIssues = () => {
    return enrichedIssues
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
    unbountied: enrichedIssues
      .filter((issue) => (issue.bountyAmount ?? 0) === 0)
      .slice(0, 20), // Keep same limit as other filters
  }
}
