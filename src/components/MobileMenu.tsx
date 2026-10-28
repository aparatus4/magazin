import { useEffect } from 'react'
import { ArrowRight, ChevronDown, Search, ShoppingBag, X } from 'lucide-react'
import { shopCategories } from '../data/catalog'
import { useBodyLock, useStore } from '../state/store'
import { CategoryIcon } from './CategoryIcon'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  onOpenPortrait: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { showCollection, setSearchOpen, setCartOpen, openProjectModal, cartCount } = useStore()
  useBodyLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const go = (href: string) => {
    onClose()
    window.setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 30)
  }

  const openCategory = (categoryId: string) => {
    onClose()
    showCollection({ category: categoryId })
  }

  return (
    <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="mobile-menu__bar">
        <span className="brand brand--mobile">
          <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 2.8 29.2 10 16 17.2 2.8 10 16 2.8Z" fill="currentColor" />
            <path d="M2.8 15.2 16 22.4 29.2 15.2" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
            <path d="M2.8 20.7 16 27.9 29.2 20.7" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" opacity=".34" />
          </svg>
          <span className="brand__word">forma</span>
        </span>
        <div className="mobile-menu__bar-actions">
          <button
            type="button"
            className="header-action"
            aria-label="Search"
            onClick={() => {
              onClose()
              setSearchOpen(true)
            }}
          >
            <Search size={19} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            className="header-action"
            aria-label={`Bag, ${cartCount} items`}
            onClick={() => {
              onClose()
              setCartOpen(true)
            }}
          >
            <ShoppingBag size={19} strokeWidth={1.6} />
            <span className={`bag-count ${cartCount > 0 ? 'is-filled' : ''}`}>{cartCount}</span>
          </button>
          <button type="button" className="mobile-menu__close" onClick={onClose} aria-label="Close menu">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="mobile-menu__scroll">
        <div className="mobile-menu__intro">
          <p className="eyebrow">Shop by category</p>
          <p className="mobile-menu__intro-copy">Ten disciplines, printed under one roof.</p>
        </div>

        <div className="mobile-cats">
          {shopCategories.map((category) => (
            <details className="mobile-cat" key={category.id}>
              <summary>
                <span className="mobile-cat__icon" style={{ background: category.tint }}>
                  <CategoryIcon name={category.icon} size={17} />
                </span>
                <span className="mobile-cat__name">{category.name}</span>
                <span className="mobile-cat__count">{category.count}</span>
                <ChevronDown size={16} strokeWidth={1.7} className="mobile-cat__chevron" />
              </summary>
              <div className="mobile-cat__body">
                <ul>
                  {category.subcategories.map((subcategory) => (
                    <li key={subcategory.name}>
                      <button type="button" onClick={() => openCategory(category.id)}>
                        {subcategory.name}
                        <ArrowRight size={13} strokeWidth={1.6} />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="link-arrow mobile-cat__all"
                  onClick={() => openCategory(category.id)}
                >
                  Explore all {category.name}
                  <ArrowRight size={13} strokeWidth={1.7} />
                </button>
              </div>
            </details>
          ))}
        </div>

        <nav className="mobile-menu__nav" aria-label="More navigation">
          <button type="button" onClick={() => go('#portrait')}>
            Portrait Studio <ArrowRight size={16} strokeWidth={1.6} />
          </button>
          <button type="button" onClick={() => go('#custom')}>
            Custom Printing <ArrowRight size={16} strokeWidth={1.6} />
          </button>
          <button type="button" onClick={() => go('#projects')}>
            Projects <ArrowRight size={16} strokeWidth={1.6} />
          </button>
          <button type="button" onClick={() => go('#reviews')}>
            Reviews <ArrowRight size={16} strokeWidth={1.6} />
          </button>
        </nav>

        <div className="mobile-menu__cta">
          <p>Have something in mind?</p>
          <button
            type="button"
            className="btn btn--dark"
            onClick={() => {
              onClose()
              openProjectModal('custom')
            }}
          >
            Start a custom project
            <ArrowRight size={15} strokeWidth={1.7} />
          </button>
          <p className="mobile-menu__meta">Brooklyn, NY · Shipping worldwide</p>
        </div>
      </div>
    </div>
  )
}
