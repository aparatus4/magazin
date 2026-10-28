import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { createPrinter } from '../lib/three/printer'
import { createStudio, resizeRenderer } from '../lib/three/studio'

export function PrinterViewer() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const { renderer, scene, camera, dispose } = createStudio(canvas, {
      fov: 31,
      exposure: 1.02,
      maxPixelRatio: 1.5,
    })
    const printer = createPrinter()
    printer.group.rotation.y = -0.44
    scene.add(printer.group)
    setReady(true)

    const lookAt = new THREE.Vector3(0, 0.92, 0)
    const offset = new THREE.Vector3(3.4, 1.23, 6.4)
    const position = new THREE.Vector3()

    const resize = () => {
      const bounds = wrap.getBoundingClientRect()
      resizeRenderer(renderer, camera, bounds.width, bounds.height)
      const scale = camera.aspect < 1 ? 0.82 : camera.aspect < 1.5 ? 0.73 : 0.68
      position.copy(lookAt).addScaledVector(offset, scale)
      camera.position.copy(position)
      camera.lookAt(lookAt)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)
    resize()

    const clock = new THREE.Clock()
    let elapsed = 0
    let raf = 0
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
      pointer.offset += (event.clientX - pointer.lastX) * 0.006
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
      printer.group.rotation.y =
        -0.44 + pointer.offset + (reduceMotion ? 0 : Math.sin(elapsed * 0.2) * 0.1)
      printer.update(elapsed, delta)
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

  return (
    <div ref={wrapRef} className={`viewer viewer--printer ${ready ? 'is-ready' : ''}`}>
      <canvas ref={canvasRef} className="viewer__canvas" aria-label="Animated 3D printer" />
      {!ready && <span className="viewer__loading">Warming the nozzle…</span>}
    </div>
  )
}
