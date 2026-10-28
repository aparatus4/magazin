import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { makeContactShadow } from './studio'

/* ---------------------------------- helpers --------------------------------- */

function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  cast = true,
  receive = true,
): THREE.Mesh {
  const object = new THREE.Mesh(geometry, material)
  object.castShadow = cast
  object.receiveShadow = receive
  return object
}

function rounded(width: number, height: number, depth: number, radius?: number): RoundedBoxGeometry
function rounded(
  width: number,
  height: number,
  depth: number,
  radius: number,
  material: THREE.Material,
): THREE.Mesh
function rounded(
  width: number,
  height: number,
  depth: number,
  radius = 0.035,
  material?: THREE.Material,
) {
  const geometry = new RoundedBoxGeometry(width, height, depth, 4, radius)
  return material ? mesh(geometry, material) : geometry
}

function lathe(points: Array<[number, number]>, segments = 128) {
  return new THREE.LatheGeometry(
    points.map(([radius, y]) => new THREE.Vector2(radius, y)),
    segments,
  )
}

export function flutedLathe(
  points: Array<[number, number]>,
  options: { flutes?: number; amplitude?: number; twist?: number; segments?: number } = {},
) {
  const { flutes = 20, amplitude = 0.026, twist = 0.18, segments = 192 } = options
  const geometry = lathe(points, segments)
  const position = geometry.attributes.position as THREE.BufferAttribute
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const y = position.getY(index)
    const z = position.getZ(index)
    const radius = Math.hypot(x, z)
    if (radius < 0.0001) continue
    const angle = Math.atan2(z, x)
    const factor = 1 + amplitude * Math.cos(flutes * angle + y * twist)
    position.setX(index, x * factor)
    position.setZ(index, z * factor)
  }
  geometry.computeVertexNormals()
  return geometry
}

export function ceramicMaterial(
  color: string,
  options: {
    roughness?: number
    metalness?: number
    clearcoat?: number
    transmission?: number
    emissive?: string
    emissiveIntensity?: number
    side?: THREE.Side
  } = {},
) {
  const transmission = options.transmission ?? 0
  const material = new THREE.MeshPhysicalMaterial({
    color,
    roughness: options.roughness ?? 0.38,
    metalness: options.metalness ?? 0,
    clearcoat: options.clearcoat ?? 0.3,
    clearcoatRoughness: 0.35,
    transmission,
    thickness: transmission > 0 ? 0.35 : 0,
    envMapIntensity: 1.05,
    side: options.side ?? THREE.FrontSide,
    transparent: transmission > 0 || (options.emissiveIntensity ?? 0) > 0,
    opacity: transmission > 0 ? 0.98 : 1,
    emissive: options.emissive ?? '#000000',
    emissiveIntensity: options.emissiveIntensity ?? 0,
  })
  return material
}

const stone = () =>
  new THREE.MeshPhysicalMaterial({
    color: '#2b2a26',
    roughness: 0.52,
    metalness: 0.05,
    clearcoat: 0.1,
  })

const bone = () =>
  new THREE.MeshPhysicalMaterial({
    color: '#e8e3d8',
    roughness: 0.62,
    metalness: 0,
    clearcoat: 0.12,
  })

const darkMetal = () =>
  new THREE.MeshPhysicalMaterial({
    color: '#2f302e',
    roughness: 0.34,
    metalness: 0.55,
  })

/* ----------------------------------- vase ----------------------------------- */

export function createVase(finish?: {
  color?: string
  roughness?: number
  metalness?: number
  clearcoat?: number
  transmission?: number
}) {
  const group = new THREE.Group()
  group.name = 'mobius-vase'

  const profile: Array<[number, number]> = [
    [0, 0],
    [0.4, 0],
    [0.435, 0.015],
    [0.5, 0.075],
    [0.57, 0.22],
    [0.61, 0.45],
    [0.585, 0.68],
    [0.535, 0.9],
    [0.465, 1.12],
    [0.4, 1.32],
    [0.38, 1.46],
    [0.4, 1.55],
    [0.43, 1.61],
    [0.445, 1.63],
  ]

  const material = ceramicMaterial(finish?.color ?? '#c9d7b8', {
    roughness: finish?.roughness ?? 0.4,
    metalness: finish?.metalness ?? 0,
    clearcoat: finish?.clearcoat ?? 0.32,
    transmission: finish?.transmission ?? 0,
    side: THREE.DoubleSide,
  })
  material.roughness = Math.min(material.roughness, 0.48)
  const vase = mesh(flutedLathe(profile, { flutes: 18, amplitude: 0.028, twist: 0.25 }), material)
  vase.name = 'vase-body'
  group.add(vase)

  const base = mesh(
    lathe([
      [0, 0],
      [0.59, 0],
      [0.61, 0.02],
      [0.58, 0.06],
      [0.55, 0.075],
      [0, 0.075],
    ], 96),
    stone(),
  )
  base.receiveShadow = true
  group.add(base)

  const shadow = makeContactShadow(0.8, 0.27)
  shadow.position.y = 0.003
  group.add(shadow)

  vase.position.y = 0.075
  return group
}

