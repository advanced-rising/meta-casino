const MONEY_KEY = 'meta-casino-money'
const LAST_CHARGE_KEY = 'meta-casino-last-charge'
const DEFAULT_MONEY = 10000
const CHARGE_AMOUNT = 5000
const CHARGE_INTERVAL_MS = 60 * 60 * 1000 // 1시간

export const getMoney = (): number => {
  if (typeof window === 'undefined') return DEFAULT_MONEY
  const stored = localStorage.getItem(MONEY_KEY)
  if (stored === null) {
    localStorage.setItem(MONEY_KEY, String(DEFAULT_MONEY))
    return DEFAULT_MONEY
  }
  return parseInt(stored, 10)
}

export const setMoney = (amount: number): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(MONEY_KEY, String(Math.max(0, amount)))
}

export const addMoney = (amount: number): number => {
  const current = getMoney()
  const next = current + amount
  setMoney(next)
  return next
}

export const subtractMoney = (amount: number): number => {
  const current = getMoney()
  const next = Math.max(0, current - amount)
  setMoney(next)
  return next
}

export const resetMoney = (): void => {
  setMoney(DEFAULT_MONEY)
}

/** 시간 기반 충전 체크 - 1시간 경과 시 CHARGE_AMOUNT 지급 */
export const checkAndCharge = (): { charged: boolean; amount: number; nextChargeMs: number } => {
  if (typeof window === 'undefined') return { charged: false, amount: 0, nextChargeMs: CHARGE_INTERVAL_MS }

  const now = Date.now()
  const lastCharge = localStorage.getItem(LAST_CHARGE_KEY)
  const lastChargeTime = lastCharge ? parseInt(lastCharge, 10) : 0

  const elapsed = now - lastChargeTime
  if (elapsed >= CHARGE_INTERVAL_MS) {
    addMoney(CHARGE_AMOUNT)
    localStorage.setItem(LAST_CHARGE_KEY, String(now))
    return { charged: true, amount: CHARGE_AMOUNT, nextChargeMs: CHARGE_INTERVAL_MS }
  }

  return { charged: false, amount: 0, nextChargeMs: CHARGE_INTERVAL_MS - elapsed }
}

/** 다음 충전까지 남은 시간 (ms) */
export const getTimeUntilNextCharge = (): number => {
  if (typeof window === 'undefined') return CHARGE_INTERVAL_MS
  const lastCharge = localStorage.getItem(LAST_CHARGE_KEY)
  if (!lastCharge) return 0 // 즉시 충전 가능
  const elapsed = Date.now() - parseInt(lastCharge, 10)
  return Math.max(0, CHARGE_INTERVAL_MS - elapsed)
}

export const CHARGE_CONFIG = {
  amount: CHARGE_AMOUNT,
  intervalMs: CHARGE_INTERVAL_MS,
}
