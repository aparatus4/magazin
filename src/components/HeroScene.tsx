import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { createPrinter, type PrinterObject } from '../lib/three/printer'
import { createPortraitBust } from '../lib/three/portrait'
import { createVase } from '../lib/three/objects'
import { createStudio, resizeRenderer } from '../lib/three/studio'

export type HeroVariant = 'portrait' | 'vase' | 'printer'

interface SceneEntry {
  group: THREE.Group
  fade: number
  target: number
  baseScale: number
  baseRotationY: number
}

const cameraTargets: Record<HeroVariant, { position: THREE.Vector3; look: THREE.Vector3 }> = {
  portrait: {
    position: new THREE.Vector3(0.58, 1.72, 5.35),
    look: new THREE.Vector3(0, 1.08, 0),
  },
  vase: {
    position: new THREE.Vector3(1.1, 1.5, 4.2),
    look: new THREE.Vector3(0, 0.8, 0),
  },
  printer: {
    position: new THREE.Vector3(3.5, 2.15, 6.6),
    look: new THREE.Vector3(0, 0.92, 0),
  },
}

function prepareMaterialOpacity(group: THREE.Object3D) {
  group.traverse((child) => {
    const object = child as THREE.Mesh
    if (!object.isMesh) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      if (material.userData.formaBase === undefined) {
        material.userData.formaBase = {
          transparent: material.transparent,
          opacity: material.opacity,
          depthWrite: material.depthWrite,
        }
      }
    })
  })
}

function applyOpacity(group: THREE.Object3D, value: number) {
  group.visible = value > 0.006
  if (!group.visible) return
  const clamped = Math.min(1, Math.max(0, value))
  group.traverse((child) => {
    const object = child as THREE.Mesh
    if (!object.isMesh) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      const base = material.userData.formaBase as
        | { transparent: boolean; opacity: number; depthWrite: boolean }
        | undefined
      if (!base) return
      material.opacity = base.opacity * clamped
      const needsTransparency = base.transparent || clamped < 0.995
      if (material.transparent !== needsTransparency) {
        material.transparent = needsTransparency
        material.needsUpdate = true
      }
      material.depthWrite = clamped < 0.5 ? false : base.depthWrite
    })
  })
}

