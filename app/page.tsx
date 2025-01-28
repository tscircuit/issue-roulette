import IssueRoulette from "@/components/IssueRoulette"
import { IssueSkeletonLoader } from "@/components/IssueSkeletonLoader"
import { fetchGithubIssues } from "@/lib/github"
import { Suspense } from "react"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"



export const revalidate = 3600 // Revalidate every hour

export default async function Home() {
  const issues = await fetchGithubIssues(process.env.GITHUB_TOKEN || "")

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Issue Roulette</h1>
        <div className="flex justify-center mb-8 items-center">
          <Button variant="outline">
            <GitHubLogoIcon className="mr-2" />
            View GitHub Profile
          </Button>
        </div>
        <Suspense fallback={<IssueSkeletonLoader />}>
          <IssueRoulette initialIssues={issues} />
        </Suspense>
      </div>
    </div>
  )
}
