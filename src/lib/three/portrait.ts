import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { brassMaterial, graphiteMaterial, makeContactShadow, porcelainMaterial } from './studio'

let headGeometryPromise: Promise<THREE.BufferGeometry> | null = null

export function loadPortraitGeometry(): Promise<THREE.BufferGeometry> {
  if (!headGeometryPromise) {
    headGeometryPromise = new GLTFLoader()
      .loadAsync('/models/portrait-head.glb')
      .then((gltf) => {
        let found: THREE.BufferGeometry | null = null
        const candidates: THREE.Mesh[] = []
        gltf.scene.traverse((object) => {
          const mesh = object as THREE.Mesh
          if (mesh.isMesh && mesh.geometry) candidates.push(mesh)
        })
        if (candidates[0]) found = candidates[0].geometry
        if (!found) throw new Error('Portrait geometry was not found in the model.')
        found.computeVertexNormals()
        return found
      })
  }
  return headGeometryPromise
}

export interface PortraitBust {
  group: THREE.Group
  head: THREE.Mesh
  material: THREE.MeshPhysicalMaterial
}

export async function createPortraitBust(materialColor = '#f0ece4'): Promise<PortraitBust> {
  const group = new THREE.Group()
  group.name = 'portrait-bust'

  const baseProfile: THREE.Vector2[] = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.5, 0),
    new THREE.Vector2(0.52, 0.025),
    new THREE.Vector2(0.47, 0.075),
    new THREE.Vector2(0.4, 0.18),
    new THREE.Vector2(0.37, 0.42),
    new THREE.Vector2(0.4, 0.57),
    new THREE.Vector2(0.37, 0.605),
    new THREE.Vector2(0, 0.605),
  ]
  const base = new THREE.Mesh(new THREE.LatheGeometry(baseProfile, 96), graphiteMaterial())
  base.castShadow = true
  base.receiveShadow = true
  group.add(base)

  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.368, 0.012, 10, 96),
    brassMaterial(),
  )
  collar.rotation.x = Math.PI / 2
  collar.position.y = 0.596
  group.add(collar)

  const shadow = makeContactShadow(0.78, 0.32)
  shadow.position.y = 0.004
  group.add(shadow)

  const geometry = await loadPortraitGeometry()
  const material = porcelainMaterial()
  material.color.set(materialColor)
  material.roughness = 0.37
  material.clearcoat = 0.32
  material.clearcoatRoughness = 0.38
  const head = new THREE.Mesh(geometry, material)
  head.castShadow = true
  head.receiveShadow = true

  head.geometry.computeBoundingBox()
  const bounds = head.geometry.boundingBox
  if (bounds) {
    const height = bounds.max.y - bounds.min.y
    const scale = 1.42 / height
    head.scale.setScalar(scale)
    head.updateMatrixWorld(true)
    const scaledBounds = new THREE.Box3().setFromObject(head)
    head.position.x = -((scaledBounds.min.x + scaledBounds.max.x) / 2)
    head.position.z = -((scaledBounds.min.z + scaledBounds.max.z) / 2)
    head.position.y = 0.63 - scaledBounds.min.y
  }
  group.add(head)
  group.rotation.y = -0.22

  return { group, head, material }
}
