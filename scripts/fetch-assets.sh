#!/usr/bin/env bash
# Запуск из корня проекта: bash scripts/fetch-assets.sh
# Скачивает 8 роликов и кодирует каждый кадр ключевым (нужно для плавной перемотки скроллом). Нужен ffmpeg: brew install ffmpeg.
set -e
B=https://d8j0ntlcm91z4.cloudfront.net/user_3KNunAjoQjgjSpU4dxgf2Rutfz1
mkdir -p src/assets/video /tmp/raw-videos
get(){
  curl -fL --retry 3 -o "/tmp/raw-videos/$2.mp4" "$B/$1"
  if command -v ffmpeg >/dev/null; then
    ffmpeg -y -loglevel error -i "/tmp/raw-videos/$2.mp4" -an -vf "scale=1920:-2" -c:v libx264 -crf 26 -g 2 -bf 0 -preset slow -pix_fmt yuv420p -movflags +faststart "src/assets/video/$2.mp4"
  else
    echo "ВНИМАНИЕ: ffmpeg не найден, перемотка будет рваной (brew install ffmpeg)"
    cp "/tmp/raw-videos/$2.mp4" "src/assets/video/$2.mp4"
  fi
  echo "ok $2 $(du -h src/assets/video/$2.mp4 | cut -f1)"
}
get hf_20261124_180840_74b92a9c-70a7-4427-9d71-d7fecd59dc22.mp4 hero
get hf_20261124_180844_14e01b50-66c6-49da-8db6-c1c518813b83.mp4 display
get hf_20261124_180842_749a6ceb-0fb5-4fcc-8e71-3b3ed1b1e78b.mp4 case
get hf_20261124_180840_3133f9b5-47ed-4eab-a00d-fa83c9c3d6e0.mp4 water
get hf_20261124_180840_28798ba1-1d34-461a-96d9-403abd19dd11.mp4 mountain
get hf_20261124_180841_d2750847-2d17-4507-b079-9c4cd6fa8cfd.mp4 wrist
get hf_20261124_180843_7a95be6e-0d56-49d7-b579-a42802769272.mp4 specs
get hf_20261124_180841_4a89f7b0-1de2-4a00-a2f2-d799588cbc85.mp4 buy
echo "Готово: npm run dev"