/* ---------------------------------- lamp ----------------------------------- */

export function createLamp() {
  const group = new THREE.Group()
  group.name = 'halo-lamp'

  const base = mesh(
    lathe([
      [0, 0],
      [0.38, 0],
      [0.4, 0.02],
      [0.36, 0.07],
      [0.12, 0.11],
      [0.03, 0.12],
    ], 96),
    new THREE.MeshPhysicalMaterial({
      color: '#e8e1d4',
      roughness: 0.44,
      clearcoat: 0.2,
    }),
  )
  group.add(base)

  const stem = mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.9, 24),
    new THREE.MeshPhysicalMaterial({
      color: '#d7cdbd',
      roughness: 0.3,
      metalness: 0.55,
    }),
  )
  stem.position.y = 0.56
  group.add(stem)

  const shadeMaterial = new THREE.MeshPhysicalMaterial({
    color: '#f1e6d5',
    roughness: 0.42,
    clearcoat: 0.3,
    emissive: '#ffd7a1',
    emissiveIntensity: 0.22,
    transparent: true,
    opacity: 0.92,
    transmission: 0.25,
    thickness: 0.3,
    side: THREE.DoubleSide,
    envMapIntensity: 0.9,
  })
  const shade = mesh(
    lathe([
      [0.02, 1.62],
      [0.11, 1.62],
      [0.26, 1.57],
      [0.43, 1.45],
      [0.57, 1.28],
      [0.67, 1.11],
      [0.72, 1.01],
      [0.73, 0.99],
    ], 128),
    shadeMaterial,
  )
  group.add(shade)

  const inner = mesh(
    new THREE.CircleGeometry(0.69, 64),
    new THREE.MeshBasicMaterial({
      color: '#ffe3b8',
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
    false,
    false,
  )
  inner.rotation.x = Math.PI / 2
  inner.position.y = 1.0
  group.add(inner)

  const glow = new THREE.PointLight(0xffd09a, 2.7, 3.5, 2)
  glow.position.set(0, 0.92, 0)
  group.add(glow)

  const shadow = makeContactShadow(0.55, 0.24)
  shadow.position.y = 0.002
  group.add(shadow)

  return group
}

/* --------------------------------- planter --------------------------------- */

export function createPlanter() {
  const group = new THREE.Group()
  group.name = 'terra-planter'

  const potMaterial = ceramicMaterial('#cfb59a', { roughness: 0.72, clearcoat: 0.08 })
  const pot = mesh(
    flutedLathe(
      [
        [0, 0],
        [0.3, 0],
        [0.35, 0.045],
        [0.41, 0.25],
        [0.46, 0.52],
        [0.48, 0.69],
        [0.45, 0.71],
      ],
      { flutes: 16, amplitude: 0.022, twist: 0.08, segments: 128 },
    ),
    potMaterial,
  )
  ;(pot.material as THREE.MeshPhysicalMaterial).side = THREE.DoubleSide
  group.add(pot)

  const soil = mesh(
    new THREE.CircleGeometry(0.43, 64),
    new THREE.MeshStandardMaterial({ color: '#3f362b', roughness: 1 }),
    false,
    true,
  )
  soil.rotation.x = -Math.PI / 2
  soil.position.y = 0.66
  group.add(soil)

  const leafMaterial = new THREE.MeshStandardMaterial({
    color: '#7e8e71',
    roughness: 0.62,
    side: THREE.DoubleSide,
  })
  const stemMaterial = new THREE.MeshStandardMaterial({ color: '#617052', roughness: 0.7 })

  const stems: Array<{ x: number; z: number; height: number; lean: number }> = [
    { x: 0.02, z: 0, height: 1.13, lean: 0.06 },
    { x: 0.13, z: 0.1, height: 0.92, lean: 0.2 },
    { x: -0.14, z: 0.06, height: 1.02, lean: -0.19 },
    { x: 0.04, z: -0.12, height: 0.84, lean: 0.1 },
    { x: -0.06, z: 0.13, height: 0.95, lean: -0.12 },
  ]

  stems.forEach((stem, index) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(stem.x, 0.66, stem.z),
      new THREE.Vector3(stem.x + stem.lean * 0.4, 0.66 + stem.height * 0.45, stem.z + 0.02),
      new THREE.Vector3(stem.x + stem.lean, 0.66 + stem.height, stem.z + 0.06),
    ])
    const stemMesh = mesh(new THREE.TubeGeometry(curve, 20, 0.008, 6, false), stemMaterial)
    group.add(stemMesh)

    for (let leafIndex = 0; leafIndex < 3; leafIndex += 1) {
      const t = 0.35 + leafIndex * 0.23
      const point = curve.getPoint(t)
      const leaf = mesh(
        new THREE.SphereGeometry(1, 14, 8),
        leafMaterial,
      )
      const side = (index + leafIndex) % 2 === 0 ? 1 : -1
      leaf.scale.set(0.17, 0.018, 0.07)
      leaf.position.set(point.x + side * 0.08, point.y, point.z + 0.02)
      leaf.rotation.set(0.2 * side, 0.55 * side, 0.35 * side)
      group.add(leaf)
    }
  })

  const shadow = makeContactShadow(0.55, 0.24)
  shadow.position.y = 0.002
  group.add(shadow)

  return group
}

