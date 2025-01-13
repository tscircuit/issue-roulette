"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Issue } from "@/lib/github"
import { format } from "date-fns"
import { AlertCircle, Calendar, Dices, ExternalLink, User } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"

export default function IssueRoulette({
  initialIssues,
}: { initialIssues: Issue[] }) {
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [usedIssues, setUsedIssues] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const spinRoulette = () => {
    setIsLoading(true)
    setError(null)

    try {
      const availableIssues = initialIssues.filter(
        (issue) => !usedIssues.has(issue.id),
      )

      if (availableIssues.length === 0) {
        setUsedIssues(new Set())
        setError("All issues have been shown. Starting over!")
        return
      }

      const selectedIssue =
        availableIssues[Math.floor(Math.random() * availableIssues.length)]
      setCurrentIssue(selectedIssue)
      const newUsedIssues = new Set(usedIssues)
      newUsedIssues.add(selectedIssue.id)
      setUsedIssues(newUsedIssues)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to select issue",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <Button
          size="lg"
          onClick={spinRoulette}
          disabled={isLoading}
          className="text-lg"
        >
          <Dices className="mr-2 h-5 w-5" />
          {isLoading
            ? "Spinning..."
            : currentIssue
              ? "Spin Again"
              : "Spin the Wheel"}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {currentIssue && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  {currentIssue.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="mr-1 h-4 w-4" />
                    {currentIssue.user.login}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {format(new Date(currentIssue.created_at), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
              <a
                href={currentIssue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-primary hover:underline"
              >
                View on GitHub
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{currentIssue.body}</ReactMarkdown>
            </div>

            <div className="text-sm text-muted-foreground pt-4 border-t">
              Repository: {currentIssue.repository.full_name}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
