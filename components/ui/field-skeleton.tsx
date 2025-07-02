export function EstimateCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="h-6 bg-slate-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded w-24"></div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-slate-200 rounded flex-1"></div>
        <div className="h-8 bg-slate-200 rounded flex-1"></div>
      </div>
    </div>
  )
}
