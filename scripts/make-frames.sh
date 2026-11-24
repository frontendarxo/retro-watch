#!/usr/bin/env bash
# Нарезает кадры для мобильной версии из src/assets/video/*.mp4 -> public/frames/<глава>/001.webp ...
# Запуск из корня проекта: bash scripts/make-frames.sh   (нужен ffmpeg: brew install ffmpeg)
set -e
command -v ffmpeg >/dev/null || { echo "Нужен ffmpeg: brew install ffmpeg"; exit 1; }
OUT=public/frames
rm -rf "$OUT"; mkdir -p "$OUT"
JSON="{"
SEP=""
for f in src/assets/video/*.mp4; do
  n=$(basename "$f" .mp4)
  mkdir -p "$OUT/$n"
  # 12 кадров/с, вертикальный кроп по центру (4:5), 480x600
  ffmpeg -loglevel error -y -i "$f" -vf "fps=12,crop=ih*0.8:ih,scale=480:600:flags=lanczos" -c:v libwebp -quality 60 -compression_level 6 "$OUT/$n/%03d.webp"
  c=$(ls "$OUT/$n" | wc -l | tr -d ' ')
  JSON="$JSON$SEP\"$n\":$c"
  SEP=","
  echo "$n: $c кадров, $(du -sh "$OUT/$n" | cut -f1)"
done
echo "$JSON}" > "$OUT/manifest.json"
echo "Готово: $(du -sh $OUT | cut -f1) всего"
