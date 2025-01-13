"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import { AlertCircle, Calendar, Dices, ExternalLink, User } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"

type Issue = {
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
}

type ErrorResponse = {
  error: string
  message: string
}

export default function IssueRoulette() {
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [usedIssues, setUsedIssues] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const spinRoulette = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/issues")
      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.message || "Failed to fetch issues")
      }

      const issues = data as Issue[]
      const availableIssues = issues.filter(
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
      setUsedIssues(new Set([...usedIssues, selectedIssue.id]))
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch issues",
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
