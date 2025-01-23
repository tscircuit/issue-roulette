import IssueRoulette from "@/components/IssueRoulette"
import { IssueSkeletonLoader } from "@/components/IssueSkeletonLoader"
import { fetchGithubIssues } from "@/lib/github"
import { Suspense } from "react"

export const revalidate = 3600 // Revalidate every hour

export default async function Home() {
  const issues = await fetchGithubIssues(process.env.GITHUB_TOKEN || "")

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Issue Roulette</h1>
        <a
          href="https://github.com/tscircuit/tscircuit"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            alt="GitHub stars"
            src="https://img.shields.io/github/stars/tscircuit/tscircuit?style=social"
          />
        </a>
        <Suspense fallback={<IssueSkeletonLoader />}>
          <IssueRoulette initialIssues={issues} />
        </Suspense>
      </div>
    </div>
  )
}
