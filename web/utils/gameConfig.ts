/**
 * 게임 설정 상수
 * 모든 게임의 확률/배당/설정을 한 곳에서 관리
 */

export const GAME_CONFIG = {
  // === 전역 설정 ===
  global: {
    WIN_RATE: 0.49, // 유저 기본 승률 49%
    HOUSE_EDGE: 0.02, // 하우스 엣지 2%
    DEFAULT_BET_OPTIONS: [100, 500, 1000, 2000],
    MIN_BET: 1,
    MAX_BET: 100000,
  },

  // === 카지노 게임 ===
  roulette: {
    numbers: 37, // 0~36
    straightUp: 36, // 숫자 직접 배당
    outsideBet: 2, // 레드/블랙/홀짝 배당
  },

  slot: {
    cols: 5,
    rows: 5,
    lines: 9,
    jackpotMult: 500,
    matchBonus: { 3: 1, 4: 3, 5: 10 },
    autoSpeedOptions: [1, 2, 3, 5],
    symbols: ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣', '⭐'],
    symbolWeights: [6, 5, 5, 4, 3, 2, 1, 1], // 총 27
    symbolMult: { '🍒': 2, '🍋': 3, '🍊': 4, '🍇': 6, '🔔': 10, '⭐': 15, '💎': 25, '7️⃣': 50 },
  },

  mines: {
    grid: 5,
    mineOptions: [1, 3, 5, 7, 10],
  },

  crash: {
    instantCrashRate: 0.04, // 4% 즉사
    maxMult: 1000,
    autoCashOutOptions: [0, 1.5, 2, 3, 5, 10],
  },

  hilo: {
    streakMultBase: 0.8, // 연승당 +0.8x
  },

  coinFlip: {
    mult: 2,
  },

  dice: {
    betTypes: ['over', 'under', 'exact'] as const,
    exactMult: 6,
  },

  fortuneWheel: {
    segments: 16,
    minSpins: 7,
    maxSpins: 10,
    spinDurationBase: 5, // 초
    mults: [1, 2, 1, 3, 1, 2, 1, 5, 1, 2, 1, 10, 1, 2, 1, 20],
  },

  plinko: {
    rows: 10,
    ballCountOptions: [1, 3, 5, 10, 20],
    mults: [8, 4, 2, 1.5, 1, 0.5, 1, 1.5, 2, 4, 8],
  },

  blackjack: {
    bjMult: 2.5,
    dealerStandAt: 17,
  },

  baccarat: {
    playerMult: 2,
    bankerMult: 1.95, // 5% 커미션
    tieMult: 9,
  },

  // === 아케이드 게임 ===
  rps: {
    streakMultBase: 0.5,
  },

  horseRace: {
    horses: [
      { name: 'THUNDER', odds: 2.5 },
      { name: 'STORM', odds: 3.0 },
      { name: 'SHADOW', odds: 4.0 },
      { name: 'BLAZE', odds: 5.0 },
      { name: 'SPIRIT', odds: 8.0 },
    ],
  },

  tower: {
    floors: 8,
    cols: 3,
    mults: [1.4, 2, 3, 4.5, 7, 11, 17, 25],
  },

  scratchCard: {
    gridSize: 9,
    winRate: 0.25, // 25% 3매치 보장
    symbols: ['🍒', '💎', '7️⃣', '⭐', '🔔', '👑'],
    symbolMult: { '🍒': 2, '💎': 10, '7️⃣': 25, '⭐': 5, '🔔': 3, '👑': 50 },
  },

  limbo: {
    minTarget: 1.1,
    maxTarget: 100,
  },

  colorPredict: {
    colors: [
      { id: 'red', mult: 2, weight: 45 },
      { id: 'green', mult: 3, weight: 35 },
      { id: 'purple', mult: 5, weight: 20 },
    ],
  },

  bombDefuse: {
    wires: 5,
    mults: [1.5, 2.5, 4, 7, 15],
  },

  keno: {
    total: 40,
    drawCount: 10,
    maxPicks: 10,
    payouts: { 0: 0, 1: 0, 2: 1, 3: 2, 4: 5, 5: 12, 6: 30, 7: 80, 8: 200, 9: 500, 10: 2000 } as Record<number, number>,
  },

  war: {
    winMult: 2,
    tieMult: 1.5,
  },

  numberGuess: {
    range: [1, 100],
    maxAttempts: 10,
    payouts: { 3: 5, 5: 3, 7: 2, 10: 1.2 } as Record<number, number>, // 3회 이내=x5, 5회=x3...
  },

  wheelOfDeath: {
    chambers: 6,
    mults: [1.5, 2, 3, 5, 10, 25],
  },
} as const
