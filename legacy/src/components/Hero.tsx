import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Sparkles,
  Star,
} from 'lucide-react'
import { useStore } from '../state/store'
import { CategoryIcon } from './CategoryIcon'
import { HeroScene, type HeroVariant } from './HeroScene'

interface HeroSlide {
  id: string
  eyebrow: string
  title: React.ReactNode
  copy: string
  primary: string
  secondary: string
  variant: HeroVariant
  meta: string
  chip: string
  product: {
    tag: string
    title: string
    detail: string
    price: string
    swatches: string[]
    icon: 'portrait' | 'home' | 'prototypes'
  }
}

const slides: HeroSlide[] = [
  {
    id: 'portrait',
    eyebrow: 'The Portrait Studio · From your photograph',
    title: (
      <>
        A portrait
        <br />
        you can <em className="serif">hold.</em>
      </>
    ),
    copy:
      'Send us a photograph. Our artists sculpt a museum-grade bust in your likeness, then print and hand-finish it in our Brooklyn atelier.',
    primary: 'Create your portrait',
    secondary: 'See how it works',
    variant: 'portrait',
    meta: 'From $189 · Yours in 14–18 studio days',
    chip: 'Photo → sculpture',
    product: {
      tag: 'Signature piece',
      title: 'The Portrait',
      detail: 'Porcelain · hand-finished',
      price: 'From $189',
      swatches: ['#f2eee6', '#cbb69d', '#282826'],
      icon: 'portrait',
    },
  },
  {
    id: 'objects',
    eyebrow: 'The Collection · Designed and made in-house',
    title: (
      <>
        Beautiful things,
        <br />
        <em className="serif">already made.</em>
      </>
    ),
    copy:
      'A small, considered collection of objects designed in our studio and printed to order — or ready to leave the shelf today.',
    primary: 'Shop ready to ship',
    secondary: 'Explore all objects',
    variant: 'vase',
    meta: 'Made in small editions · Ships worldwide',
    chip: 'Ready to ship',
    product: {
      tag: 'Bestseller',
      title: 'Möbius Vase',
      detail: 'Recycled ceramic · satin sage',
      price: '$86',
      swatches: ['#dfe7d8', '#f1ede4', '#2c2b29'],
      icon: 'home',
    },
  },
  {
    id: 'custom',
    eyebrow: 'Custom Print Bureau · Open for projects',
    title: (
      <>
        If you can imagine it,
        <br />
        we can <em className="serif">form it.</em>
      </>
    ),
    copy:
      'From a single replacement part to a five-hundred-piece run, our studio turns files, sketches, and half-formed ideas into precise, beautiful objects.',
    primary: 'Start a custom project',
    secondary: 'Upload your file',
    variant: 'printer',
    meta: '14 materials · 0.05 mm–0.4 mm layers',
    chip: 'Live print · 0.12 mm',
    product: {
      tag: 'Print bureau',
      title: 'Your file, finished',
      detail: 'FDM · resin · nylon · metal',
      price: 'Quotes in 1 day',
      swatches: ['#e6dfd0', '#9b9a92', '#2c2d2a'],
      icon: 'prototypes',
    },
  },
]

const SLIDE_DURATION = 9000

