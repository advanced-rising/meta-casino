// 시각적으로 보이는 장애물 블럭 (SimpleBox로 렌더링)
export const VISIBLE_BLOCKS: [number, number, number, number, number, number][] = [
  [-4, 0, 4, 2, 1, 2],
  [4, 0, 5, 1.5, 1.5, 1.3],
  [6, 0, -6, 1.5, 1, 1.3],
  [-6, 0, -4, 2, 0.8, 2],
  [-18, 0, 18, 2, 0.5, 2],
  [-18, 0.5, 16, 2, 0.5, 2],
  [-18, 1, 14, 2, 0.5, 2],
]

// 전체 충돌 블럭 (보이는 블럭 + 보이지 않는 충돌용)
export const MAP_BLOCKS: [number, number, number, number, number, number][] = [
  // 보이는 장애물
  ...VISIBLE_BLOCKS,
  // 높은 전망대
  [30, 3, 30, 5, 0.3, 5],
  [-30, 3, -30, 5, 0.3, 5],
  // 중간 플랫폼
  [35, 1.5, -10, 3, 0.3, 3],
  [-35, 1.5, 10, 3, 0.3, 3],
  // 전망대 기둥
  [28, 0, 28, 0.4, 3, 0.4], [32, 0, 28, 0.4, 3, 0.4],
  [28, 0, 32, 0.4, 3, 0.4], [32, 0, 32, 0.4, 3, 0.4],
  [-32, 0, -32, 0.4, 3, 0.4], [-28, 0, -32, 0.4, 3, 0.4],
  [-32, 0, -28, 0.4, 3, 0.4], [-28, 0, -28, 0.4, 3, 0.4],

  // === 조형물 충돌 ===
  // 중앙 분수
  [0, 0, 0, 3.2, 1.5, 3.2],
  // 게임장 랜드마크
  [15, 0, 0, 2.2, 1.5, 2.2],     // 룰렛
  [-15, 0, 15, 1.6, 2.5, 1.2],   // 슬롯
  [0, 0, -18, 1.8, 2, 1.8],      // 마인즈
  [-18, 0, -12, 2, 1.5, 2],      // 크래시
  [18, 0, -15, 1.4, 1.5, 1.4],   // 하이로
  [15, 0, 18, 1.4, 1.5, 1.4],    // 코인플립
  [-20, 0, 20, 1.6, 1.5, 1.6],   // 다이스
  [20, 0, 20, 0.6, 3, 0.6],      // 포춘휠
  [30, 0, -20, 2, 2.5, 0.5],     // 플링코
  [-30, 0, 0, 2.4, 1.5, 2.4],    // 블랙잭
  [0, 0, 25, 2.4, 1.5, 2.4],     // 바카라
  [-25, 0, -25, 1.6, 1.5, 1.6],  // 가위바위보
  [25, 0, -25, 2.4, 1.5, 2.4],   // 경마
  [35, 0, 10, 1.5, 2, 1.5],      // 타워
  [-35, 0, -10, 1.5, 1.5, 1.5],  // 스크래치
  [10, 0, 35, 1.5, 1.5, 1.5],    // 림보
  [-10, 0, -35, 1.5, 1.5, 1.5],  // 컬러프레딕트
  [35, 0, 35, 1.5, 1.5, 1.5],    // 폭탄해체

  // 동상 (교차로 4개)
  [20, 0, 20, 1.2, 2.5, 1.2],
  [-20, 0, 20, 1.2, 2.5, 1.2],
  [20, 0, -20, 1.2, 2.5, 1.2],
  [-20, 0, -20, 1.2, 2.5, 1.2],

  // 나무 (주요 위치, 반경 0.4)
  ...[
    [25,10],[-25,10],[0,30],[-15,-25],[10,-30],
    [35,-20],[-35,-30],[20,25],[-30,25],[40,15],[-10,-40],[30,-35],[-40,0],[0,40],[42,-5],
    [4,12],[4,24],[4,36],[-4,-12],[-4,-24],[-4,-36],
    [12,4],[24,4],[36,4],[-12,-4],[-24,-4],[-36,-4],
  ].map(([x,z]): [number,number,number,number,number,number] => [x, 0, z, 0.5, 2.5, 0.5]),

  // 가로등 (16개)
  ...[-44,-32,-20,-8,8,20,32,44].flatMap((v): [number,number,number,number,number,number][] => [
    [2, 0, v, 0.3, 3, 0.3],
    [v, 0, 2, 0.3, 3, 0.3],
  ]),

  // 아치 게이트 기둥 (8개)
  [-1.2, 0, 45, 0.3, 3, 0.3], [1.2, 0, 45, 0.3, 3, 0.3],
  [-1.2, 0, -45, 0.3, 3, 0.3], [1.2, 0, -45, 0.3, 3, 0.3],
  [45, 0, -1.2, 0.3, 3, 0.3], [45, 0, 1.2, 0.3, 3, 0.3],
  [-45, 0, -1.2, 0.3, 3, 0.3], [-45, 0, 1.2, 0.3, 3, 0.3],

  // 벤치 (대략적 바운딩)
  ...[8,-8,20,-20,32,-32].flatMap((v): [number,number,number,number,number,number][] => [
    [4, 0, v, 1.3, 0.7, 0.5],
    [v, 0, 4, 0.5, 0.7, 1.3],
  ]),
]

