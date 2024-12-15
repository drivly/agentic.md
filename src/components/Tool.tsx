import type { ReactNode } from 'react'

export interface ToolProps {
  name: string
  description?: string
  usage?: string
  children?: ReactNode
}

export function Tool({ name, description, usage, children }: ToolProps) {
  return (
    <div className="tool">
      <h3>{name}</h3>
      {description && <p>{description}</p>}
      {usage && (
        <div className="usage">
          <h4>Usage:</h4>
          <pre>{usage}</pre>
        </div>
      )}
      {children}
    </div>
  )
}
