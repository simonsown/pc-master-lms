// Path: app/(dashboard)/parent/dashboard/loading.tsx
export default function ParentDashboardLoading() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skeleton animate-pulse" style={{ height: '32px', width: '250px', background: '#1d1f2a', borderRadius: '8px' }} />
          <div className="skeleton animate-pulse" style={{ height: '18px', width: '180px', background: '#1d1f2a', borderRadius: '6px' }} />
        </div>
        <div className="skeleton animate-pulse" style={{ height: '32px', width: '120px', background: '#1d1f2a', borderRadius: '50px' }} />
      </div>

      {/* Child Card Skeleton */}
      <div className="skeleton animate-pulse" style={{ 
        height: '112px', 
        background: '#1d1f2a', 
        borderRadius: '24px', 
        display: 'flex', 
        padding: '24px',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#2e3048' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ height: '20px', width: '180px', background: '#2e3048', borderRadius: '6px' }} />
          <div style={{ height: '14px', width: '240px', background: '#2e3048', borderRadius: '4px' }} />
        </div>
      </div>

      {/* Grid Stats Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton animate-pulse" style={{ height: '96px', background: '#1d1f2a', borderRadius: '18px' }} />
        ))}
      </div>

      {/* Activity Log Skeleton */}
      <div className="skeleton animate-pulse" style={{ height: '350px', background: '#1d1f2a', borderRadius: '24px' }} />

      <style dangerouslySetInnerHTML={{ __html: `
        .skeleton {
          position: relative;
          overflow: hidden;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
        .animate-pulse {
          animation: pulse 1.8s infinite ease-in-out;
        }
      ` }} />

    </div>
  )
}
