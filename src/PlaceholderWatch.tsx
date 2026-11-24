import { useEffect, useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

// Временные часы из примитивов — пока нет настоящей GLB-модели.
export default function PlaceholderWatch() {
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 320
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return { canvas, texture }
  }, [])

  useEffect(() => {
    const draw = () => {
      const ctx = canvas.getContext('2d')!
      const d = new Date()
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      const colon = d.getSeconds() % 2 === 0 ? ':' : ' '
      ctx.fillStyle = '#a9b79a'
      ctx.fillRect(0, 0, 512, 320)
      ctx.fillStyle = '#1b2417'
      ctx.font = 'bold 190px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${hh}${colon}${mm}`, 256, 170)
      ctx.font = 'bold 34px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('ALARM  CHRONO', 28, 38)
      texture.needsUpdate = true
    }
    draw()
    const id = setInterval(draw, 1000)
    return () => clearInterval(id)
  }, [canvas, texture])

  const steel = { color: '#c9ccd6', metalness: 1, roughness: 0.28 } as const

  return (
    <group>
      {/* корпус */}
      <RoundedBox args={[1.9, 2.1, 0.42]} radius={0.12} smoothness={4}>
        <meshStandardMaterial {...steel} />
      </RoundedBox>
      {/* безель */}
      <RoundedBox args={[1.62, 1.04, 0.1]} radius={0.06} smoothness={4} position={[0, 0.05, 0.22]}>
        <meshStandardMaterial color="#14121c" metalness={0.6} roughness={0.5} />
      </RoundedBox>
      {/* дисплей */}
      <mesh position={[0, 0.05, 0.276]}>
        <planeGeometry args={[1.46, 0.9]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* кнопки */}
      {[-0.55, 0.55].map((y) => (
        <mesh key={y} position={[0.99, y, 0]}>
          <boxGeometry args={[0.1, 0.34, 0.2]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((y) => (
        <mesh key={'l' + y} position={[-0.99, y, 0]}>
          <boxGeometry args={[0.1, 0.34, 0.2]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      ))}
      {/* нижняя панель с подписью-акцентом */}
      <mesh position={[0, -0.72, 0.22]}>
        <planeGeometry args={[1.5, 0.06]} />
        <meshBasicMaterial color="#ff2bd6" toneMapped={false} />
      </mesh>
      {/* ремешок */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, s * 1.75, -0.04]}>
          <boxGeometry args={[1.5, 1.4, 0.16]} />
          <meshStandardMaterial {...steel} />
        </mesh>
      ))}
    </group>
  )
}
