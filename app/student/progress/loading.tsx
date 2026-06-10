export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0d0e13] p-8 max-w-7xl mx-auto space-y-8">
      {/* Skeleton for Section 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#1a1c25] rounded-xl h-32 animate-pulse border border-[rgba(255,255,255,0.07)]"></div>
        ))}
      </div>

      {/* Skeleton for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#1a1c25] rounded-xl h-80 animate-pulse border border-[rgba(255,255,255,0.07)]"></div>
        <div className="bg-[#1a1c25] rounded-xl h-80 animate-pulse border border-[rgba(255,255,255,0.07)]"></div>
      </div>

      {/* Skeleton for Heatmap */}
      <div className="bg-[#1a1c25] rounded-xl h-48 animate-pulse border border-[rgba(255,255,255,0.07)]"></div>

      {/* Skeleton for Table */}
      <div className="bg-[#1a1c25] rounded-xl h-96 animate-pulse border border-[rgba(255,255,255,0.07)]"></div>
    </div>
  )
}
