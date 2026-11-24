import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { ARM_ROTATION, ARM_SIZE, ARM_URL, CH, COLORS, MODEL_ROTATION, MODEL_SIZE, MODEL_URL } from './config'
import { easedIndex, samplePose, weight } from './keyframes'
import { scroll } from './scrollState'
import PlaceholderWatch from './PlaceholderWatch'
import ModelWatch from './ModelWatch'
import Environment3D from './Env'

// «Рука»: стилизованное предплечье, которое проходит сквозь браслет в главе «На руке»
function Arm() {
  const g = useRef<THREE.Group>(null!)
  const mats = useRef<THREE.Material[]>([])
  useFrame(() => {
    const w = weight(easedIndex(scroll.idx), CH.wrist, 0.6)
    g.current.visible = w > 0.01
    mats.current.forEach((m, i) => (m.opacity = w * (i === 1 ? 0.4 : 1)))
  })
  const R = 1.0 // радиус под внутренний диаметр браслета
  const L = 3.0
  return (
    <group ref={g} position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.97]}>
      <mesh>
        <cylinderGeometry args={[R, R * 0.9, L, 40, 14, true]} />
        <meshStandardMaterial ref={(m) => { if (m) mats.current[0] = m }} color="#2a1246" roughness={0.45} metalness={0.15} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh scale={1.004}>
        <cylinderGeometry args={[R, R * 0.9, L, 40, 14, true]} />
        <meshBasicMaterial ref={(m) => { if (m) mats.current[1] = m }} color={COLORS.cyan} wireframe transparent />
      </mesh>
      <mesh position={[0, L / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, 0.025, 8, 64]} />
        <meshBasicMaterial ref={(m) => { if (m) mats.current[2] = m }} color={COLORS.magenta} transparent />
      </mesh>
      <mesh position={[0, -L / 2, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.9}>
        <torusGeometry args={[R, 0.025, 8, 64]} />
        <meshBasicMaterial ref={(m) => { if (m) mats.current[3] = m }} color={COLORS.magenta} transparent />
      </mesh>
    </group>
  )
}

const wristShow = () => weight(easedIndex(scroll.idx), CH.wrist, 0.6)
const wristFade = () => 1 - wristShow()

function Rig() {
  const group = useRef<THREE.Group>(null!)
  const { camera, size } = useThree()
  const narrow = size.width < 768

  useFrame((_, dt) => {
    const p = samplePose(scroll.idx, narrow)
    const g = group.current
    const d = Math.min(dt, 0.05) // защита от скачков при просадке FPS
    const k = 3.2 // плавность догоняния
    g.position.x = THREE.MathUtils.damp(g.position.x, p.pos[0], k, d)
    g.position.y = THREE.MathUtils.damp(g.position.y, p.pos[1], k, d)
    g.position.z = THREE.MathUtils.damp(g.position.z, p.pos[2], k, d)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, p.rot[0], k, d)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, p.rot[1], k, d)
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, p.rot[2], k, d)
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, p.s, k, d))
    camera.position.y = THREE.MathUtils.damp(camera.position.y, p.camY, k, d)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, p.camZ, k, d)
    camera.lookAt(0, 0, 0)
  })

  return (
    <group ref={group}>
      {MODEL_URL ? (
        <ModelWatch
          url={MODEL_URL}
          rotation={MODEL_ROTATION}
          size={MODEL_SIZE}
          opacity={ARM_URL ? wristFade : undefined}
        />
      ) : (
        <PlaceholderWatch />
      )}
      {ARM_URL ? (
        <ModelWatch url={ARM_URL} rotation={ARM_ROTATION} size={ARM_SIZE} opacity={wristShow} />
      ) : (
        <Arm />
      )}
    </group>
  )
}

export default function Stage() {
  return (
    <div className="stage" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.1, 6.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Студийный свет из «неоновых» полос — без загрузки внешних HDR */}
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={4} color={COLORS.magenta} position={[-5, 1, -2]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={4} color={COLORS.cyan} position={[5, 2, 2]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        </Environment>

        <Environment3D />
        <Suspense fallback={null}>
          <Rig />
        </Suspense>
      </Canvas>
    </div>
  )
}
