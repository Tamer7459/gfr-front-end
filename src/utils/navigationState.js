'use client'

// Small client-only store to pass transient navigation payloads
// (replaces react-router's location.state in Next.js App Router)
let pendingTargetUser = null

export function setPendingTargetUser(user) {
  pendingTargetUser = user
}

export function consumePendingTargetUser() {
  const value = pendingTargetUser
  pendingTargetUser = null
  return value
}

export function peekPendingTargetUser() {
  return pendingTargetUser
}
