// Path: app/(dashboard)/teacher/loading.tsx
export default function Loading() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-[#1d1f2a] rounded-lg w-48" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-[#1d1f2a] rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-[#1d1f2a] rounded-xl" />
    </div>
  )
}
