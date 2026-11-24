# RETRO-84 — 3D scroll-сайт (демо)

React + TypeScript + Three.js (React Three Fiber) + GSAP + Lenis.

    npm install
    npm run dev        # разработка
    npm run build      # продакшен-сборка в dist/

Где что править:
- src/assets/model/watch.glb — модель (замени файл, сайт подхватит сам)
- src/config.ts — поворот и размер модели, цвета
- src/keyframes.ts — хореография часов по главам (позиция, поворот, масштаб, камера)
- src/Sections.tsx — тексты и главы
- src/styles.css — стиль ретро-футуризма

Модель содержит надпись CASIO / F-91W на циферблате. Для клиентских сайтов
нужна модель без чужих логотипов или с вашим брендом.
