import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

type Props = {
  url: string
  rotation?: [number, number, number]
  size: number
  /** Возвращает прозрачность 0..1 (для плавной смены часов и руки) */
  opacity?: () => number
}

// GLB-модель: центрируем, приводим к единому размеру, умеем плавно появляться.
export default function GlbModel({ url, rotation = [0, 0, 0], size, opacity }: Props) {
  const gltf = useGLTF(url)
  const group = useRef<THREE.Group>(null!)
  const { scene, scale, offset, mats } = useMemo(() => {
    const scene = gltf.scene.clone(true)
    const box = new THREE.Box3().setFromObject(scene)
    const dims = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = size / Math.max(dims.x, dims.y, dims.z)
    const mats: THREE.Material[] = []
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const list = Array.isArray(m.material) ? m.material : [m.material]
      list.forEach((mat) => {
        const sm = mat as THREE.MeshStandardMaterial
        if ('envMapIntensity' in sm) sm.envMapIntensity = 1.4
        if (opacity) sm.transparent = true
        mats.push(sm)
      })
    })
    return { scene, scale, offset: center.multiplyScalar(-scale), mats }
  }, [gltf, size, opacity])

  useFrame(() => {
    if (!opacity) return
    const o = THREE.MathUtils.clamp(opacity(), 0, 1)
    group.current.visible = o > 0.01
    mats.forEach((m) => (m.opacity = o))
  })

  return (
    <group ref={group} rotation={rotation}>
      <group position={offset} scale={scale}>
        <primitive object={scene} />
      </group>
    </group>
  )
}
