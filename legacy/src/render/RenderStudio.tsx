import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { createPrinter } from '../lib/three/printer'
import { createPortraitBust } from '../lib/three/portrait'
import {
  createArcTopper,
  createArchitecture,
  createCompanion,
  createDentalArch,
  createDeskSystem,
  createDrone,
  createLamp,
  createPhoneDock,
  createPlanter,
  createRing,
  createShiftKnob,
  createTabletop,
  createVase,
} from '../lib/three/objects'
import { createStudio, resizeRenderer } from '../lib/three/studio'
import { products } from '../data/catalog'

function objectForProduct(id: string) {
  switch (id) {
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

function pedestal(radius: number, height: number, tone = '#d9d3c7') {
  const group = new THREE.Group()
  const material = new THREE.MeshPhysicalMaterial({
    color: tone,
    roughness: 0.66,
    clearcoat: 0.12,
  })
  const top = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.02, 0.035, 96), material)
  top.position.y = height
  top.castShadow = true
  top.receiveShadow = true
  group.add(top)
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.985, radius * 0.94, height, 96),
    material,
  )
  body.position.y = height / 2
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)
  return group
}

function buildScene(id: string, kind: 'product' | 'project'): Promise<THREE.Group> | THREE.Group {
  if (kind === 'product' && id === 'portrait') {
    return createPortraitBust('#f0ece4').then(({ group }) => {
      group.rotation.y = -0.26
      return group
    })
  }

  if (kind === 'project') {
    switch (id) {
      case 'maya': {
        return createPortraitBust('#f1ede5').then(({ group }) => {
          group.rotation.y = -0.34
          return group
        })
      }
      case 'wren': {
        const group = new THREE.Group()
        const model = createArchitecture()
        model.rotation.y = -0.4
        group.add(model)
        return group
      }
      case 'noon': {
        const group = new THREE.Group()
        for (let index = 0; index < 3; index += 1) {
          const lamp = createLamp()
          lamp.position.set((index - 1) * 1.25, 0, index === 1 ? 0.25 : 0)
          lamp.scale.setScalar(index === 1 ? 1 : 0.84)
          lamp.rotation.y = index === 0 ? 0.4 : index === 2 ? -0.4 : 0
          group.add(lamp)
        }
        return group
      }
      case 'aster': {
        const group = new THREE.Group()
        const base = pedestal(0.62, 0.42, '#d8d0c4')
        group.add(base)
        const ring = createRing()
        ring.position.y = 0.56
        ring.scale.setScalar(1.5)
        ring.rotation.y = 0.3
        group.add(ring)
        return group
      }
      case 'kite': {
        const group = new THREE.Group()
        const model = createTabletop()
        model.rotation.y = -0.2
        group.add(model)
        return group
      }
      case 'pulse': {
        const group = new THREE.Group()
        const drone = createDrone()
        drone.rotation.y = 0.5
        group.add(drone)
        return group
      }
      default:
        return createVase()
    }
  }

  return objectForProduct(id)
}

export function RenderStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tone, setTone] = useState('#eeeae2')
  const [architectural, setArchitectural] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const kind = (params.get('kind') === 'project' ? 'project' : 'product') as 'product' | 'project'
    const id = params.get('render') ?? 'mobius-vase'
    const product = products.find((item) => item.id === id)
    const projectTones: Record<string, string> = {
      maya: '#ecdcd0',
      wren: '#e8e4da',
      noon: '#f0dfc9',
      aster: '#f0dcdc',
      kite: '#dee8ec',
      pulse: '#dfe2e0',
    }
    const nextTone = product?.tone ?? projectTones[id] ?? '#eeeae2'
    setTone(nextTone)

    const isArchitectural = id === 'echo-house' || (kind === 'project' && id === 'wren')
    setArchitectural(isArchitectural)

    const canvas = canvasRef.current
    if (!canvas) return
    const width = window.innerWidth
    const height = window.innerHeight

    const { renderer, scene, camera, dispose } = createStudio(canvas, {
      fov: 29,
      exposure: isArchitectural ? 0.84 : 0.98,
      maxPixelRatio: 2,
    })
    renderer.shadowMap.enabled = true
    if (isArchitectural) scene.environmentIntensity = 0.52
    const key = scene.children.find((child) => child.type === 'DirectionalLight' && child.castShadow)
    if (key && key instanceof THREE.DirectionalLight) key.intensity = isArchitectural ? 2 : 2.45
    resizeRenderer(renderer, camera, width, height)

    let disposed = false
    let raf = 0
    let group: THREE.Group | null = null

    const fitCamera = (target: THREE.Group) => {
      const bounds = new THREE.Box3()
      target.traverse((child) => {
        const mesh = child as THREE.Mesh
        if (mesh.isMesh && !mesh.userData.ignoreBounds) {
          mesh.geometry.computeBoundingBox()
          const box = mesh.geometry.boundingBox?.clone()
          if (box) {
            box.applyMatrix4(mesh.matrixWorld)
            bounds.union(box)
          }
        }
      })
      if (bounds.isEmpty()) bounds.setFromObject(target)
      const size = bounds.getSize(new THREE.Vector3())
      const center = bounds.getCenter(new THREE.Vector3())

      const fov = THREE.MathUtils.degToRad(camera.fov)
      const aspect = width / height
      const fitHeight = size.y / 2 / Math.tan(fov / 2)
      const fitWidth = size.x / 2 / (Math.tan(fov / 2) * aspect)
      const distance = Math.max(fitHeight, fitWidth) * (isArchitectural ? 1.1 : 1.24) + size.z * 0.5
      const direction = new THREE.Vector3(0.58, 0.3, 1).normalize()
      camera.position.copy(center).addScaledVector(direction, distance)
      camera.lookAt(center.x, center.y + size.y * 0.01, center.z)
      camera.updateProjectionMatrix()
    }

    const renderFrame = () => {
      if (group) {
        group.rotation.y += 0.00035
        fitCamera(group)
      }
      renderer.render(scene, camera)
      if (!disposed) raf = requestAnimationFrame(renderFrame)
    }

    const start = buildScene(id, kind)
    Promise.resolve(start).then((built) => {
      if (disposed) return
      group = built
      scene.add(group)
      group.updateMatrixWorld(true)
      fitCamera(group)
      renderer.render(scene, camera)
      setReady(true)
      window.__FORMA_RENDER_READY__ = true
      renderFrame()
    })

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.__FORMA_RENDER_READY__ = false
      scene.traverse((child) => {
        const object = child as THREE.Mesh
        if (!object.isMesh) return
        object.geometry.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => material.dispose())
      })
      dispose()
    }
  }, [])

  return (
    <div
      className="render-stage"
      style={{
        background: architectural
          ? `radial-gradient(78% 64% at 66% 22%, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0) 60%), linear-gradient(158deg, #e8e3da 0%, ${tone} 50%, #c9c2b4 100%)`
          : `radial-gradient(90% 75% at 68% 28%, #ffffff 0%, rgba(255,255,255,0) 62%), radial-gradient(120% 110% at 50% 100%, ${tone} 20%, ${tone} 100%)`,
      }}
    >
      <canvas ref={canvasRef} className={`render-stage__canvas ${ready ? 'is-ready' : ''}`} />
      <div className="render-stage__vignette" />
    </div>
  )
}

declare global {
  interface Window {
    __FORMA_RENDER_READY__?: boolean
  }
}
