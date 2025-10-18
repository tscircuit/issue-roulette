import { NextResponse } from "next/server"
import { fetchGithubIssues } from "@/lib/github"

export async function GET() {
	const token = process.env.GITHUB_TOKEN || ""

	try {
		// fetchGithubIssues already processes issues (parsing bounty, removing PRs/assigned),
		// but we intentionally do NOT apply any additional filtering here — the API returns
		// the full set of processed issues and lets the client/component filter as needed.
		const issues = await fetchGithubIssues(token, "all")

		return NextResponse.json(issues)
	} catch (error) {
		return NextResponse.json({ error: (error as Error).message || "Failed to fetch issues" }, { status: 500 })
	}
}

