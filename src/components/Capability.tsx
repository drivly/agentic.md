import React, { ReactNode } from 'react'

export interface CapabilityProps {
  name: string
  description?: string
  children?: ReactNode
}

export function Capability({ name, description, children }: CapabilityProps) {
  return (
    <div className="capability">
      <h3>{name}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  )
}
