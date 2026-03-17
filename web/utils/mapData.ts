// 맵 내 블럭 정의: [x, y(바닥), z, width, height, depth]
export const MAP_BLOCKS: [number, number, number, number, number, number][] = [
  [-5, 0, 0, 2, 1, 2],
  [5, 0, -3, 1.5, 2, 1.3],
  [0, 0, -8, 1.5, 1, 1.3],
  [-3, 0, 5, 3, 1, 1.3],
  // 계단식
  [-10, 0, -8, 2, 0.5, 2],
  [-10, 0.5, -6, 2, 0.5, 2],
  [-10, 1, -4, 2, 0.5, 2],
]

export const MAP_LIMIT = 48

// 게임장 위치
export const GAME_SPACES = [
  { id: 'roulette', name: 'Casino Roulette', position: [10, 0, 0] as [number, number, number], route: '/space/roulette', radius: 3 },
  { id: 'slot', name: 'Slot Machine 777', position: [-10, 0, 10] as [number, number, number], route: '/space/slot', radius: 3 },
  { id: 'mines', name: 'Mines 💎💣', position: [0, 0, -12] as [number, number, number], route: '/space/mines', radius: 3 },
  { id: 'crash', name: 'Crash 🚀', position: [-12, 0, -5] as [number, number, number], route: '/space/crash', radius: 3 },
]

// AABB 충돌 체크: 캐릭터를 점+높이로 간소화
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

    // 캐릭터가 블럭 X/Z 범위 안에 있는지
    const inX = pos.x + charRadius > blockMinX && pos.x - charRadius < blockMaxX
    const inZ = pos.z + charRadius > blockMinZ && pos.z - charRadius < blockMaxZ

    if (!inX || !inZ) continue

    // 위에서 내려오는 경우 (블럭 위에 착지)
    if (prevPos.y >= blockTop - 0.1 && pos.y <= blockTop) {
      resultY = Math.max(resultY, blockTop)
      onBlock = true
      continue
    }

    // 옆에서 부딪히는 경우 (수평 충돌)
    if (pos.y < blockTop && pos.y + charHeight > by) {
      // X축 밀어내기
      const prevInX = prevPos.x + charRadius > blockMinX && prevPos.x - charRadius < blockMaxX
      const prevInZ = prevPos.z + charRadius > blockMinZ && prevPos.z - charRadius < blockMaxZ

      if (!prevInX) {
        // X축에서 들어옴 → X축으로 밀어내기
        if (pos.x > bx) {
          pos.x = blockMaxX + charRadius
        } else {
          pos.x = blockMinX - charRadius
        }
      }
      if (!prevInZ) {
        // Z축에서 들어옴 → Z축으로 밀어내기
        if (pos.z > bz) {
          pos.z = blockMaxZ + charRadius
        } else {
          pos.z = blockMinZ - charRadius
        }
      }
    }
  }

  return { x: pos.x, y: resultY, z: pos.z, onBlock }
}
