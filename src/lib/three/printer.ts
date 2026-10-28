import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { flutedLathe } from './objects'
import { makeContactShadow } from './studio'

export interface PrinterObject {
  group: THREE.Group
  update: (elapsed: number, delta: number) => number
}

function metalMaterial(color: string, roughness: number, metalness: number) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    clearcoat: 0.25,
    clearcoatRoughness: 0.4,
    envMapIntensity: 1.1,
  })
}

function rounded(
  width: number,
  height: number,
  depth: number,
  radius: number,
  material: THREE.Material,
) {
  const object = new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 4, radius), material)
  object.castShadow = true
  object.receiveShadow = true
  return object
}

export function createPrinter(): PrinterObject {
  const group = new THREE.Group()
  group.name = 'forma-printer'

  const graphite = metalMaterial('#2c2d2a', 0.4, 0.32)
  const dark = metalMaterial('#1b1c1a', 0.55, 0.18)
  const aluminium = metalMaterial('#9a9992', 0.3, 0.78)
  const accent = new THREE.MeshPhysicalMaterial({
    color: '#d5683c',
    roughness: 0.4,
    metalness: 0.05,
    clearcoat: 0.5,
  })
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#e9efec',
    roughness: 0.06,
    metalness: 0.1,
    transparent: true,
    opacity: 0.075,
    side: THREE.DoubleSide,
    depthWrite: false,
    envMapIntensity: 1.1,
  })
  const screenMaterial = new THREE.MeshBasicMaterial({
    color: '#cddcc6',
    toneMapped: false,
  })

  const base = rounded(2.3, 0.2, 1.8, 0.06, graphite)
  base.position.y = 0.1
  group.add(base)

  const chamfer = rounded(2.15, 0.08, 1.65, 0.04, dark)
  chamfer.position.y = 0.22
  group.add(chamfer)

  const buildPlate = rounded(1.3, 0.035, 1.28, 0.03, metalMaterial('#1b1d1b', 0.3, 0.6))
  buildPlate.position.y = 0.29
  group.add(buildPlate)

  const plateEdge = rounded(1.36, 0.02, 1.34, 0.02, aluminium)
  plateEdge.position.y = 0.275
  group.add(plateEdge)

  // Four posts and top frame.
  const postPositions = [
    [-1.04, -0.78],
    [1.04, -0.78],
    [-1.04, 0.78],
    [1.04, 0.78],
  ]
  postPositions.forEach(([x, z]) => {
    const post = rounded(0.06, 1.72, 0.06, 0.022, graphite)
    post.position.set(x, 1.05, z)
    group.add(post)
  })

  const topFrameFront = rounded(2.12, 0.045, 0.045, 0.018, graphite)
  topFrameFront.position.set(0, 1.9, 0.78)
  group.add(topFrameFront)
  const topFrameBack = topFrameFront.clone()
  topFrameBack.position.z = -0.78
  group.add(topFrameBack)
  const topFrameLeft = rounded(0.045, 0.045, 1.6, 0.018, graphite)
  topFrameLeft.position.set(-1.04, 1.9, 0)
  group.add(topFrameLeft)
  const topFrameRight = topFrameLeft.clone()
  topFrameRight.position.x = 1.04
  group.add(topFrameRight)

  // Glass enclosure.
  const backGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.01, 1.62), glass)
  backGlass.position.set(0, 1.02, -0.78)
  group.add(backGlass)
  const leftGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 1.62), glass)
  leftGlass.rotation.y = Math.PI / 2
  leftGlass.position.set(-1.04, 1.02, 0)
  group.add(leftGlass)
  const rightGlass = leftGlass.clone()
  rightGlass.position.x = 1.04
  group.add(rightGlass)
  const topGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.01, 1.55), glass)
  topGlass.rotation.x = Math.PI / 2
  topGlass.position.y = 1.9
  group.add(topGlass)

  // Light strip inside the chamber.
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.012, 0.03),
    new THREE.MeshBasicMaterial({ color: '#fff2d9', toneMapped: false }),
  )
  strip.position.set(0, 1.84, -0.56)
  group.add(strip)
  const chamberLight = new THREE.PointLight(0xffe4be, 1.2, 3.2, 2)
  chamberLight.position.set(0, 1.7, 0.1)
  group.add(chamberLight)

  // Vertical guides.
  const guideLeft = rounded(0.035, 1.5, 0.035, 0.015, aluminium)
  guideLeft.position.set(-0.58, 1.02, -0.56)
  group.add(guideLeft)
  const guideRight = guideLeft.clone()
  guideRight.position.x = 0.58
  group.add(guideRight)

  // X gantry that rises with the print.
  const gantry = new THREE.Group()
  const gantryBeam = rounded(1.26, 0.055, 0.055, 0.018, aluminium)
  gantry.add(gantryBeam)
  const gantryBlockLeft = rounded(0.09, 0.13, 0.1, 0.02, dark)
  gantryBlockLeft.position.set(-0.6, 0, 0)
  gantry.add(gantryBlockLeft)
  const gantryBlockRight = gantryBlockLeft.clone()
  gantryBlockRight.position.x = 0.6
  gantry.add(gantryBlockRight)
  group.add(gantry)

  const printhead = new THREE.Group()
  const headBody = rounded(0.22, 0.17, 0.22, 0.04, graphite)
  headBody.position.y = 0.12
  printhead.add(headBody)
  const headFace = rounded(0.15, 0.11, 0.04, 0.015, dark)
  headFace.position.set(0, 0.11, 0.115)
  printhead.add(headFace)
  const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.12, 24), aluminium)
  nozzle.rotation.x = Math.PI
  nozzle.position.y = -0.015
  printhead.add(nozzle)
  const hotTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 12, 12),
    new THREE.MeshBasicMaterial({ color: '#ff9b58', toneMapped: false }),
  )
  hotTip.position.y = -0.075
  printhead.add(hotTip)
  const nozzleGlow = new THREE.PointLight(0xffa263, 0.35, 0.8, 2)
  nozzleGlow.position.y = -0.08
  printhead.add(nozzleGlow)
  group.add(printhead)

  // The object being printed, revealed with a clipping plane.
  const printScale = 1.34
  const printHeight = 0.82 * printScale
  const profile: Array<[number, number]> = [
    [0, 0],
    [0.27, 0],
    [0.33, 0.12],
    [0.38, 0.3],
    [0.37, 0.46],
    [0.3, 0.6],
    [0.25, 0.73],
    [0.27, 0.8],
    [0.24, 0.82],
  ]
  const printMaterial = new THREE.MeshPhysicalMaterial({
    color: '#e7e0d0',
    roughness: 0.5,
    clearcoat: 0.15,
    clearcoatRoughness: 0.5,
    side: THREE.DoubleSide,
    clippingPlanes: [],
    clipShadows: true,
  })
  const printed = new THREE.Mesh(
    flutedLathe(profile, { flutes: 16, amplitude: 0.022, twist: 0.2, segments: 128 }),
    printMaterial,
  )
  printed.castShadow = true
  printed.receiveShadow = true
  printed.position.y = 0.31
  printed.scale.setScalar(printScale)
  group.add(printed)

  const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.315)
  printMaterial.clippingPlanes = [clipPlane]

  const printGlow = new THREE.Mesh(
    new THREE.RingGeometry(0.25, 0.32, 64),
    new THREE.MeshBasicMaterial({
      color: '#ffb27e',
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      toneMapped: false,
      depthWrite: false,
    }),
  )
  printGlow.rotation.x = -Math.PI / 2
  group.add(printGlow)

  // Small control panel.
  const screenRecess = rounded(0.5, 0.18, 0.035, 0.03, dark)
  screenRecess.position.set(0.58, 0.14, 0.9)
  group.add(screenRecess)
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), screenMaterial)
  screen.position.set(0.58, 0.14, 0.921)
  group.add(screen)
  const screenLine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.012),
    new THREE.MeshBasicMaterial({ color: '#2b3c2e', toneMapped: false }),
  )
  screenLine.position.set(0.53, 0.145, 0.924)
  group.add(screenLine)

  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 32), aluminium)
  dial.rotation.x = Math.PI / 2
  dial.position.set(0.22, 0.14, 0.91)
  group.add(dial)

  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.24, 0.035),
    new THREE.MeshBasicMaterial({ color: '#8a8880', toneMapped: false }),
  )
  logo.position.set(-0.55, 0.145, 0.901)
  group.add(logo)

  const footMaterial = metalMaterial('#1b1c19', 0.7, 0.05)
  for (const x of [-0.94, 0.94]) {
    for (const z of [-0.68, 0.68]) {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.04, 24), footMaterial)
      foot.position.set(x, 0.02, z)
      group.add(foot)
    }
  }

  const shadow = makeContactShadow(1.5, 0.28)
  shadow.position.y = 0.001
  group.add(shadow)

  group.position.y = 0

  const update = (elapsed: number) => {
    const cycle = elapsed % 19
    const progress = Math.min(cycle / 14.5, 1)
    const top = 0.31 + printHeight * progress
    clipPlane.constant = top + 0.001

    const orbit = elapsed * 1.5
    const nozzleX = Math.cos(orbit) * 0.15 * (1 - progress * 0.4)
    const nozzleZ = Math.sin(orbit * 0.83) * 0.12 * (1 - progress * 0.4)
    printhead.position.set(nozzleX, top + 0.1, nozzleZ)
    gantry.position.y = top + 0.22
    printGlow.position.set(0, top + 0.002, 0)
    const glowScale = Math.max(0.2, 1 - progress * 0.25) * printScale
    printGlow.scale.setScalar(glowScale)
    ;(printGlow.material as THREE.MeshBasicMaterial).opacity = progress > 0.995 ? 0.12 : 0.38
    hotTip.visible = progress < 0.998

    return progress
  }

  return { group, update }
}
