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

const REPO_FETCH_CONCURRENCY = 10

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length)
  let nextIndex = 0

  const worker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++
      try {
        const value = await mapper(items[currentIndex])
        results[currentIndex] = { status: "fulfilled", value }
      } catch (reason) {
        results[currentIndex] = { status: "rejected", reason }
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  )
  await Promise.all(workers)
  return results
}

export function selectWeightedIssues(
  issues: Issue[],
  now: Date = new Date(),
  limit = 20,
): Issue[] {
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const recentWeek: Issue[] = []
  const recentMonth: Issue[] = []
  const older: Issue[] = []

  for (const issue of issues) {
    const createdAt = new Date(issue.created_at)
    if (createdAt >= weekAgo) {
      recentWeek.push(issue)
    } else if (createdAt >= monthAgo) {
      recentMonth.push(issue)
    } else {
      older.push(issue)
    }
  }

  const shuffle = (arr: Issue[]) =>
    arr
      .map((item) => ({ item, sortKey: Math.random() }))
      .sort((a, b) => b.sortKey - a.sortKey)
      .map(({ item }) => item)

  const pool = {
    week: shuffle(recentWeek),
    month: shuffle(recentMonth),
    older: shuffle(older),
  }

  const selected: Issue[] = []
  const targetCount = Math.min(limit, issues.length)

  while (selected.length < targetCount) {
    const availableBuckets: Array<{ key: keyof typeof pool; weight: number }> =
      []
    if (pool.week.length > 0)
      availableBuckets.push({ key: "week", weight: 0.7 })
    if (pool.month.length > 0)
      availableBuckets.push({ key: "month", weight: 0.25 })
    if (pool.older.length > 0)
      availableBuckets.push({ key: "older", weight: 0.05 })

    if (availableBuckets.length === 0) break

    const totalWeight = availableBuckets.reduce((sum, b) => sum + b.weight, 0)
    let roll = Math.random() * totalWeight
    let chosenKey = availableBuckets[availableBuckets.length - 1].key

    for (const bucket of availableBuckets) {
      roll -= bucket.weight
      if (roll <= 0) {
        chosenKey = bucket.key
        break
      }
    }

    const picked = pool[chosenKey].shift()
    if (picked) {
      selected.push(picked)
    }
  }

  return selected
}

export async function fetchGithubIssues(
  token: string,
): Promise<IssuesByFilter> {
  const octokit = new Octokit({
    auth: token || undefined,
    request: {
      fetch: (url: string, options?: RequestInit) =>
        fetch(url, { ...options, cache: "no-store" }),
    },
  })
  const org = "tscircuit"

  // Get all repositories from the tscircuit organization, most recently pushed first
  const repos = await octokit.paginate(octokit.repos.listForOrg, {
    org,
    sort: "pushed",
    direction: "desc",
    per_page: 100,
  })

  const reposNotArchived = repos
    .filter((repo) => !repo.archived && repo.open_issues_count !== 0)
    .sort((a, b) => {
      const aTime = new Date(a.pushed_at || a.updated_at || 0).getTime()
      const bTime = new Date(b.pushed_at || b.updated_at || 0).getTime()
      return bTime - aTime
    })

  // Fetch issues from all active repositories with bounded concurrency to avoid secondary rate limits
  const allIssues = await mapWithConcurrency(
    reposNotArchived,
    REPO_FETCH_CONCURRENCY,
    async (repo) => {
      try {
        const issues = await octokit.paginate(octokit.issues.listForRepo, {
          owner: org,
          repo: repo.name,
          state: "open",
          sort: "created",
          direction: "desc",
          per_page: 100,
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
    },
  )

  // Also query the GitHub search endpoint for the newest open issues across the org
  // so recent issues are never missed if individual repo requests fail or rate-limit.
  let recentSearchIssues: any[] = []
  if (typeof octokit.search?.issuesAndPullRequests === "function") {
    try {
      const searchResponse = await octokit.search.issuesAndPullRequests({
        q: `org:${org} is:issue is:open no:assignee archived:false`,
        sort: "created",
        order: "desc",
        per_page: 100,
      })
      recentSearchIssues = searchResponse.data.items.map((item: any) => {
        const repoUrlParts = (item.repository_url || "").split("/")
        const repoName = repoUrlParts[repoUrlParts.length - 1] || "unknown"
        return {
          ...item,
          repository: {
            name: repoName,
            full_name: `${org}/${repoName}`,
          },
        }
      })
    } catch (error) {
      console.error("Failed to fetch recent issues from GitHub search:", error)
    }
  }

  const rawIssues = [
    ...recentSearchIssues,
    ...allIssues.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    ),
  ]

  const seenIssueIds = new Set<number>()

  // Flatten, deduplicate, and filter issues
  const processedIssues = rawIssues
    .filter((issue) => {
      if (
        !issue ||
        (issue.state && issue.state !== "open") ||
        issue.pull_request || // Not a PR
        issue.assignees?.length || // Not assigned
        seenIssueIds.has(issue.id)
      ) {
        return false
      }
      seenIssueIds.add(issue.id)
      return true
    })
    .map((issue) => {
      // Check for bounty label and parse amount
      const hasBountyLabel = issue.labels?.some(
        (label: any) => label.name === "💎 Bounty",
      )
      let bountyAmount = 0
      if (hasBountyLabel) {
        const bountyMatch = (issue.body || "").match(/\/bounty\s*\$(\d+)/i)
        bountyAmount = bountyMatch ? Number.parseInt(bountyMatch[1], 10) : 0
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
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

  const now = new Date()

  // Function to get bountied issues sorted by amount, then newest first
  const getBountiedIssues = () => {
    return processedIssues
      .filter((issue) => (issue.bountyAmount ?? 0) > 0)
      .sort((a, b) => {
        const bountyDiff = (b.bountyAmount ?? 0) - (a.bountyAmount ?? 0)
        if (bountyDiff !== 0) return bountyDiff
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      })
      .slice(0, 20)
  }

  const unbountiedIssues = processedIssues.filter(
    (issue) => (issue.bountyAmount ?? 0) === 0,
  )

  return {
    bounty: getBountiedIssues(),
    all: selectWeightedIssues(processedIssues, now, 20),
    unbountied: selectWeightedIssues(unbountiedIssues, now, 20),
  }
}
