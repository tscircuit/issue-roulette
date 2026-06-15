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

export async function fetchGithubIssues(
  token: string,
): Promise<IssuesByFilter> {
  const octokit = new Octokit({ auth: token })
  const org = "tscircuit"

  // Get all repositories from the tscircuit organization
  const repos = await octokit.paginate(octokit.repos.listForOrg, {
    org,
  })

  const reposNotArchived = repos.filter(repo => !repo.archived)

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
  const openIssues = allIssues
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .filter(
      (issue) =>
        !issue.pull_request && // Not a PR
        !issue.assignees?.length, // Not assigned
    )

  const processedIssues = await Promise.all(
    openIssues.map(async (issue) => {
      // Check for bounty label and parse amount
      const hasBountyLabel = issue.labels?.some(
        (label: any) => label.name === "💎 Bounty" || label.name.toLowerCase().includes("bounty"),
      )
      
      let bountyAmount = 0
      
      // 1. Try to extract from labels like "$50"
      if (issue.labels) {
        for (const label of issue.labels) {
          const match = label.name.match(/\$(\d+)/)
          if (match) {
            bountyAmount = parseInt(match[1], 10)
            break
          }
        }
      }

      // 2. Try to extract from issue body
      if (bountyAmount === 0 && hasBountyLabel) {
        const bountyMatch = (issue.body || "").match(/\/bounty\s*\$(\d+)/i)
        if (bountyMatch) {
          bountyAmount = parseInt(bountyMatch[1], 10)
        }
      }

      // 3. Try to extract from Algora bot comments
      if (bountyAmount === 0 && hasBountyLabel && issue.number) {
        try {
          const comments = await octokit.paginate(octokit.issues.listComments, {
            owner: org,
            repo: issue.repository.name,
            issue_number: issue.number,
          })
          
          for (const comment of comments) {
            if (comment.user?.login === "algora-bot" || comment.body?.includes("bounty")) {
              const match = (comment.body || "").match(/\$(\d+)/)
              if (match) {
                bountyAmount = parseInt(match[1], 10)
                break
              }
            }
          }
        } catch (e) {
          console.error(`Failed to fetch comments for ${issue.repository.full_name}#${issue.number}`, e)
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
    })
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
    "bounty": getBountiedIssues(),
    "all": getWeightedIssues(),
    "unbountied": processedIssues
      .filter((issue) => (issue.bountyAmount ?? 0) === 0)
      .slice(0, 20), // Keep same limit as other filters
  }
}
