const PREFIX = 'meta-casino-history-'

export function loadHistory<T>(gameId: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PREFIX + gameId)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveHistory<T>(gameId: string, history: T[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PREFIX + gameId, JSON.stringify(history.slice(0, 50)))
  } catch {}
}
