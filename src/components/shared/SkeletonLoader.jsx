import './SkeletonLoader.css'

export default function SkeletonLoader({ variant = 'text', width, height, className = '' }) {
  const style = { width, height }
  
  if (variant === 'card') {
    return <div className={`skeleton-card skeleton-shimmer ${className}`} style={style} />
  }

  if (variant === 'list') {
    return (
      <div className={`skeleton-list ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton-list-item skeleton-shimmer" style={style} />
        ))}
      </div>
    )
  }

  if (variant === 'avatar') {
    return <div className={`skeleton-avatar skeleton-shimmer ${className}`} style={style} />
  }

  return <div className={`skeleton-text skeleton-shimmer ${className}`} style={style} />
}
