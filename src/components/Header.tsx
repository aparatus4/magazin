import { useEffect, useState } from 'react'
import { ChevronDown, Menu, Search, ShoppingBag } from 'lucide-react'
import { useStore } from '../state/store'
import { MegaMenu } from './MegaMenu'
import { MobileMenu } from './MobileMenu'

const navItems = [
  { label: 'Portrait Studio', href: '#portrait' },
  { label: 'Custom Printing', href: '#custom' },
  { label: 'Projects', href: '#projects' },
  { label: 'Reviews', href: '#reviews' },
]

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 2.8 29.2 10 16 17.2 2.8 10 16 2.8Z" fill="currentColor" />
      <path
        d="M2.8 15.2 16 22.4 29.2 15.2"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <path
        d="M2.8 20.7 16 27.9 29.2 20.7"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.34"
      />
    </svg>
  )
}

export function Header() {
  const { cartCount, setCartOpen, setSearchOpen } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!megaOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMegaOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [megaOpen])

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth > 1080) setMobileOpen(false)
      if (window.innerWidth <= 1080) setMegaOpen(false)
    }
    window.addEventListener('resize', closeOnResize)
    return () => window.removeEventListener('resize', closeOnResize)
  }, [])

  const goTo = (event: React.MouseEvent<HTMLAnchorElement>) => {
    setMegaOpen(false)
    setMobileOpen(false)
    const href = event.currentTarget.getAttribute('href')
    if (href === '#top') {
      event.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <div className="announcement grain">
        <div className="announcement__inner container--wide">
          <p>
            <span className="live-dot" aria-hidden="true" />
            Complimentary design review on every custom project
          </p>
          <span className="announcement__aside">
            Worldwide delivery <span aria-hidden="true">·</span> Now booking November
          </span>
        </div>
      </div>

      <header
        className={`site-header ${scrolled ? 'is-scrolled' : ''} ${megaOpen ? 'is-mega' : ''}`}
        id="top"
      >
        <div className="header__inner container--wide">
          <a className="brand" href="#top" onClick={goTo} aria-label="FORMA — home">
            <BrandMark />
            <span className="brand__word">forma</span>
          </a>

          <nav className="main-nav" aria-label="Main navigation">
            <button
              type="button"
              className={`nav-link nav-link--shop ${megaOpen ? 'is-active' : ''}`}
              aria-expanded={megaOpen}
              aria-controls="mega-menu"
              onClick={() => setMegaOpen((open) => !open)}
            >
              Shop
              <ChevronDown size={13} strokeWidth={1.8} className="nav-link__chevron" />
            </button>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="nav-link"
                onClick={() => setMegaOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header__actions">
            <button
              type="button"
              className="header-action header-action--search"
              aria-label="Search the store"
              onClick={() => {
                setMegaOpen(false)
                setSearchOpen(true)
              }}
            >
              <Search size={18} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              className="header-action header-action--bag"
              aria-label={`Shopping bag, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
              onClick={() => {
                setMegaOpen(false)
                setCartOpen(true)
              }}
            >
              <ShoppingBag size={18} strokeWidth={1.6} />
              <span className={`bag-count ${cartCount > 0 ? 'is-filled' : ''}`} aria-hidden="true">
                {cartCount}
              </span>
            </button>
            <button
              type="button"
              className="header-action header-action--menu"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} strokeWidth={1.6} />
            </button>
          </div>
        </div>

        <MegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} />
      </header>

      {megaOpen && (
        <button
          type="button"
          className="mega-scrim"
          aria-label="Close shop menu"
          tabIndex={-1}
          onClick={() => setMegaOpen(false)}
        />
      )}

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpenPortrait={() => setMobileOpen(false)}
      />
    </>
  )
}