export function Hero() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [inspecting, setInspecting] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)
  const { openProjectModal, showCollection } = useStore()
  const reducing = useRef(false)

  const activeSlide = slides[index]
  const autoPaused = paused || inspecting
  const canAutoplay = !reducing.current && !autoPaused

  useEffect(() => {
    reducing.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (!canAutoplay) return
    let last = performance.now()
    const interval = window.setInterval(() => {
      const now = performance.now()
      progressRef.current += (now - last) / SLIDE_DURATION
      last = now
      if (progressRef.current >= 1) {
        progressRef.current = 0
        setProgress(0)
        setIndex((current) => (current + 1) % slides.length)
      } else {
        setProgress(progressRef.current)
      }
    }, 180)
    return () => window.clearInterval(interval)
  }, [canAutoplay, index])

  const goToSlide = (nextIndex: number) => {
    progressRef.current = 0
    setProgress(0)
    setIndex((nextIndex + slides.length) % slides.length)
  }

  const goToSection = (selector: string) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handlePrimary = () => {
    if (activeSlide.id === 'portrait') {
      openProjectModal('portrait')
      return
    }
    if (activeSlide.id === 'objects') {
      showCollection({ tab: 'ready', category: 'all' })
      return
    }
    openProjectModal('custom')
  }

  const handleSecondary = () => {
    if (activeSlide.id === 'portrait') {
      goToSection('#portrait')
      return
    }
    if (activeSlide.id === 'objects') {
      showCollection({ tab: 'all', category: 'all' })
      return
    }
    goToSection('#custom')
  }

  return (
    <section
      className={`hero grain hero--${activeSlide.id}`}
      aria-label="FORMA studio highlights"
      aria-roledescription="carousel"
    >
      <div className="hero__backgrounds" aria-hidden="true">
        <div className="hero__bg hero__bg--portrait" />
        <div className="hero__bg hero__bg--objects" />
        <div className="hero__bg hero__bg--custom" />
      </div>
      <div className="hero__aurora" aria-hidden="true">
        <span className="hero__aurora-core" />
        <span className="hero__aurora-ring hero__aurora-ring--one" />
        <span className="hero__aurora-ring hero__aurora-ring--two" />
      </div>

      <div className="hero__inner container--wide">
        <div className="hero__content" key={activeSlide.id}>
          <p className="hero__eyebrow">
            <span className="hero__eyebrow-pill glass">
              <span className="live-dot" aria-hidden="true" />
              {activeSlide.eyebrow}
            </span>
          </p>
          <h1 className="hero__title">{activeSlide.title}</h1>
          <p className="hero__copy">{activeSlide.copy}</p>
          <div className="hero__actions">
            <button type="button" className="btn btn--dark btn--large" onClick={handlePrimary}>
              {activeSlide.primary}
              <ArrowUpRight size={16} strokeWidth={1.7} className="btn__arrow" />
            </button>
            <button type="button" className="btn btn--light btn--large" onClick={handleSecondary}>
              {activeSlide.secondary}
            </button>
          </div>
          <div className="hero__meta-row">
            <span className="hero__meta">{activeSlide.meta}</span>
            <span className="hero__meta-sep" aria-hidden="true" />
            <span className="hero__rating">
              <span className="star-row" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star key={star} size={11} />
                ))}
              </span>
              4.9 from 2,480 reviews
            </span>
          </div>
        </div>

        <div
          className="hero__visual"
          onPointerEnter={() => setInspecting(true)}
          onPointerLeave={() => setInspecting(false)}
        >
          <div className="hero__visual-glow" aria-hidden="true" />
          <HeroScene variant={activeSlide.variant} />

          <div className="hero__chip hero__chip--top glass">
            <Sparkles size={13} strokeWidth={1.6} />
            <span>{activeSlide.chip}</span>
          </div>
          <div className="hero__hint">
            <span className="hero__hint-ring" aria-hidden="true" />
            Drag to explore
          </div>

          <div className="hero__product glass" key={`${activeSlide.id}-card`}>
            <span className="hero__product-index">
              {String(index + 1).padStart(2, '0')}
              <span>/</span>
              {String(slides.length).padStart(2, '0')}
            </span>
            <div className="hero__product-main">
              <span className="hero__product-icon">
                <CategoryIcon name={activeSlide.product.icon} size={17} />
              </span>
              <div>
                <p className="hero__product-tag">{activeSlide.product.tag}</p>
                <h2>{activeSlide.product.title}</h2>
                <p className="hero__product-detail">{activeSlide.product.detail}</p>
              </div>
            </div>
            <div className="hero__product-foot">
              <div className="hero__swatches" aria-label="Available finishes">
                {activeSlide.product.swatches.map((color) => (
                  <span key={color} style={{ backgroundColor: color }} />
                ))}
              </div>
              <strong>{activeSlide.product.price}</strong>
            </div>
            <button
              type="button"
              className="hero__product-link"
              aria-label={`Open ${activeSlide.product.title}`}
              onClick={handlePrimary}
            >
              <ArrowUpRight size={16} strokeWidth={1.7} />
            </button>
          </div>

          <span className="hero__side-note" aria-hidden="true">
            Object study · FORMA 2026
          </span>
        </div>
      </div>

      <div className="hero__footer container--wide">
        <div className="hero__footer-note">
          <span className="hero__footer-badge">Hand-finished in Brooklyn</span>
          <span className="hero__footer-divider" aria-hidden="true" />
          <span>Numbered, certified, and made to last.</span>
        </div>
        <div className="hero__controls">
          <div className="hero__arrows">
            <button
              type="button"
              className="icon-button hero__arrow"
              aria-label="Previous slide"
              onClick={() => goToSlide(index - 1)}
            >
              <ChevronLeft size={17} strokeWidth={1.7} />
            </button>
            <button
              type="button"
              className="icon-button hero__arrow"
              aria-label="Next slide"
              onClick={() => goToSlide(index + 1)}
            >
              <ChevronRight size={17} strokeWidth={1.7} />
            </button>
          </div>
          <div className="hero__dots" role="tablist" aria-label="Hero slides">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                className={`hero__dot ${slideIndex === index ? 'is-active' : ''}`}
                aria-label={`Go to slide ${slideIndex + 1}: ${slide.eyebrow}`}
                aria-selected={slideIndex === index}
                role="tab"
                onClick={() => goToSlide(slideIndex)}
              >
                <span className="hero__dot-index">0{slideIndex + 1}</span>
                <span className="hero__dot-track">
                  <span
                    className="hero__dot-fill"
                    style={{
                      width:
                        slideIndex === index
                          ? `${Math.min(100, progress * 100)}%`
                          : slideIndex < index
                            ? '100%'
                            : '0%',
                    }}
                  />
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="icon-button hero__pause"
            aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
            aria-pressed={paused}
            onClick={() => setPaused((current) => !current)}
          >
            {paused ? (
              <Play size={14} strokeWidth={1.8} fill="currentColor" />
            ) : (
              <Pause size={14} strokeWidth={1.8} />
            )}
          </button>
          <span className="hero__counter">
            <strong>0{index + 1}</strong>
            <span>/ 03</span>
          </span>
        </div>
      </div>
      <button
        type="button"
        className="hero__scroll-cue"
        aria-label="Scroll to the Portrait Studio"
        onClick={() => goToSection('#portrait')}
      >
        <span>Scroll</span>
        <ArrowRight size={14} strokeWidth={1.6} />
      </button>
    </section>
  )
}
