import { Octokit } from "@octokit/rest"
import { NextResponse } from "next/server"

const REPOS = ["tscircuit/tscircuit", "tscircuit/core", "tscircuit/snippets"]

export async function GET() {
  const token = process.env.GITHUB_TOKEN

  if (!token || token === "your_github_token_here") {
    return NextResponse.json(
      {
        error: "GitHub token not configured",
        message: "Please set a valid GitHub token in your .env file",
      },
      { status: 401 },
    )
  }

  const octokit = new Octokit({ auth: token })

  try {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const allIssues = []

    for (const repo of REPOS) {
      const [owner, repoName] = repo.split("/")
      const { data: issues } = await octokit.issues.listForRepo({
        owner,
        repo: repoName,
        state: "open",
        assignee: "none",
        per_page: 100,
      })

      const processedIssues = issues
        .filter((issue) => !issue.pull_request)
        .map((issue) => ({
          id: issue.id,
          title: issue.title,
          body: issue.body || "",
          html_url: issue.html_url,
          created_at: issue.created_at,
          user: {
            login: issue.user?.login || "unknown",
            avatar_url: issue.user?.avatar_url || "",
          },
          repository: {
            name: repoName,
            full_name: repo,
          },
        }))

      allIssues.push(...processedIssues)
    }

    const weightedIssues = allIssues.map((issue) => {
      const createdAt = new Date(issue.created_at)
      let weight
      if (createdAt >= oneWeekAgo) {
        weight = 0.7
      } else if (createdAt >= oneMonthAgo) {
        weight = 0.25
      } else {
        weight = 0.05
      }
      return { ...issue, weight }
    })

    const sortedIssues = weightedIssues
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 20)
      .map(({ weight, ...issue }) => issue)

    return NextResponse.json(sortedIssues)
  } catch (error) {
    console.error("Error fetching issues:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch issues",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