/* ---------------------------------- desk ----------------------------------- */

export function createDeskSystem() {
  const group = new THREE.Group()
  group.name = 'orbit-desk'

  const graphite = new THREE.MeshPhysicalMaterial({
    color: '#3a3b37',
    roughness: 0.5,
    metalness: 0.08,
    clearcoat: 0.16,
  })
  const felt = new THREE.MeshStandardMaterial({ color: '#80796c', roughness: 0.95 })

  const base = rounded(1.5, 0.075, 0.78, 0.05, graphite)
  base.position.y = 0.0375
  group.add(base)

  const feltPad = rounded(1.38, 0.012, 0.66, 0.02, felt)
  feltPad.position.y = 0.08
  group.add(feltPad)

  const dock = rounded(0.55, 0.62, 0.075, 0.025, graphite)
  dock.position.set(-0.36, 0.38, -0.18)
  dock.rotation.x = -0.22
  group.add(dock)

  const lip = rounded(0.58, 0.055, 0.13, 0.025, graphite)
  lip.position.set(-0.36, 0.115, -0.04)
  group.add(lip)

  const phone = rounded(0.48, 0.9, 0.028, 0.04, new THREE.MeshPhysicalMaterial({
    color: '#10110f',
    roughness: 0.16,
    metalness: 0.15,
    clearcoat: 0.8,
    clearcoatRoughness: 0.12,
  }))
  phone.position.set(-0.36, 0.58, -0.14)
  phone.rotation.x = -0.22
  group.add(phone)

  const screen = rounded(0.43, 0.82, 0.004, 0.025, new THREE.MeshPhysicalMaterial({
    color: '#1b1d1a',
    roughness: 0.08,
    metalness: 0.4,
    clearcoat: 1,
  }))
  screen.position.set(-0.36, 0.58, -0.123)
  screen.rotation.x = -0.22
  group.add(screen)

  const screenGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.38, 0.75),
    new THREE.MeshBasicMaterial({
      color: '#b7c8bd',
      transparent: true,
      opacity: 0.08,
      toneMapped: false,
    }),
  )
  screenGlow.position.set(-0.36, 0.58, -0.12)
  screenGlow.rotation.x = -0.22
  group.add(screenGlow)

  const cupProfile: Array<[number, number]> = [
    [0, 0],
    [0.14, 0],
    [0.155, 0.02],
    [0.17, 0.315],
    [0.156, 0.33],
  ]
  const cup = mesh(lathe(cupProfile, 64), graphite)
  ;(cup.material as THREE.MeshPhysicalMaterial).side = THREE.DoubleSide
  cup.position.set(0.48, 0.08, 0.08)
  group.add(cup)

  const pencil = mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.55, 12),
    new THREE.MeshStandardMaterial({ color: '#b89a6c', roughness: 0.6 }),
  )
  pencil.position.set(0.5, 0.37, 0.06)
  pencil.rotation.z = 0.15
  group.add(pencil)

  const shadow = makeContactShadow(0.92, 0.22)
  shadow.position.y = 0.002
  group.add(shadow)

  return group
}

/* ---------------------------------- ring ----------------------------------- */