export function HeroScene({ variant }: { variant: HeroVariant }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const variantRef = useRef<HeroVariant>(variant)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  variantRef.current = variant

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const { renderer, scene, camera, dispose } = createStudio(canvas, {
      fov: 30,
      maxPixelRatio: 1.5,
      exposure: 1.04,
    })

    const entries = new Map<HeroVariant, SceneEntry>()
    let printer: PrinterObject | null = null

    const register = (key: HeroVariant, group: THREE.Group, initialTarget: boolean) => {
      prepareMaterialOpacity(group)
      scene.add(group)
      entries.set(key, {
        group,
        fade: initialTarget ? 1 : 0,
        target: initialTarget ? 1 : 0,
        baseScale: group.scale.x,
        baseRotationY: group.rotation.y,
      })
      if (!initialTarget) applyOpacity(group, 0)
    }

    const vase = createVase()
    vase.position.set(0, 0, 0)
    register('vase', vase, variantRef.current === 'vase')

    const printerObject = createPrinter()
    printer = printerObject
    printer.group.position.set(0, 0, 0)
    register('printer', printer.group, variantRef.current === 'printer')

    let disposed = false
    createPortraitBust()
      .then(({ group }) => {
        if (disposed) {
          group.traverse((child) => {
            const object = child as THREE.Mesh
            if (object.isMesh) object.geometry.dispose()
          })
          return
        }
        register('portrait', group, variantRef.current === 'portrait')
        setReady(true)
      })
      .catch(() => {
        if (!disposed) setFailed(true)
      })

    const cameraLook = new THREE.Vector3().copy(cameraTargets.portrait.look)
    const targetPosition = new THREE.Vector3()
    const targetLook = new THREE.Vector3()
    const clock = new THREE.Clock()
    let elapsed = 0
    let raf = 0
    let inView = true
    let pageVisible = !document.hidden

    const pointer = {
      dragging: false,
      lastX: 0,
      lastY: 0,
      offset: 0,
      velocity: 0,
      tilt: 0,
    }

    const updateSizing = () => {
      const bounds = wrap.getBoundingClientRect()
      resizeRenderer(renderer, camera, bounds.width, bounds.height)
    }
    updateSizing()
    const observer = new ResizeObserver(updateSizing)
    observer.observe(wrap)

    const visibilityObserver = new IntersectionObserver(
      (records) => {
        inView = Boolean(records[0]?.isIntersecting)
      },
      { rootMargin: '80px', threshold: 0.01 },
    )
    visibilityObserver.observe(wrap)

    const onVisibility = () => {
      pageVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', onVisibility)

    const onPointerDown = (event: PointerEvent) => {
      pointer.dragging = true
      pointer.lastX = event.clientX
      pointer.lastY = event.clientY
      pointer.velocity = 0
      canvas.setPointerCapture(event.pointerId)
      canvas.classList.add('is-dragging')
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!pointer.dragging) return
      const deltaX = event.clientX - pointer.lastX
      const deltaY = event.clientY - pointer.lastY
      pointer.lastX = event.clientX
      pointer.lastY = event.clientY
      pointer.offset += deltaX * 0.006
      pointer.velocity = deltaX * 0.0018
      pointer.tilt = THREE.MathUtils.clamp(pointer.tilt + deltaY * 0.001, -0.12, 0.12)
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
      if (!inView || !pageVisible) return

      elapsed += delta

      if (!pointer.dragging) {
        pointer.offset += pointer.velocity
        pointer.velocity *= 0.94
        pointer.tilt *= 0.96
      }

      const currentVariant = variantRef.current

      entries.forEach((entry, key) => {
        entry.target = key === currentVariant ? 1 : 0
        const smoothing = 1 - Math.pow(0.0015, delta)
        entry.fade += (entry.target - entry.fade) * smoothing
        if (Math.abs(entry.target - entry.fade) < 0.004) {
          entry.fade = entry.target
        }
        applyOpacity(entry.group, entry.fade)
        const scale = entry.baseScale * (0.97 + entry.fade * 0.03)
        entry.group.scale.setScalar(scale)
      })

      const cameraTarget = cameraTargets[currentVariant]
      const aspectCompensation = camera.aspect < 0.92 ? 1.16 : 1
      targetPosition.copy(cameraTarget.position).multiplyScalar(aspectCompensation)
      targetLook.copy(cameraTarget.look)
      camera.position.lerp(targetPosition, 1 - Math.pow(0.003, delta))
      cameraLook.lerp(targetLook, 1 - Math.pow(0.002, delta))
      camera.lookAt(cameraLook)

      const portrait = entries.get('portrait')
      if (portrait) {
        portrait.group.rotation.y =
          portrait.baseRotationY +
          pointer.offset +
          (reduceMotion ? 0 : Math.sin(elapsed * 0.34) * 0.2)
        portrait.group.rotation.x = pointer.tilt
        portrait.group.position.y = reduceMotion ? 0 : Math.sin(elapsed * 0.55) * 0.012
      }

      const vaseEntry = entries.get('vase')
      if (vaseEntry) {
        vaseEntry.group.rotation.y =
          vaseEntry.baseRotationY + pointer.offset + (reduceMotion ? 0 : elapsed * 0.16)
        vaseEntry.group.rotation.x = pointer.tilt
        vaseEntry.group.position.y = reduceMotion ? 0 : Math.sin(elapsed * 0.5) * 0.015
      }

      const printerEntry = entries.get('printer')
      if (printerEntry) {
        printerEntry.group.rotation.y = -0.44 + pointer.offset * 0.4
        printerEntry.group.rotation.x = pointer.tilt * 0.4
        if (printer) printer.update(elapsed, delta)
      }

      renderer.render(scene, camera)
    }

    clock.start()
    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      visibilityObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      scene.traverse((child) => {
        const object = child as THREE.Mesh
        if (!object.isMesh) return
        object.geometry.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => {
          const standard = material as THREE.MeshStandardMaterial
          if (standard.map) standard.map.dispose()
          material.dispose()
        })
      })
      dispose()
    }
  }, [])

  return (
    <div ref={wrapRef} className={`hero-scene ${ready ? 'is-ready' : ''}`}>
      <canvas ref={canvasRef} className="hero-scene__canvas" aria-hidden="true" />
      {!ready && !failed && (
        <div className="hero-scene__fallback" aria-hidden="true">
          <span className="hero-scene__orb" />
          <span className="hero-scene__loading">Sculpting the portrait…</span>
        </div>
      )}
      {failed && (
        <div className="hero-scene__fallback" aria-hidden="true">
          <span className="hero-scene__orb" />
        </div>
      )}
    </div>
  )
}
