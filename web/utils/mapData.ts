// 시각적 블럭 (더 이상 사용 안 함 - 건물로 대체)
export const VISIBLE_BLOCKS: [number, number, number, number, number, number][] = []

// 건물 충돌 박스 (도로 위에 없음)
const BUILDING_COLLISIONS: [number, number, number, number, number, number][] = [
  [12, 0, 8, 5, 8, 4],
  [-12, 0, 15, 5, 10, 4],
  [8, 0, -18, 4, 6, 4],
  [-15, 0, -15, 5, 12, 4],
  [18, 0, -10, 4, 7, 4],
  [12, 0, 20, 4, 5, 4],
  [-18, 0, 22, 4, 6, 4],
  [22, 0, 22, 5, 9, 4],
  [28, 0, -22, 5, 8, 4],
  [-28, 0, 8, 6, 7, 4],
  [8, 0, 28, 5, 6, 4],
  [-22, 0, -22, 4, 5, 4],
  [22, 0, -28, 6, 5, 4],
  [35, 0, 12, 4, 14, 4],
  [-35, 0, -12, 4, 5, 4],
  [12, 0, 35, 4, 7, 4],
  [-12, 0, -35, 4, 6, 4],
  [35, 0, 35, 5, 8, 4],
  [-35, 0, 28, 4, 6, 4],
  [38, 0, -28, 5, 7, 4],
  [-38, 0, -18, 4, 8, 4],
  [8, 0, -38, 5, 6, 4],
]

// 가로등 충돌
const LAMP_COLLISIONS: [number, number, number, number, number, number][] =
  [-40, -28, -16, -4, 8, 20, 32, 44].flatMap(v => [
    [4.5, 0, v, 0.3, 4, 0.3] as [number, number, number, number, number, number],
    [-4.5, 0, v, 0.3, 4, 0.3] as [number, number, number, number, number, number],
    [v, 0, 4.5, 0.3, 4, 0.3] as [number, number, number, number, number, number],
    [v, 0, -4.5, 0.3, 4, 0.3] as [number, number, number, number, number, number],
  ])

export const MAP_BLOCKS: [number, number, number, number, number, number][] = [
  ...BUILDING_COLLISIONS,
  ...LAMP_COLLISIONS,
]

export const MAP_LIMIT = 48

export const GAME_SPACES = [
  { id: 'roulette', name: 'Casino Roulette', position: [12, 0, 8] as [number, number, number], route: '/space/roulette', radius: 4 },
  { id: 'slot', name: 'Slot Machine 777', position: [-12, 0, 15] as [number, number, number], route: '/space/slot', radius: 4 },
  { id: 'mines', name: 'Mines 💎', position: [8, 0, -18] as [number, number, number], route: '/space/mines', radius: 4 },
  { id: 'crash', name: 'Crash 🚀', position: [-15, 0, -15] as [number, number, number], route: '/space/crash', radius: 4 },
  { id: 'hilo', name: 'Hi-Lo 🃏', position: [18, 0, -10] as [number, number, number], route: '/space/hilo', radius: 4 },
  { id: 'coinflip', name: 'Coin Flip 🪙', position: [12, 0, 20] as [number, number, number], route: '/space/coinflip', radius: 4 },
  { id: 'dice', name: 'Dice 🎲', position: [-18, 0, 22] as [number, number, number], route: '/space/dice', radius: 4 },
  { id: 'wheel', name: 'Fortune Wheel 🎡', position: [22, 0, 22] as [number, number, number], route: '/space/wheel', radius: 4 },
  { id: 'plinko', name: 'Plinko 📐', position: [28, 0, -22] as [number, number, number], route: '/space/plinko', radius: 4 },
  { id: 'blackjack', name: 'Blackjack 🃏', position: [-28, 0, 8] as [number, number, number], route: '/space/blackjack', radius: 4 },
  { id: 'baccarat', name: 'Baccarat 🃏', position: [8, 0, 28] as [number, number, number], route: '/space/baccarat', radius: 4 },
  { id: 'rps', name: 'RPS ✊', position: [-22, 0, -22] as [number, number, number], route: '/space/rps', radius: 4 },
  { id: 'horserace', name: 'Horse Race 🏇', position: [22, 0, -28] as [number, number, number], route: '/space/horserace', radius: 4 },
  { id: 'tower', name: 'Tower 🏗️', position: [35, 0, 12] as [number, number, number], route: '/space/tower', radius: 4 },
  { id: 'scratch', name: 'Scratch Card 🎫', position: [-35, 0, -12] as [number, number, number], route: '/space/scratch', radius: 4 },
  { id: 'limbo', name: 'Limbo 🎯', position: [12, 0, 35] as [number, number, number], route: '/space/limbo', radius: 4 },
  { id: 'colorpredict', name: 'Color Predict 🎨', position: [-12, 0, -35] as [number, number, number], route: '/space/colorpredict', radius: 4 },
  { id: 'bombdefuse', name: 'Bomb Defuse 💣', position: [35, 0, 35] as [number, number, number], route: '/space/bombdefuse', radius: 4 },
  { id: 'keno', name: 'Keno 🎱', position: [-35, 0, 28] as [number, number, number], route: '/space/keno', radius: 4 },
  { id: 'war', name: 'War ⚔️', position: [38, 0, -28] as [number, number, number], route: '/space/war', radius: 4 },
  { id: 'numberguess', name: 'Number Guess 🔢', position: [-38, 0, -18] as [number, number, number], route: '/space/numberguess', radius: 4 },
  { id: 'wheelofdeath', name: 'Wheel of Death 🔫', position: [8, 0, -38] as [number, number, number], route: '/space/wheelofdeath', radius: 4 },
]

// AABB 충돌 체크
export function resolveCollisions(
  pos: { x: number; y: number; z: number },
  prevPos: { x: number; y: number; z: number },
  charRadius: number,
  charHeight: number,
): { x: number; y: number; z: number; onBlock: boolean } {
  let onBlock = false
  let resultY = pos.y

  for (const [bx, by, bz, bw, bh, bd] of MAP_BLOCKS) {
    const halfW = bw / 2
    const halfD = bd / 2
    const blockTop = by + bh
    const blockMinX = bx - halfW
    const blockMaxX = bx + halfW
    const blockMinZ = bz - halfD
    const blockMaxZ = bz + halfD

    const inX = pos.x + charRadius > blockMinX && pos.x - charRadius < blockMaxX
    const inZ = pos.z + charRadius > blockMinZ && pos.z - charRadius < blockMaxZ
    if (!inX || !inZ) continue

    const charBottom = pos.y
    const charTop = pos.y + charHeight
    const overlapsY = charBottom < blockTop && charTop > by
    if (!overlapsY) continue

    if (prevPos.y >= blockTop - 0.15 && pos.y <= blockTop) {
      resultY = Math.max(resultY, blockTop)
      onBlock = true
      continue
    }

    const prevInX = prevPos.x + charRadius > blockMinX && prevPos.x - charRadius < blockMaxX
    const prevInZ = prevPos.z + charRadius > blockMinZ && prevPos.z - charRadius < blockMaxZ
    if (!prevInX) pos.x = pos.x > bx ? blockMaxX + charRadius : blockMinX - charRadius
    if (!prevInZ) pos.z = pos.z > bz ? blockMaxZ + charRadius : blockMinZ - charRadius
  }

  return { x: pos.x, y: resultY, z: pos.z, onBlock }
}
