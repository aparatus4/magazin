import { useState } from 'react'
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react'
import { shopCategories, utilityLinks } from '../data/catalog'
import { useStore } from '../state/store'
import { CategoryIcon } from './CategoryIcon'

interface MegaMenuProps {
  open: boolean
  onClose: () => void
}

export function MegaMenu({ open, onClose }: MegaMenuProps) {
  const { showCollection, openProjectModal } = useStore()
  const [activeId, setActiveId] = useState(shopCategories[0].id)
  const active = shopCategories.find((category) => category.id === activeId) ?? shopCategories[0]

  if (!open) return null

  const openCategory = (categoryId: string) => {
    showCollection({ category: categoryId })
    onClose()
  }

  const openFeature = () => {
    onClose()
    if (active.feature.href === '#portrait') {
      document.getElementById('portrait')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    showCollection({ category: active.id })
  }

  const handleUtility = (href: string, label: string) => {
    onClose()
    if (label === 'Trade & wholesale') {
      openProjectModal('custom')
      return
    }
    const target = document.querySelector(href)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mega" id="mega-menu">
      <div className="mega__panel">
        <div className="mega__body">
          <div className="mega__rail" role="group" aria-label="Shop categories">
            <p className="mega__rail-label">Everything we make</p>
            {shopCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`mega-rail__item ${category.id === active.id ? 'is-active' : ''}`}
                onMouseEnter={() => setActiveId(category.id)}
                onFocus={() => setActiveId(category.id)}
                onClick={() => openCategory(category.id)}
              >
                <span className="mega-rail__icon" style={{ background: category.tint }}>
                  <CategoryIcon name={category.icon} size={16} />
                </span>
                <span className="mega-rail__name">{category.name}</span>
                <ArrowRight size={14} strokeWidth={1.6} className="mega-rail__arrow" />
              </button>
            ))}
            <div className="mega__rail-note">
              <span className="live-dot" aria-hidden="true" />
              <span>10 disciplines · one studio</span>
            </div>
          </div>

          <div className="mega__detail" key={active.id}>
            <div className="mega-detail__head">
              <div className="mega-detail__title-row">
                <span className="mega-detail__badge" style={{ background: active.tint }}>
                  <CategoryIcon name={active.icon} size={21} />
                </span>
                <div>
                  <h2 className="mega-detail__title">{active.name}</h2>
                  <p className="mega-detail__count">{active.count}</p>
                </div>
              </div>
              <p className="mega-detail__description">{active.description}</p>
              <button
                type="button"
                className="link-arrow mega-detail__explore"
                onClick={() => openCategory(active.id)}
              >
                Explore {active.name}
                <ArrowUpRight size={15} strokeWidth={1.7} />
              </button>
            </div>

            <div className="mega-detail__subs">
              {active.subcategories.map((subcategory, index) => (
                <button
                  key={subcategory.name}
                  type="button"
                  className="mega-sub"
                  onClick={() => openCategory(active.id)}
                >
                  <span className="mega-sub__number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="mega-sub__text">
                    <span className="mega-sub__name">{subcategory.name}</span>
                    <span className="mega-sub__note">{subcategory.note}</span>
                  </span>
                  <ArrowUpRight size={14} strokeWidth={1.6} className="mega-sub__arrow" />
                </button>
              ))}
            </div>
          </div>

          <aside className="mega__feature" aria-label={`${active.name} featured piece`}>
            <div
              className="mega-feature__art"
              style={{ backgroundColor: active.tint }}
            >
              {active.feature.image && (
                <img src={active.feature.image} alt="" loading="lazy" draggable={false} />
              )}
              <span className="mega-feature__tag">{active.feature.eyebrow}</span>
            </div>
            <div className="mega-feature__copy">
              <h3>{active.feature.title}</h3>
              <p>{active.feature.blurb}</p>
              <button type="button" className="link-arrow" onClick={openFeature}>
                {active.feature.cta}
                <ArrowRight size={14} strokeWidth={1.7} />
              </button>
            </div>
          </aside>
        </div>

        <div className="mega__footer">
          <div className="mega__footer-cta">
            <span className="mega__footer-icon">
              <Sparkles size={15} strokeWidth={1.6} />
            </span>
            <p>
              Not seeing it? <span>If a printer can make it, our studio can.</span>
            </p>
            <button type="button" className="btn btn--dark btn--small" onClick={() => { onClose(); openProjectModal('custom') }}>
              Start a project
              <ArrowUpRight size={14} strokeWidth={1.7} />
            </button>
          </div>
          <div className="mega__utilities">
            {utilityLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                className="mega-utility"
                onClick={() => handleUtility(link.href, link.label)}
              >
                <span>{link.label}</span>
                <span className="mega-utility__note">{link.note}</span>
                <ArrowUpRight size={13} strokeWidth={1.7} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
