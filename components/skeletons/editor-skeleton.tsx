import { Skeleton } from "../ui/skeleton";

const EditorGameCardSkeleton = () => (
  <div className="group relative">
    <div className="-inset-0.5 absolute rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-20" />

    <div className="relative transform-gpu overflow-hidden rounded-xl border-0 p-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
      <div className="overflow-hidden border-0 bg-gradient-to-br from-slate-50/50 to-white p-0 shadow-lg backdrop-blur-sm dark:from-slate-900/50 dark:to-slate-800">
        {/* Banner skeleton */}
        <div className="relative overflow-hidden">
          <div className="relative flex h-32 items-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
            <div className="relative w-full px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-2xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tags skeleton */}
        <div className="bg-gradient-to-r from-slate-50/50 to-transparent px-6 py-4 dark:from-slate-800/50">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="flex flex-col space-y-1" key={`stat-${index}`}>
                <Skeleton className="h-3 w-16" />
                <div className="flex items-center gap-2 rounded-lg bg-slate-100/50 p-2 dark:bg-slate-800/50">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="border-slate-200/50 border-t bg-gradient-to-r from-slate-50/30 to-transparent dark:border-slate-700/50 dark:from-slate-800/30">
          <div className="flex gap-3 px-6 py-4">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default EditorGameCardSkeleton;
