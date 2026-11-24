import { MathUtils } from 'three'

export type Pose = {
  pos: [number, number, number]
  rot: [number, number, number]
  s: number
  camZ: number
  camY: number
}

// Ключевые кадры по главам (индекс = номер главы). Правь здесь — меняется вся хореография.
// Порядок: hero, дисплей, корпус, вода, горы, рука, параметры, покупка
export const POSES: Pose[] = [
  { pos: [1.9, -0.1, 0], rot: [0.35, -0.7, 0.08], s: 1.0, camZ: 6.2, camY: 0.1 },
  { pos: [1.8, 0, 0], rot: [0.04, -0.18, 0], s: 1.2, camZ: 5.4, camY: 0 },
  { pos: [-1.9, 0, 0], rot: [0.25, 2.5, 0.1], s: 1.15, camZ: 6.0, camY: 0.2 },
  { pos: [1.9, -0.1, 0], rot: [0.2, 0.6, 0.28], s: 1.1, camZ: 6.0, camY: 0.1 },
  { pos: [-2.0, 0.2, 0], rot: [0.12, -0.55, -0.06], s: 1.1, camZ: 6.0, camY: 0.2 },
  { pos: [2.9, -0.2, 0], rot: [0.05, -0.12, 0], s: 0.82, camZ: 6.4, camY: 0.1 },
  { pos: [2.6, 0.1, 0], rot: [1.0, 0.7, 0.15], s: 0.8, camZ: 6.4, camY: 0.3 },
  { pos: [1.8, 0, 0], rot: [0.18, -0.35, 0], s: 1.2, camZ: 5.8, camY: 0.1 },
]

const smooth = (t: number) => t * t * (3 - 2 * t)

// «Эффективный» индекс главы: внутри главы часы стоят на месте (пауза),
// а переход к следующей начинается только во второй половине экрана.
const HOLD = 0.45
export function easedIndex(idx: number): number {
  const max = POSES.length - 1
  if (idx >= max) return max
  const i = Math.max(Math.floor(idx), 0)
  const f = idx - i
  return i + smooth(MathUtils.clamp((f - HOLD) / (1 - HOLD), 0, 1))
}

// Вес сцены (0..1) вокруг главы c: плавно включается при подходе к ней
export function weight(e: number, c: number, w = 0.7): number {
  return smooth(MathUtils.clamp(1 - Math.abs(e - c) / w, 0, 1))
}

export function samplePose(idx: number, narrow: boolean): Pose {
  const max = POSES.length - 1
  const e = easedIndex(idx)
  const i = Math.min(Math.floor(e), max - 1)
  const t = e - i
  const a = POSES[i]
  const b = POSES[i + 1]
  const l = MathUtils.lerp
  const out: Pose = {
    pos: [l(a.pos[0], b.pos[0], t), l(a.pos[1], b.pos[1], t), l(a.pos[2], b.pos[2], t)],
    rot: [l(a.rot[0], b.rot[0], t), l(a.rot[1], b.rot[1], t), l(a.rot[2], b.rot[2], t)],
    s: l(a.s, b.s, t),
    camZ: l(a.camZ, b.camZ, t),
    camY: l(a.camY, b.camY, t),
  }
  if (narrow) {
    // На телефоне часы по центру, выше текста, чуть меньше
    out.pos = [0, 0.95, 0]
    out.s *= 0.72
    out.camZ += 0.8
  }
  return out
}
