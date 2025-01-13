import IssueRoulette from "@/components/IssueRoulette"

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Issue Roulette</h1>
        <IssueRoulette />
      </div>
    </div>
  )
}
