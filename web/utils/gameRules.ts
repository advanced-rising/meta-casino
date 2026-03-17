/**
 * 게임 규칙 및 확률 관리
 * 모든 게임의 유저 승률: 49% (하우스 엣지 2%)
 */

export class GameRules {
  // 하우스 엣지: 유저 승률 49%
  static readonly WIN_RATE = 0.49
  static readonly HOUSE_EDGE = 0.02

  /**
   * 승/패 판정 (49% 승률)
   * @returns true = 유저 승리
   */
  static shouldWin(): boolean {
    return Math.random() < this.WIN_RATE
  }

  /**
   * 가중치 기반 랜덤 (배열에서 인덱스 선택)
   * weights 합이 1이 아니어도 됨
   */
  static weightedRandom(weights: number[]): number {
    const total = weights.reduce((s, w) => s + w, 0)
    let r = Math.random() * total
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i]
      if (r <= 0) return i
    }
    return weights.length - 1
  }

  /**
   * 코인플립: 49% 승률
   */
  static coinFlip(choice: 'heads' | 'tails'): 'heads' | 'tails' {
    const win = this.shouldWin()
    return win ? choice : (choice === 'heads' ? 'tails' : 'heads')
  }

  /**
   * 크래시 포인트 생성 (하우스 엣지 반영)
   * 평균 RTP ~98%
   */
  static generateCrashPoint(): number {
    const r = Math.random()
    if (r < 0.04) return 1.0 // 4% 즉사
    return Math.max(1.0, Math.floor(100 / (r * 100)) * 100) / 100
  }

  /**
   * 다이스: target에 대해 49% 승률 보정
   */
  static diceResult(): [number, number] {
    return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]
  }

  /**
   * 컬러 프레딕트: 가중치 (빨 45%, 초 35%, 보 20%)
   */
  static colorPredictResult(): number {
    return this.weightedRandom([45, 35, 20])
  }

  /**
   * 마인즈: 지뢰 배치 (완전 랜덤)
   */
  static placeMines(total: number, mineCount: number): Set<number> {
    const mines = new Set<number>()
    while (mines.size < mineCount) mines.add(Math.floor(Math.random() * total))
    return mines
  }

  /**
   * 슬롯 심볼 (가중치 풀에서 선택)
   */
  static slotSymbol(pool: string[]): string {
    return pool[Math.floor(Math.random() * pool.length)]
  }

  /**
   * 카드 덱에서 랜덤 카드
   */
  static drawCard(ranks: string[], suits: string[]): { rank: string; suit: string } {
    return {
      rank: ranks[Math.floor(Math.random() * ranks.length)],
      suit: suits[Math.floor(Math.random() * suits.length)],
    }
  }

  /**
   * 경마: 각 말의 스피드 (높은 배당 말일수록 낮은 확률)
   * odds가 낮을수록 빠름
   */
  static horseSpeed(odds: number): number {
    const baseSpeed = 3 / odds // 배당 낮으면 빠름
    return baseSpeed + Math.random() * 2
  }

  /**
   * 룰렛 번호 (37개: 0~36)
   */
  static rouletteNumber(): number {
    return Math.floor(Math.random() * 37)
  }

  /**
   * 포춘 휠: 최소 회전수 보장
   * @param minSpins 최소 바퀴 수
   * @param segments 세그먼트 수
   */
  static fortuneWheelAngle(minSpins: number = 5, segments: number = 16): { angle: number; segIndex: number } {
    const segIndex = Math.floor(Math.random() * segments)
    const segAngle = (segIndex / segments) * 360
    const spins = minSpins + Math.floor(Math.random() * 3)
    const angle = spins * 360 + segAngle
    return { angle, segIndex }
  }

  /**
   * 타워: 각 층 함정 위치 (cols 중 1개)
   */
  static towerTraps(floors: number, cols: number): number[] {
    return Array.from({ length: floors }, () => Math.floor(Math.random() * cols))
  }

  /**
   * 폭탄 해제: 폭탄 와이어 위치
   */
  static bombWire(wireCount: number): number {
    return Math.floor(Math.random() * wireCount)
  }

  /**
   * 림보: 결과 배수 생성
   */
  static limboResult(): number {
    const r = Math.random()
    return Math.max(1, Math.round((1 / (r + 0.01)) * 100) / 100)
  }

  /**
   * 케노: 추첨 번호 생성
   */
  static kenoDraw(total: number, drawCount: number): Set<number> {
    const nums = new Set<number>()
    while (nums.size < drawCount) nums.add(Math.floor(Math.random() * total) + 1)
    return nums
  }

  /**
   * 넘버 게스 힌트
   */
  static numberGuessTarget(min: number = 1, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 휠 오브 데스: 탄환 위치
   */
  static chamberBullet(chambers: number): number {
    return Math.floor(Math.random() * chambers)
  }

  /**
   * 스크래치 카드: 25% 3매치 보장
   */
  static scratchCard(symbols: string[], gridSize: number): string[] {
    const card = Array.from({ length: gridSize }, () => symbols[Math.floor(Math.random() * symbols.length)])
    if (Math.random() < 0.25) {
      const winner = symbols[Math.floor(Math.random() * symbols.length)]
      const positions = Array.from({ length: gridSize }, (_, i) => i).sort(() => Math.random() - 0.5).slice(0, 3)
      positions.forEach(p => { card[p] = winner })
    }
    return card
  }
}
