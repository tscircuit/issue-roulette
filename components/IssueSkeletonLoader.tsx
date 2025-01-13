import { Card } from "@/components/ui/card"

export function IssueSkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-8 w-96 bg-muted animate-pulse rounded" />
              <div className="flex space-x-4">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
          </div>

          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </div>
      </Card>
    </div>
  )
}
