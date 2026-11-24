import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Grid, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { CH, COLORS, HAS_BG } from './config'
import { easedIndex, weight } from './keyframes'
import { scroll } from './scrollState'

const C = (hex: string) => new THREE.Color(hex)
const PAL = {
  bg: { base: C(COLORS.bg), water: C('#031a2e'), mtn: C('#14052a') },
  fog: { base: C(COLORS.bg), water: C('#05405f'), mtn: C('#2b0b45') },
  lightA: { base: C(COLORS.magenta), water: C('#00a8ff'), mtn: C('#ff7a1a') },
  lightB: { base: C(COLORS.cyan), water: C('#00ffd0'), mtn: C('#ff2bd6') },
  cell: { base: C(COLORS.magenta), water: C('#1f7fb8'), mtn: C('#ff2bd6') },
  section: { base: C(COLORS.cyan), water: C('#59e6ff'), mtn: C('#ffb000') },
}
const tmp = new THREE.Color()
function mix(key: keyof typeof PAL, ww: number, wm: number, out: THREE.Color) {
  return out.copy(PAL[key].base).lerp(PAL[key].water, ww).lerp(PAL[key].mtn, wm)
}

/* ---------- горы: неоновая сетка + закат ---------- */
function makeMountains() {
  const g = new THREE.PlaneGeometry(70, 22, 110, 34)
  g.rotateX(-Math.PI / 2)
  const pos = g.attributes.position
  const colors: number[] = []
  const cA = C('#ff2bd6')
  const cB = C('#19f0ff')
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const lane = THREE.MathUtils.smoothstep(Math.abs(x), 3, 13) // долина по центру
    const h =
      (Math.abs(Math.sin(x * 0.33 + 1.3)) * 2.2 +
        Math.abs(Math.sin(x * 0.9 + z * 0.55)) * 0.9 +
        Math.abs(Math.sin(z * 0.7 + x * 0.12)) * 0.5) *
      lane
    pos.setY(i, h * (0.55 + (11 - z) * 0.03))
    c.copy(cA).lerp(cB, THREE.MathUtils.clamp(h / 3.2, 0, 1))
    colors.push(c.r, c.g, c.b)
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return g
}

const sunMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uOpacity: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `
      varying vec2 vUv; uniform float uOpacity;
      void main(){
        vec2 p = vUv - 0.5;
        if (length(p) > 0.5) discard;
        if (vUv.y < 0.55 && fract(vUv.y * 18.0) < (0.55 - vUv.y) * 1.7) discard;
        vec3 top = vec3(1.0, 0.89, 0.37);
        vec3 bot = vec3(1.0, 0.17, 0.84);
        gl_FragColor = vec4(mix(bot, top, smoothstep(0.1, 0.95, vUv.y)), uOpacity);
      }`,
  })

function Mountains({ w }: { w: React.MutableRefObject<number> }) {
  const geo = useMemo(makeMountains, [])
  const group = useRef<THREE.Group>(null!)
  const mats = useRef<THREE.Material[]>([])
  const sun = useMemo(sunMat, [])
  const narrow = useThree((st) => st.size.width < 768)
  useFrame(() => {
    group.current.visible = w.current > 0.01
    mats.current.forEach((m, i) => (m.opacity = w.current * (i === 0 ? 1 : 0.95)))
    sun.uniforms.uOpacity.value = w.current
  })
  return (
    <group ref={group} position={[0, -2.6, -13]}>
      <mesh geometry={geo}>
        <meshBasicMaterial ref={(m) => { if (m) mats.current[0] = m }} color="#0a0216" transparent polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <mesh geometry={geo}>
        <meshBasicMaterial ref={(m) => { if (m) mats.current[1] = m }} vertexColors wireframe transparent />
      </mesh>
      <mesh position={[narrow ? 0 : -9, 6.2, -14]} material={sun}>
        <planeGeometry args={[11, 11]} />
      </mesh>
    </group>
  )
}

