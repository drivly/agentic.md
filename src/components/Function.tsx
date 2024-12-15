import 'react'
import type { ReactNode } from 'react'

export interface FunctionProps {
  name: string
  description?: string
  parameters?: Record<string, unknown>
  children?: ReactNode
}

export function Function({ name, description, parameters, children }: FunctionProps) {
  return (
    <div className="function">
      <h3>{name}</h3>
      {description && <p>{description}</p>}
      {parameters && (
        <div className="parameters">
          <h4>Parameters:</h4>
          <pre>{JSON.stringify(parameters, null, 2)}</pre>
        </div>
      )}
      {children}
    </div>
  )
}