export function createRing() {
  const group = new THREE.Group()
  group.name = 'aster-ring'

  const bandMaterial = new THREE.MeshPhysicalMaterial({
    color: '#c8a969',
    roughness: 0.24,
    metalness: 1,
    envMapIntensity: 1.35,
  })
  const band = mesh(new THREE.TorusGeometry(0.44, 0.062, 32, 160), bandMaterial)
  band.scale.set(1, 1.12, 1)
  band.rotation.set(0.12, 0.5, -0.06)
  group.add(band)

  const gemMaterial = new THREE.MeshPhysicalMaterial({
    color: '#c7d2cd',
    roughness: 0.1,
    metalness: 0.06,
    transmission: 0.36,
    thickness: 0.42,
    ior: 1.8,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.35,
    flatShading: true,
  })
  const gem = mesh(new THREE.IcosahedronGeometry(0.19, 0), gemMaterial)
  gem.scale.set(0.82, 1.02, 0.82)
  gem.position.set(0.02, 0.64, 0.02)
  gem.rotation.set(0.35, 0.6, 0.2)
  group.add(gem)

  const collar = mesh(new THREE.TorusGeometry(0.105, 0.026, 12, 40), bandMaterial)
  collar.rotation.x = Math.PI / 2
  collar.position.set(0.02, 0.54, 0.02)
  group.add(collar)

  const shadow = makeContactShadow(0.55, 0.14)
  shadow.position.y = 0.002
  group.add(shadow)

  group.position.y = 0.2
  return group
}

/* -------------------------------- tabletop --------------------------------- */

export function createTabletop() {
  const group = new THREE.Group()
  group.name = 'kite-tabletop'

  const terracotta = new THREE.MeshPhysicalMaterial({
    color: '#b06b4d',
    roughness: 0.78,
    clearcoat: 0.05,
  })
  const pale = new THREE.MeshStandardMaterial({ color: '#d8c0ab', roughness: 0.82 })
  const greenery = new THREE.MeshStandardMaterial({ color: '#788b6d', roughness: 0.7 })

  const displayBase = mesh(
    new THREE.CylinderGeometry(0.92, 0.95, 0.12, 64),
    new THREE.MeshPhysicalMaterial({ color: '#ded9cf', roughness: 0.55 }),
  )
  displayBase.position.y = 0.06
  group.add(displayBase)

  const ground = mesh(
    new THREE.CylinderGeometry(0.84, 0.84, 0.06, 64),
    terracotta,
  )
  ground.position.y = 0.15
  group.add(ground)

  const tower = new THREE.Group()
  const towerParts = [
    { width: 0.38, height: 0.25, depth: 0.38, y: 0.32 },
    { width: 0.32, height: 0.22, depth: 0.32, y: 0.55 },
    { width: 0.26, height: 0.2, depth: 0.26, y: 0.76 },
  ]
  towerParts.forEach((part) => {
    const block = rounded(part.width, part.height, part.depth, 0.02, terracotta)
    block.position.y = part.y
    tower.add(block)
  })
  for (let index = 0; index < 4; index += 1) {
    const crenellation = rounded(0.075, 0.08, 0.075, 0.012, terracotta)
    crenellation.position.set(index % 2 === 0 ? -0.08 : 0.08, 0.9, index < 2 ? -0.08 : 0.08)
    tower.add(crenellation)
  }
  tower.position.set(-0.32, 0.02, -0.03)
  tower.rotation.y = 0.24
  group.add(tower)

  const arch = new THREE.Group()
  const pillarLeft = rounded(0.1, 0.42, 0.12, 0.02, pale)
  pillarLeft.position.set(-0.28, 0.3, 0)
  const pillarRight = pillarLeft.clone()
  pillarRight.position.x = 0.28
  arch.add(pillarLeft, pillarRight)
  const archTop = mesh(new THREE.TorusGeometry(0.28, 0.055, 12, 40, Math.PI), pale)
  archTop.rotation.z = 0
  archTop.position.set(0, 0.52, 0)
  arch.add(archTop)
  arch.position.set(0.35, 0.02, 0.16)
  arch.rotation.y = -0.32
  group.add(arch)

  for (let index = 0; index < 3; index += 1) {
    const step = rounded(0.32 + index * 0.09, 0.055, 0.18, 0.012, terracotta)
    step.position.set(-0.16 + index * 0.035, 0.2 + index * 0.055, 0.4)
    step.rotation.y = 0.5
    group.add(step)
  }

  const treePositions = [
    { x: 0.48, z: -0.28, scale: 1 },
    { x: -0.08, z: 0.48, scale: 0.78 },
    { x: -0.55, z: 0.32, scale: 0.62 },
  ]
  treePositions.forEach((tree) => {
    const trunk = mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.2, 8), pale)
    trunk.position.set(tree.x, 0.3 * tree.scale + 0.16, tree.z)
    trunk.scale.setScalar(tree.scale)
    group.add(trunk)
    for (let level = 0; level < 3; level += 1) {
      const foliage = mesh(new THREE.ConeGeometry(0.12 - level * 0.025, 0.2, 7), greenery)
      foliage.position.set(tree.x, 0.34 + level * 0.11, tree.z)
      foliage.scale.setScalar(tree.scale)
      group.add(foliage)
    }
  })

  const shadow = makeContactShadow(1.0, 0.24)
  shadow.position.y = 0.002
  group.add(shadow)

  group.position.y = 0.02
  return group
}

