import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export interface Studio {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  keyLight: THREE.DirectionalLight
  dispose: () => void
}

export function createStudio(
  canvas: HTMLCanvasElement,
  options: { exposure?: number; maxPixelRatio?: number; fov?: number } = {},
): Studio {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = options.exposure ?? 1.02
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.maxPixelRatio ?? 1.6))
  renderer.localClippingEnabled = true

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(options.fov ?? 28, 1, 0.1, 100)
  camera.position.set(0.9, 1.65, 4.6)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const envTexture = pmrem.fromScene(room, 0.04).texture
  scene.environment = envTexture
  scene.environmentIntensity = 0.7
  pmrem.dispose()

  const keyLight = new THREE.DirectionalLight(0xfff3e3, 3.1)
  keyLight.position.set(4.2, 6.5, 4.5)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1536, 1536)
  keyLight.shadow.camera.near = 1
  keyLight.shadow.camera.far = 16
  keyLight.shadow.camera.left = -4
  keyLight.shadow.camera.right = 4
  keyLight.shadow.camera.top = 5
  keyLight.shadow.camera.bottom = -2
  keyLight.shadow.bias = -0.0003
  keyLight.shadow.normalBias = 0.025
  scene.add(keyLight)

  const fill = new THREE.DirectionalLight(0xdfe9ff, 1.45)
  fill.position.set(-5, 2.4, 3.2)
  scene.add(fill)

  const rim = new THREE.DirectionalLight(0xffdbc2, 3)
  rim.position.set(-1.5, 4.2, -4.5)
  scene.add(rim)

  const bounce = new THREE.HemisphereLight(0xfff8ef, 0xc7c0b5, 0.55)
  scene.add(bounce)

  const dispose = () => {
    scene.environment = null
    envTexture.dispose()
    room.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        materials.forEach((material) => material.dispose())
      }
    })
    renderer.dispose()
  }

  return { renderer, scene, camera, keyLight, dispose }
}

export function resizeRenderer(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
) {
  if (width <= 0 || height <= 0) return
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height, false)
}

export function makeContactShadow(radius = 1.35, opacity = 0.2): THREE.Mesh {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(24, 20, 14, 0.82)')
    gradient.addColorStop(0.32, 'rgba(24, 20, 14, 0.38)')
    gradient.addColorStop(0.68, 'rgba(24, 20, 14, 0.08)')
    gradient.addColorStop(1, 'rgba(24, 20, 14, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const geometry = new THREE.PlaneGeometry(radius * 2.6, radius * 2.6)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = 0.002
  mesh.renderOrder = 2
  mesh.userData.ignoreBounds = true
  return mesh
}

export const porcelainMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    color: '#f0ece4',
    roughness: 0.36,
    metalness: 0,
    clearcoat: 0.38,
    clearcoatRoughness: 0.34,
    envMapIntensity: 0.9,
  })

export const graphiteMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    color: '#23231f',
    roughness: 0.55,
    metalness: 0.06,
    clearcoat: 0.14,
    clearcoatRoughness: 0.4,
  })

export const brassMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    color: '#b69963',
    roughness: 0.28,
    metalness: 0.92,
    envMapIntensity: 1.2,
  })