export const MAP_LIMIT = 48

// 게임장 위치
export const GAME_SPACES = [
  { id: 'roulette', name: 'Casino Roulette', position: [15, 0, 0] as [number, number, number], route: '/space/roulette', radius: 3 },
  { id: 'slot', name: 'Slot Machine 777', position: [-15, 0, 15] as [number, number, number], route: '/space/slot', radius: 3 },
  { id: 'mines', name: 'Mines 💎💣', position: [0, 0, -18] as [number, number, number], route: '/space/mines', radius: 3 },
  { id: 'crash', name: 'Crash 🚀', position: [-18, 0, -12] as [number, number, number], route: '/space/crash', radius: 3 },
  { id: 'hilo', name: 'Hi-Lo 🃏', position: [18, 0, -15] as [number, number, number], route: '/space/hilo', radius: 3 },
  { id: 'coinflip', name: 'Coin Flip 🪙', position: [15, 0, 18] as [number, number, number], route: '/space/coinflip', radius: 3 },
  { id: 'dice', name: 'Dice 🎲', position: [-20, 0, 20] as [number, number, number], route: '/space/dice', radius: 3 },
  { id: 'wheel', name: 'Fortune Wheel 🎡', position: [20, 0, 20] as [number, number, number], route: '/space/wheel', radius: 3 },
  { id: 'plinko', name: 'Plinko 📐', position: [30, 0, -20] as [number, number, number], route: '/space/plinko', radius: 3 },
  { id: 'blackjack', name: 'Blackjack 🃏', position: [-30, 0, 0] as [number, number, number], route: '/space/blackjack', radius: 3 },
  { id: 'baccarat', name: 'Baccarat 🃏', position: [0, 0, 25] as [number, number, number], route: '/space/baccarat', radius: 3 },
  { id: 'rps', name: 'Rock Paper Scissors ✊', position: [-25, 0, -25] as [number, number, number], route: '/space/rps', radius: 3 },
  { id: 'horserace', name: 'Horse Race 🏇', position: [25, 0, -25] as [number, number, number], route: '/space/horserace', radius: 3 },
  { id: 'tower', name: 'Tower 🏗️', position: [35, 0, 10] as [number, number, number], route: '/space/tower', radius: 3 },
  { id: 'scratch', name: 'Scratch Card 🎫', position: [-35, 0, -10] as [number, number, number], route: '/space/scratch', radius: 3 },
  { id: 'limbo', name: 'Limbo 🎯', position: [10, 0, 35] as [number, number, number], route: '/space/limbo', radius: 3 },
  { id: 'colorpredict', name: 'Color Predict 🎨', position: [-10, 0, -35] as [number, number, number], route: '/space/colorpredict', radius: 3 },
  { id: 'bombdefuse', name: 'Bomb Defuse 💣', position: [35, 0, 35] as [number, number, number], route: '/space/bombdefuse', radius: 3 },
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

    // 캐릭터 바닥~상단이 블럭과 겹치는지
    const charBottom = pos.y
    const charTop = pos.y + charHeight
    const overlapsY = charBottom < blockTop && charTop > by

    if (!overlapsY) continue

    // 위에서 착지 (이전 프레임에서 블럭 위에 있었고, 내려오는 중)
    if (prevPos.y >= blockTop - 0.15 && pos.y <= blockTop) {
      resultY = Math.max(resultY, blockTop)
      onBlock = true
      continue
    }

    // 옆면 충돌 (점프 중이든 걸어가든)
    const prevInX = prevPos.x + charRadius > blockMinX && prevPos.x - charRadius < blockMaxX
    const prevInZ = prevPos.z + charRadius > blockMinZ && prevPos.z - charRadius < blockMaxZ

    if (!prevInX) {
      pos.x = pos.x > bx ? blockMaxX + charRadius : blockMinX - charRadius
    }
    if (!prevInZ) {
      pos.z = pos.z > bz ? blockMaxZ + charRadius : blockMinZ - charRadius
    }
  }

  return { x: pos.x, y: resultY, z: pos.z, onBlock }
}
