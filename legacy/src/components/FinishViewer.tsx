import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Finish } from '../data/catalog'
import { createVase } from '../lib/three/objects'
import { createStudio, resizeRenderer } from '../lib/three/studio'

export function FinishViewer({ finish }: { finish: Finish }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null)
  const vaseRef = useRef<THREE.Mesh | null>(null)
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
      exposure: 1.01,
      maxPixelRatio: 1.6,
    })

    const group = createVase({
      color: finishRef.current.color,
      roughness: finishRef.current.roughness,
      metalness: finishRef.current.metalness,
      clearcoat: finishRef.current.clearcoat,
      transmission: finishRef.current.transmission,
    })
    const vase = group.getObjectByName('vase-body') as THREE.Mesh | undefined
    if (vase) {
      vaseRef.current = vase
      materialRef.current = vase.material as THREE.MeshPhysicalMaterial
    }
    scene.add(group)
    setReady(true)

    const resize = () => {
      const bounds = wrap.getBoundingClientRect()
      resizeRenderer(renderer, camera, bounds.width, bounds.height)
      camera.position.set(0.9, 1.6, 4.8)
      camera.lookAt(0, 0.82, 0)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)
    resize()

    let raf = 0
    let elapsed = 0
    const clock = new THREE.Clock()
    const pointer = { dragging: false, lastX: 0, offset: 0 }
    let inView = true

    const visibility = new IntersectionObserver(
      (records) => {
        inView = Boolean(records[0]?.isIntersecting)
      },
      { threshold: 0.01 },
    )
    visibility.observe(wrap)

    const onPointerDown = (event: PointerEvent) => {
      pointer.dragging = true
      pointer.lastX = event.clientX
      canvas.setPointerCapture(event.pointerId)
      canvas.classList.add('is-dragging')
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!pointer.dragging) return
      pointer.offset += (event.clientX - pointer.lastX) * 0.007
      pointer.lastX = event.clientX
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
      if (!inView) return
      elapsed += delta
      if (!pointer.dragging) pointer.offset *= 0.985
      group.rotation.y = pointer.offset + (reduceMotion ? 0 : elapsed * 0.12)
      group.position.y = reduceMotion ? 0 : Math.sin(elapsed * 0.5) * 0.008
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      visibility.disconnect()
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
    const vase = vaseRef.current
    if (!material || !vase) return
    material.color.set(finish.color)
    material.roughness = finish.roughness
    material.metalness = finish.metalness
    material.clearcoat = finish.clearcoat
    material.transmission = finish.transmission
    material.thickness = finish.transmission > 0 ? 0.32 : 0
    material.transparent = finish.transmission > 0
    material.opacity = finish.transmission > 0 ? 0.94 : 1
    material.needsUpdate = true
  }, [finish])

  return (
    <div ref={wrapRef} className={`viewer viewer--finish ${ready ? 'is-ready' : ''}`}>
      <canvas ref={canvasRef} className="viewer__canvas" aria-label="Rotating vase in the selected finish" />
      {!ready && <span className="viewer__loading">Glazing the object…</span>}
      <span className="viewer__hint">
        <span className="viewer__hint-ring" aria-hidden="true" />
        Drag to turn
      </span>
    </div>
  )
}
