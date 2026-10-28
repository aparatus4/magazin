import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Finish } from '../data/catalog'
import { createPortraitBust } from '../lib/three/portrait'
import { createStudio, resizeRenderer } from '../lib/three/studio'

export function PortraitViewer({ finish }: { finish: Finish }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null)
  const finishRef = useRef(finish)
  const [ready, setReady] = useState(false)

  finishRef.current = finish

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const { renderer, scene, camera, dispose } = createStudio(canvas, {
      fov: 30,
      exposure: 1.0,
      maxPixelRatio: 1.6,
    })

    resizeRenderer(renderer, camera, wrap.clientWidth, wrap.clientHeight)
    camera.position.set(0.8, 1.55, 4.75)
    camera.lookAt(0, 1.02, 0)

    let disposed = false
    let raf = 0
    let group: THREE.Group | null = null
    const clock = new THREE.Clock()
    let elapsed = 0
    const pointer = { dragging: false, lastX: 0, offset: 0, tilt: 0 }
    const lookAt = new THREE.Vector3(0, 1.02, 0)

    createPortraitBust(finishRef.current.color)
      .then((bust) => {
        if (disposed) return
        group = bust.group
        group.position.y = -0.06
        materialRef.current = bust.material
        const active = finishRef.current
        bust.material.color.set(active.color)
        bust.material.roughness = active.roughness
        bust.material.metalness = active.metalness
        bust.material.clearcoat = active.clearcoat
        bust.material.transmission = active.transmission
        bust.material.transparent = active.transmission > 0
        bust.material.opacity = active.transmission > 0 ? 0.96 : 1
        scene.add(group)
        setReady(true)
      })
      .catch(() => setReady(false))

    const resize = () => {
      const bounds = wrap.getBoundingClientRect()
      resizeRenderer(renderer, camera, bounds.width, bounds.height)
      camera.position.set(0.8, 1.55, 4.75)
      camera.lookAt(lookAt)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)
    resize()

    const onPointerDown = (event: PointerEvent) => {
      pointer.dragging = true
      pointer.lastX = event.clientX
      canvas.setPointerCapture(event.pointerId)
      canvas.classList.add('is-dragging')
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!pointer.dragging) return
      const delta = event.clientX - pointer.lastX
      pointer.lastX = event.clientX
      pointer.offset += delta * 0.007
    }
    const onPointerUp = (event: PointerEvent) => {
      pointer.dragging = false
      canvas.classList.remove('is-dragging')
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    }
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const delta = Math.min(clock.getDelta(), 0.05)
      elapsed += delta
      if (group) {
        const spin = reduceMotion ? 0 : elapsed * 0.14
        group.rotation.y = -0.28 + spin + pointer.offset
        group.rotation.x = THREE.MathUtils.clamp(Math.sin(elapsed * 0.4) * 0.012 + pointer.tilt, -0.1, 0.1)
        pointer.offset *= 0.985
      }
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
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

  useEffect(() => {
    const material = materialRef.current
    if (!material) return
    material.color.set(finish.color)
    material.roughness = finish.roughness
    material.metalness = finish.metalness
    material.clearcoat = finish.clearcoat
    material.transmission = finish.transmission
    material.thickness = finish.transmission > 0 ? 0.4 : 0
    material.transparent = finish.transmission > 0
    material.opacity = finish.transmission > 0 ? 0.96 : 1
    material.needsUpdate = true
  }, [finish])

  return (
    <div ref={wrapRef} className={`viewer viewer--portrait ${ready ? 'is-ready' : ''}`}>
      <canvas ref={canvasRef} className="viewer__canvas" aria-label="Rotating 3D portrait bust" />
      {!ready && <span className="viewer__loading">Preparing the sculpture…</span>}
      <span className="viewer__hint">
        <span className="viewer__hint-ring" aria-hidden="true" />
        Drag to turn
      </span>
    </div>
  )
}