/* -------------------------------- architecture ----------------------------- */

export function createArchitecture() {
  const group = new THREE.Group()
  group.name = 'echo-house'

  const plaster = new THREE.MeshPhysicalMaterial({
    color: '#d8d2c6',
    roughness: 0.7,
    clearcoat: 0.05,
    envMapIntensity: 0.72,
  })
  const baseStone = new THREE.MeshPhysicalMaterial({
    color: '#c9c2b4',
    roughness: 0.76,
    clearcoat: 0.04,
    envMapIntensity: 0.6,
  })
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#3d5257',
    roughness: 0.22,
    metalness: 0.38,
    clearcoat: 0.65,
    envMapIntensity: 1.05,
  })

  const base = rounded(2.2, 0.12, 1.45, 0.02, baseStone)
  base.position.y = 0.06
  group.add(base)

  const main = rounded(1.08, 0.82, 0.72, 0.015, plaster)
  main.position.set(-0.48, 0.53, -0.16)
  group.add(main)

  const mainGlass = rounded(1.0, 0.18, 0.75, 0.012, glass)
  mainGlass.position.set(-0.48, 0.52, -0.15)
  group.add(mainGlass)

  const slab = rounded(1.3, 0.06, 0.88, 0.012, plaster)
  slab.position.set(-0.46, 0.98, -0.11)
  group.add(slab)

  const low = rounded(0.62, 0.38, 0.54, 0.015, plaster)
  low.position.set(0.48, 0.32, -0.32)
  group.add(low)

  const lowGlass = rounded(0.55, 0.1, 0.56, 0.012, glass)
  lowGlass.position.set(0.48, 0.34, -0.31)
  group.add(lowGlass)

  const tower = rounded(0.34, 0.7, 0.34, 0.015, plaster)
  tower.position.set(0.68, 0.47, 0.22)
  group.add(tower)

  const towerSlit = rounded(0.05, 0.52, 0.345, 0.01, glass)
  towerSlit.position.set(0.68, 0.49, 0.22)
  group.add(towerSlit)

  const pool = rounded(0.5, 0.03, 0.26, 0.02, new THREE.MeshPhysicalMaterial({
    color: '#a7c0c4',
    roughness: 0.12,
    metalness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  }))
  pool.position.set(0.3, 0.13, 0.4)
  group.add(pool)

  for (let index = 0; index < 5; index += 1) {
    const column = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.34, 8), plaster)
    column.position.set(-0.08 + index * 0.075, 0.29, 0.48)
    group.add(column)
  }

  const canopy = rounded(0.46, 0.035, 0.29, 0.01, plaster)
  canopy.position.set(0.07, 0.47, 0.48)
  group.add(canopy)

  const treeTrunk = mesh(new THREE.CylinderGeometry(0.014, 0.02, 0.25, 8), bone())
  treeTrunk.position.set(-1.0, 0.24, 0.46)
  group.add(treeTrunk)
  const treeCrown = mesh(
    new THREE.SphereGeometry(0.18, 16, 12),
    new THREE.MeshStandardMaterial({ color: '#6f8264', roughness: 0.82 }),
  )
  treeCrown.position.set(-1.0, 0.47, 0.46)
  group.add(treeCrown)

  const shadow = makeContactShadow(1.35, 0.24)
  shadow.position.y = 0.002
  group.add(shadow)

  return group
}

/* ---------------------------------- drone ---------------------------------- */

