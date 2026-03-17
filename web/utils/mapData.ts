// 맵 내 블럭 정의: [x, y(바닥), z, width, height, depth]
export const MAP_BLOCKS: [number, number, number, number, number, number][] = [
  // 중앙 근처 장애물
  [-4, 0, 4, 2, 1, 2],
  [4, 0, 5, 1.5, 1.5, 1.3],
  [6, 0, -6, 1.5, 1, 1.3],
  [-6, 0, -4, 2, 0.8, 2],
  // 계단식 (남서쪽)
  [-18, 0, 18, 2, 0.5, 2],
  [-18, 0.5, 16, 2, 0.5, 2],
  [-18, 1, 14, 2, 0.5, 2],
]

export const MAP_LIMIT = 48

// 게임장 위치 (서로 충분히 떨어지게)
export const GAME_SPACES = [
  { id: 'roulette', name: 'Casino Roulette', position: [15, 0, 0] as [number, number, number], route: '/space/roulette', radius: 3 },
  { id: 'slot', name: 'Slot Machine 777', position: [-15, 0, 15] as [number, number, number], route: '/space/slot', radius: 3 },
  { id: 'mines', name: 'Mines 💎💣', position: [0, 0, -18] as [number, number, number], route: '/space/mines', radius: 3 },
  { id: 'crash', name: 'Crash 🚀', position: [-18, 0, -12] as [number, number, number], route: '/space/crash', radius: 3 },
  { id: 'hilo', name: 'Hi-Lo 🃏', position: [18, 0, -15] as [number, number, number], route: '/space/hilo', radius: 3 },
  { id: 'coinflip', name: 'Coin Flip 🪙', position: [15, 0, 18] as [number, number, number], route: '/space/coinflip', radius: 3 },
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

    if (prevPos.y >= blockTop - 0.1 && pos.y <= blockTop) {
      resultY = Math.max(resultY, blockTop)
      onBlock = true
      continue
    }

    if (pos.y < blockTop && pos.y + charHeight > by) {
      const prevInX = prevPos.x + charRadius > blockMinX && prevPos.x - charRadius < blockMaxX
      const prevInZ = prevPos.z + charRadius > blockMinZ && prevPos.z - charRadius < blockMaxZ

      if (!prevInX) {
        pos.x = pos.x > bx ? blockMaxX + charRadius : blockMinX - charRadius
      }
      if (!prevInZ) {
        pos.z = pos.z > bz ? blockMaxZ + charRadius : blockMinZ - charRadius
      }
    }
  }

  return { x: pos.x, y: resultY, z: pos.z, onBlock }
}
