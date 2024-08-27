import * as React from "react"

export interface AlertProps {
  children: React.ReactNode
}

export function Alert({ children }: AlertProps) {
  return <div role="alert">{children}</div>
}

export function AlertTitle({ children }: { children: React.ReactNode }) {
  return <h5>{children}</h5>
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}