export function createDrone() {
  const group = new THREE.Group()
  group.name = 'pulse-drone'

  const carbon = new THREE.MeshPhysicalMaterial({
    color: '#2b2d2b',
    roughness: 0.34,
    metalness: 0.4,
    clearcoat: 0.3,
  })
  const accent = new THREE.MeshPhysicalMaterial({
    color: '#dc6738',
    roughness: 0.38,
    metalness: 0.05,
    clearcoat: 0.4,
  })
  const prop = new THREE.MeshPhysicalMaterial({
    color: '#454844',
    roughness: 0.4,
    metalness: 0.5,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
  })
  const lens = new THREE.MeshPhysicalMaterial({
    color: '#151816',
    roughness: 0.08,
    metalness: 0.8,
    clearcoat: 1,
  })

  const body = rounded(0.52, 0.14, 0.4, 0.05, carbon)
  body.position.y = 0.28
  group.add(body)

  const top = rounded(0.32, 0.09, 0.27, 0.04, carbon)
  top.position.y = 0.39
  group.add(top)

  const battery = rounded(0.35, 0.11, 0.22, 0.025, accent)
  battery.position.set(0, 0.28, -0.22)
  group.add(battery)

  const arms = [Math.PI / 4, (Math.PI * 3) / 4, (Math.PI * 5) / 4, (Math.PI * 7) / 4]
  arms.forEach((angle) => {
    const arm = rounded(0.62, 0.045, 0.09, 0.02, carbon)
    arm.position.set(Math.cos(angle) * 0.32, 0.25, Math.sin(angle) * 0.32)
    arm.rotation.y = -angle
    group.add(arm)

    const motor = mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.11, 28), carbon)
    motor.position.set(Math.cos(angle) * 0.64, 0.3, Math.sin(angle) * 0.64)
    group.add(motor)

    const motorTop = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 24), accent)
    motorTop.position.set(Math.cos(angle) * 0.64, 0.365, Math.sin(angle) * 0.64)
    group.add(motorTop)

    const blade = mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.005, 40), prop, false, false)
    blade.position.set(Math.cos(angle) * 0.64, 0.39, Math.sin(angle) * 0.64)
    group.add(blade)

    const foot = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), accent)
    foot.position.set(Math.cos(angle) * 0.45, 0.15, Math.sin(angle) * 0.45)
    group.add(foot)
  })

  const cameraBody = rounded(0.22, 0.17, 0.12, 0.03, carbon)
  cameraBody.position.set(0, 0.31, 0.31)
  group.add(cameraBody)

  const lensMesh = mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.06, 24), lens)
  lensMesh.rotation.x = Math.PI / 2
  lensMesh.position.set(0, 0.31, 0.39)
  group.add(lensMesh)

  const antenna = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 8), carbon)
  antenna.position.set(-0.2, 0.26, -0.28)
  antenna.rotation.z = 0.5
  group.add(antenna)

  const shadow = makeContactShadow(0.85, 0.22)
  shadow.position.y = 0.002
  group.add(shadow)

  group.scale.setScalar(1.08)
  group.position.y = 0.02
  return group
}

/* -------------------------------- companion -------------------------------- */

export function createCompanion() {
  const group = new THREE.Group()
  group.name = 'companion-four'

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: '#ded7e2',
    roughness: 0.34,
    clearcoat: 0.42,
    clearcoatRoughness: 0.35,
  })
  const visorMaterial = new THREE.MeshPhysicalMaterial({
    color: '#23221f',
    roughness: 0.18,
    metalness: 0.8,
    clearcoat: 0.8,
  })
  const accent = new THREE.MeshPhysicalMaterial({
    color: '#c56d49',
    roughness: 0.4,
    clearcoat: 0.4,
  })

  const base = mesh(
    new THREE.CylinderGeometry(0.4, 0.43, 0.08, 64),
    stone(),
  )
  base.position.y = 0.04
  group.add(base)

  const shadow = makeContactShadow(0.58, 0.24)
  shadow.position.y = 0.004
  group.add(shadow)

  const body = mesh(new THREE.CapsuleGeometry(0.22, 0.28, 12, 32), bodyMaterial)
  body.scale.set(1, 1, 0.9)
  body.position.y = 0.78
  group.add(body)

  const chest = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 24), accent)
  chest.rotation.x = Math.PI / 2
  chest.position.set(0, 0.84, 0.21)
  group.add(chest)

  const head = mesh(new THREE.SphereGeometry(0.29, 48, 36), bodyMaterial)
  head.scale.set(1, 0.98, 0.94)
  head.position.y = 1.32
  group.add(head)

  const visor = rounded(0.42, 0.14, 0.07, 0.035, visorMaterial)
  visor.position.set(0, 1.34, 0.22)
  group.add(visor)

  const visorGlow = mesh(
    new THREE.PlaneGeometry(0.31, 0.025),
    new THREE.MeshBasicMaterial({ color: '#ffd8a4', transparent: true, opacity: 0.8, toneMapped: false }),
    false,
    false,
  )
  visorGlow.position.set(0, 1.34, 0.258)
  group.add(visorGlow)

  const earGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.06, 24)
  const earLeft = mesh(earGeometry, accent)
  earLeft.rotation.z = Math.PI / 2
  earLeft.position.set(-0.29, 1.33, 0)
  group.add(earLeft)
  const earRight = earLeft.clone()
  earRight.position.x = 0.29
  group.add(earRight)

  const armGeometry = new THREE.CapsuleGeometry(0.07, 0.24, 8, 20)
  const armLeft = mesh(armGeometry, bodyMaterial)
  armLeft.position.set(-0.29, 0.78, 0)
  armLeft.rotation.z = 0.2
  group.add(armLeft)
  const armRight = armLeft.clone()
  armRight.position.x = 0.29
  armRight.rotation.z = -0.2
  group.add(armRight)

  const legGeometry = new THREE.CapsuleGeometry(0.09, 0.13, 8, 20)
  const legLeft = mesh(legGeometry, bodyMaterial)
  legLeft.position.set(-0.12, 0.38, 0)
  group.add(legLeft)
  const legRight = legLeft.clone()
  legRight.position.x = 0.12
  group.add(legRight)

  const footGeometry = new THREE.SphereGeometry(0.1, 24, 16)
  const footLeft = mesh(footGeometry, accent)
  footLeft.scale.set(1, 0.58, 1.2)
  footLeft.position.set(-0.12, 0.29, 0.02)
  group.add(footLeft)
  const footRight = footLeft.clone()
  footRight.position.x = 0.12
  group.add(footRight)

  group.rotation.y = -0.2
  return group
}

