// Настройки модели часов.
// Положи свой файл сюда: src/assets/model/watch.glb — сайт подхватит его сам.
// Если файла нет, показывается временная 3D-заглушка.

export const MODEL_URL: string | null = null // 3D-модель больше не используется

// Если модель «смотрит» не на камеру — подкрути поворот (в радианах: x, y, z).
export const MODEL_ROTATION: [number, number, number] = [0, -Math.PI / 2, 0]

// Размер модели по большей стороне (в условных единицах сцены).
export const MODEL_SIZE = 2.6

// Цвета ретро-футуризма
export const COLORS = {
  bg: '#05030a',
  magenta: '#ff2bd6',
  cyan: '#19f0ff',
  amber: '#ffb000',
}

// Номера глав (порядок секций на странице)
export const CH = { hero: 0, display: 1, body: 2, water: 3, mountain: 4, wrist: 5, specs: 6, buy: 7 }

// ---------- Фоны глав ----------
// Кладите картинки в src/assets/bg/ с именами из BG_ORDER (png/jpg/webp).
// Скрипт scripts/fetch-assets.sh скачивает готовые.
export const BG_ORDER = ['hero', 'display', 'case', 'water', 'mountain', 'wrist', 'specs', 'buy'] as const
const bgFiles = import.meta.glob('./assets/bg/*.{png,jpg,jpeg,webp}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>
export const BG: Record<string, string> = {}
for (const [path, url] of Object.entries(bgFiles)) {
  BG[path.split('/').pop()!.replace(/\.[^.]+$/, '')] = url
}
// Если фонов достаточно — 3D-сетка и 3D-горы отключаются (их заменяют картинки)
export const HAS_BG = BG_ORDER.filter((n) => BG[n]).length >= 6
// Запасные цвета, пока картинок нет
export const BG_FALLBACK = ['#05030a', '#05030a', '#07040f', '#031a2e', '#14052a', '#05030a', '#05030a', '#05030a']

// ---------- Модель руки с часами (необязательно) ----------
// Файл: src/assets/model/arm.glb. Если нет — используется стилизованная рука-каркас.
export const ARM_URL: string | null = null
export const ARM_ROTATION: [number, number, number] = [0, 0, 0.42]
export const ARM_SIZE = 3.3

// ---------- Видео глав ----------
// Кладите ролики в src/assets/video/ с именами из BG_ORDER (mp4/webm).
const vFiles = import.meta.glob('./assets/video/*.{mp4,webm}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>
export const VIDEO: Record<string, string> = {}
for (const [path, url] of Object.entries(vFiles)) {
  VIDEO[path.split('/').pop()!.replace(/\.[^.]+$/, '')] = url
}