/* ---------- вода: пузыри и лучи света ---------- */
function Water({ w }: { w: React.MutableRefObject<number> }) {
  const N = 110
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const rays = useRef<THREE.Group>(null!)
  const rayMats = useRef<THREE.MeshBasicMaterial[]>([])
  const bubbleMat = useRef<THREE.MeshBasicMaterial>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const seeds = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => ({
        x: (Math.sin(i * 12.9898) * 43758.5453 % 1) * 16 - 8,
        z: (Math.sin(i * 78.233) * 12345.678 % 1) * 8 - 6,
        sp: 0.25 + Math.abs(Math.sin(i * 3.1)) * 0.5,
        off: Math.abs(Math.sin(i * 5.7)) * 14,
        r: 0.4 + Math.abs(Math.sin(i * 1.7)) * 1.2,
      })),
    [],
  )
  const rayTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 8
    c.height = 128
    const x = c.getContext('2d')!
    const g = x.createLinearGradient(0, 0, 0, 128)
    g.addColorStop(0, 'rgba(160,240,255,1)')
    g.addColorStop(1, 'rgba(160,240,255,0)')
    x.fillStyle = g
    x.fillRect(0, 0, 8, 128)
    return new THREE.CanvasTexture(c)
  }, [])

  useFrame((s) => {
    const vis = w.current > 0.01
    mesh.current.visible = vis
    rays.current.visible = vis
    if (!vis) return
    const t = s.clock.elapsedTime
    seeds.forEach((b, i) => {
      const y = ((t * b.sp + b.off) % 14) - 5
      dummy.position.set(b.x + Math.sin(t * 0.6 + i) * 0.12, y, b.z)
      dummy.scale.setScalar(b.r * 0.07)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    bubbleMat.current.opacity = w.current * 0.55
    rayMats.current.forEach((m) => (m.opacity = w.current * (HAS_BG ? 0 : 0.2)))
  })

  return (
    <>
      <instancedMesh ref={mesh} args={[undefined, undefined, N]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial ref={bubbleMat} color="#bff6ff" transparent depthWrite={false} />
      </instancedMesh>
      <group ref={rays} position={[0, 3, -5]}>
        {[-6, -3, 0.5, 4, 7].map((x, i) => (
          <mesh key={x} position={[x, 0, -i * 0.6]} rotation={[0, 0, 0.18 - i * 0.04]}>
            <planeGeometry args={[1.3 + (i % 2) * 0.8, 16]} />
            <meshBasicMaterial
              ref={(m) => { if (m) rayMats.current[i] = m }}
              map={rayTex}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </>
  )
}

/* ---------- общий свет, фон, туман, пол ---------- */
export default function Environment3D() {
  const { scene } = useThree()
  const grid = useRef<THREE.Mesh>(null!)
  const lightA = useRef<THREE.PointLight>(null!)
  const lightB = useRef<THREE.PointLight>(null!)
  const wWater = useRef(0)
  const wMtn = useRef(0)
  const fog = useMemo(() => new THREE.Fog(COLORS.bg, 9, 26), [])

  useFrame(() => {
    const e = easedIndex(scroll.idx)
    const ww = (wWater.current = weight(e, CH.water))
    const wm = (wMtn.current = weight(e, CH.mountain))
    scene.background = null
    scene.fog = fog
    fog.color.copy(mix('fog', ww, wm, tmp))
    fog.near = 9 - ww * 4
    fog.far = 26 - ww * 10
    lightA.current.color.copy(mix('lightA', ww, wm, tmp))
    lightB.current.color.copy(mix('lightB', ww, wm, tmp))
    const mat = grid.current?.material as THREE.ShaderMaterial | undefined
    if (mat?.uniforms?.cellColor) {
      mat.uniforms.cellColor.value.copy(mix('cell', ww, wm, tmp))
      mat.uniforms.sectionColor.value.copy(mix('section', ww, wm, tmp))
    }
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight ref={lightA} position={[-4, 2, 3]} intensity={60} color={COLORS.magenta} />
      <pointLight ref={lightB} position={[4, -1, 3]} intensity={50} color={COLORS.cyan} />
      {!HAS_BG && <Grid
        ref={grid}
        position={[0, -2.6, 0]}
        args={[60, 60]}
        cellSize={0.8}
        cellThickness={0.8}
        cellColor={COLORS.magenta}
        sectionSize={4}
        sectionThickness={1.4}
        sectionColor={COLORS.cyan}
        fadeDistance={28}
        fadeStrength={1.4}
        infiniteGrid
      />}
      {!HAS_BG && <Mountains w={wMtn} />}
      <Water w={wWater} />
      <Sparkles count={60} scale={[14, 7, 8]} size={2} speed={0.15} color={COLORS.cyan} opacity={0.6} />
    </>
  )
}