/* --------------------------------- phone dock ------------------------------ */

export function createPhoneDock() {
  const group = new THREE.Group()
  group.name = 'atelier-dock'

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: '#c9c0af',
    roughness: 0.52,
    clearcoat: 0.16,
  })
  const dark = new THREE.MeshPhysicalMaterial({
    color: '#171815',
    roughness: 0.14,
    metalness: 0.2,
    clearcoat: 0.9,
  })

  const base = rounded(1.2, 0.1, 0.82, 0.05, bodyMaterial)
  base.position.y = 0.05
  group.add(base)

  const back = rounded(1.0, 0.66, 0.09, 0.04, bodyMaterial)
  back.position.set(0, 0.37, -0.26)
  back.rotation.x = -0.2
  group.add(back)

  const lip = rounded(1.08, 0.06, 0.16, 0.03, bodyMaterial)
  lip.position.set(0, 0.13, 0.27)
  group.add(lip)

  const phone = rounded(0.62, 1.0, 0.032, 0.05, dark)
  phone.position.set(0, 0.6, -0.16)
  phone.rotation.x = -0.2
  group.add(phone)

  const screen = rounded(0.55, 0.9, 0.002, 0.035, new THREE.MeshPhysicalMaterial({
    color: '#20231e',
    roughness: 0.08,
    metalness: 0.4,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  }))
  screen.position.set(0, 0.6, -0.139)
  screen.rotation.x = -0.2
  group.add(screen)

  const highlight = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.75),
    new THREE.MeshBasicMaterial({
      color: '#fdf4e4',
      transparent: true,
      opacity: 0.07,
      toneMapped: false,
    }),
  )
  highlight.position.set(0, 0.6, -0.135)
  highlight.rotation.x = -0.2
  group.add(highlight)

  const shadow = makeContactShadow(0.8, 0.22)
  shadow.position.y = 0.002
  group.add(shadow)

  return group
}

/* --------------------------------- shift knob ------------------------------ */

export function createShiftKnob() {
  const group = new THREE.Group()
  group.name = 'marlowe-knob'

  const graphite = new THREE.MeshPhysicalMaterial({
    color: '#292a27',
    roughness: 0.44,
    metalness: 0.15,
    clearcoat: 0.35,
    clearcoatRoughness: 0.28,
  })
  const brass = new THREE.MeshPhysicalMaterial({
    color: '#b2955d',
    roughness: 0.3,
    metalness: 0.95,
  })

  const knob = mesh(
    flutedLathe(
      [
        [0, 0],
        [0.28, 0],
        [0.31, 0.03],
        [0.3, 0.07],
        [0.25, 0.12],
        [0.28, 0.2],
        [0.34, 0.34],
        [0.37, 0.48],
        [0.33, 0.61],
        [0.24, 0.7],
        [0, 0.74],
      ],
      { flutes: 26, amplitude: 0.012, twist: 0.03, segments: 192 },
    ),
    graphite,
  )
  group.add(knob)

  const ring = mesh(new THREE.TorusGeometry(0.268, 0.02, 12, 72), brass)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.105
  group.add(ring)

  const shadow = makeContactShadow(0.58, 0.26)
  shadow.position.y = 0.002
  group.add(shadow)

  return group
}

/* --------------------------------- arc topper ------------------------------ */

export function createArcTopper() {
  const group = new THREE.Group()
  group.name = 'arc-topper'

  const gold = new THREE.MeshPhysicalMaterial({
    color: '#c7a45f',
    roughness: 0.24,
    metalness: 1,
    envMapIntensity: 1.4,
  })
  const cakeMaterial = new THREE.MeshPhysicalMaterial({
    color: '#f2ede3',
    roughness: 0.7,
    clearcoat: 0.1,
  })

  const cake = mesh(
    new THREE.CylinderGeometry(0.72, 0.75, 0.42, 96),
    cakeMaterial,
  )
  cake.position.y = 0.23
  group.add(cake)

  const band = mesh(new THREE.TorusGeometry(0.735, 0.006, 8, 128), gold)
  band.rotation.x = Math.PI / 2
  band.position.y = 0.32
  group.add(band)

  const archCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.44, 0.46, 0),
    new THREE.Vector3(-0.44, 0.9, 0),
    new THREE.Vector3(-0.35, 1.19, 0),
    new THREE.Vector3(0, 1.28, 0),
    new THREE.Vector3(0.35, 1.19, 0),
    new THREE.Vector3(0.44, 0.9, 0),
    new THREE.Vector3(0.44, 0.46, 0),
  ])
  const arch = mesh(new THREE.TubeGeometry(archCurve, 120, 0.018, 12, false), gold)
  group.add(arch)

  const heartShape = new THREE.Shape()
  heartShape.moveTo(0, 0.06)
  heartShape.bezierCurveTo(0.01, 0.1, 0.09, 0.13, 0.09, 0.06)
  heartShape.bezierCurveTo(0.09, 0.01, 0.02, -0.03, 0, -0.07)
  heartShape.bezierCurveTo(-0.02, -0.03, -0.09, 0.01, -0.09, 0.06)
  heartShape.bezierCurveTo(-0.09, 0.13, -0.01, 0.1, 0, 0.06)
  const heart = mesh(
    new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelSize: 0.01,
      bevelThickness: 0.008,
      bevelSegments: 2,
    }),
    gold,
  )
  heart.scale.setScalar(0.85)
  heart.position.set(0, 1.02, -0.01)
  group.add(heart)

  const leftRing = mesh(new THREE.TorusGeometry(0.055, 0.009, 8, 32), gold)
  leftRing.position.set(-0.22, 1.1, 0)
  group.add(leftRing)
  const rightRing = leftRing.clone()
  rightRing.position.x = 0.22
  group.add(rightRing)

  const shadow = makeContactShadow(0.85, 0.22)
  shadow.position.y = 0.002
  group.add(shadow)

  return group
}

/* -------------------------------- dental arch ------------------------------ */

export function createDentalArch() {
  const group = new THREE.Group()
  group.name = 'arch-study'

  const gumMaterial = new THREE.MeshPhysicalMaterial({
    color: '#ded5c9',
    roughness: 0.66,
    clearcoat: 0.08,
  })
  const toothMaterial = new THREE.MeshPhysicalMaterial({
    color: '#f5f1e9',
    roughness: 0.44,
    clearcoat: 0.2,
  })

  const curvePoints: THREE.Vector3[] = []
  for (let index = 0; index <= 40; index += 1) {
    const theta = (index / 40) * Math.PI
    curvePoints.push(new THREE.Vector3(Math.cos(theta) * 0.64, 0.16, Math.sin(theta) * 0.42 - 0.08))
  }
  const gumCurve = new THREE.CatmullRomCurve3(curvePoints)
  const gum = mesh(new THREE.TubeGeometry(gumCurve, 80, 0.075, 14, false), gumMaterial)
  group.add(gum)

  const toothCount = 14
  for (let index = 0; index < toothCount; index += 1) {
    const t = (index + 0.5) / toothCount
    const theta = t * Math.PI
    const x = Math.cos(theta) * 0.64
    const z = Math.sin(theta) * 0.42 - 0.08
    const central = 1 - Math.abs(t - 0.5) * 2
    const height = 0.16 + central * 0.12 + (index % 2) * 0.01
    const width = 0.11 + central * 0.035
    const tooth = rounded(width, height, 0.13, 0.03, toothMaterial)
    tooth.position.set(x, 0.23 + height / 2, z)
    tooth.rotation.y = -theta + Math.PI / 2
    tooth.rotation.z = Math.sin(theta) * 0.08
    group.add(tooth)
  }

  const base = mesh(
    new THREE.CylinderGeometry(0.8, 0.84, 0.07, 64),
    new THREE.MeshPhysicalMaterial({ color: '#e7e0d6', roughness: 0.7 }),
  )
  base.position.y = 0.035
  group.add(base)

  const shadow = makeContactShadow(0.9, 0.22)
  shadow.position.y = 0.002
  group.add(shadow)

  group.rotation.y = 0.1
  return group
}

export function createProductObject(id: string) {
  switch (id) {
    case 'portrait-bust':
      return null
    case 'mobius-vase':
      return createVase()
    case 'halo-lamp':
      return createLamp()
    case 'terra-planter':
      return createPlanter()
    case 'orbit-desk':
      return createDeskSystem()
    case 'aster-ring':
      return createRing()
    case 'kite-tabletop':
      return createTabletop()
    case 'echo-house':
      return createArchitecture()
    case 'pulse-drone':
      return createDrone()
    case 'companion-four':
      return createCompanion()
    case 'atelier-dock':
      return createPhoneDock()
    case 'marlowe-knob':
      return createShiftKnob()
    case 'arc-topper':
      return createArcTopper()
    case 'arch-study':
      return createDentalArch()
    default:
      return createVase()
  }
}
