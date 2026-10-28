import { useEffect, useState } from 'react'
import { ArrowRight, Minus, Plus, Ruler, ShieldCheck, Star, Truck, X } from 'lucide-react'
import { useBodyLock, useStore } from '../../state/store'

const swatches: Record<string, string> = {
  Porcelain: '#f1ede4',
  Sandstone: '#cdbba4',
  Obsidian: '#2c2b29',
  Sage: '#9da98f',
  Terracotta: '#b46246',
  Chrome: '#c9d0d2',
  Ivory: '#f0e8da',
  Graphite: '#3a3b37',
  'Bone white': '#ece7dc',
  'Stone grey': '#a8a8a2',
  'Carbon nylon': '#2b2d2b',
  'Glass-filled nylon': '#3b3d3b',
  'Recycled silver': '#ccd1d2',
  'Gold vermeil': '#d8b775',
  'Brass accent': '#b2955d',
  Pearl: '#f2ede3',
  Gold: '#c7a45f',
  'Plaster white': '#efece5',
  'Translucent ivory': '#f4ecdf',
}

export function QuickView() {
  const { quickView, closeQuickView, addToCart, openProjectModal } = useStore()
  const [finish, setFinish] = useState('')
  const [size, setSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  useBodyLock(Boolean(quickView))

  useEffect(() => {
    if (!quickView) return
    setFinish(quickView.materials[0] ?? 'Studio finish')
    setSize(quickView.sizes?.[0] ?? '')
    setQuantity(1)
  }, [quickView])

  useEffect(() => {
    if (!quickView) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeQuickView()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [quickView, closeQuickView])

  if (!quickView) return null
  const product = quickView
  const isCustom = product.type === 'custom'

  return (
    <div className="quick-view" role="dialog" aria-modal="true" aria-label={product.name}>
      <button type="button" className="overlay-scrim" aria-label="Close quick view" onClick={closeQuickView} />
      <div className="quick-view__panel">
        <button
          type="button"
          className="overlay-close quick-view__close"
          aria-label="Close quick view"
          onClick={closeQuickView}
        >
          <X size={18} strokeWidth={1.6} />
        </button>

        <div className="quick-view__media" style={{ backgroundColor: product.tone }}>
          <span className="quick-view__media-tag">
            {product.type === 'ready' ? 'Ready to ship' : product.type === 'order' ? 'Made to order' : 'Made for you'}
          </span>
          {product.badge && <span className="quick-view__media-badge">{product.badge}</span>}
          <img src={product.image} alt={product.name} />
          <span className="quick-view__media-note">Hand-finished in Brooklyn</span>
        </div>

        <div className="quick-view__body">
          <div className="quick-view__meta">
            <span>{product.categoryLabel}</span>
            <span className="quick-view__rating">
              <Star size={11} fill="currentColor" strokeWidth={1} />
              {product.rating.toFixed(1)} · {product.reviewCount} reviews
            </span>
          </div>
          <h2>{product.name}</h2>
          <p className="quick-view__blurb">{product.blurb}</p>
          <div className="quick-view__price">
            <span>
              {product.pricePrefix && <em>{product.pricePrefix} </em>}${product.price}
            </span>
            <span className="quick-view__lead">{product.lead}</span>
          </div>

          <p className="quick-view__description">{product.description}</p>

          <div className="quick-view__option">
            <div className="quick-view__option-head">
              <span>Finish</span>
              <strong>{finish}</strong>
            </div>
            <div className="quick-view__finishes">
              {product.materials.map((material) => (
                <button
                  key={material}
                  type="button"
                  className={`quick-finish ${material === finish ? 'is-active' : ''}`}
                  aria-pressed={material === finish}
                  onClick={() => setFinish(material)}
                >
                  <span style={{ backgroundColor: swatches[material] ?? '#d9d3c7' }} />
                  {material}
                </button>
              ))}
            </div>
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="quick-view__option">
              <div className="quick-view__option-head">
                <span>Size</span>
                <strong>{size}</strong>
              </div>
              <div className="quick-view__sizes">
                {product.sizes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`quick-size ${option === size ? 'is-active' : ''}`}
                    aria-pressed={option === size}
                    onClick={() => setSize(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="quick-view__buy">
            {isCustom ? (
              <button
                type="button"
                className="btn btn--dark btn--large quick-view__add"
                onClick={() => {
                  closeQuickView()
                  openProjectModal('portrait')
                }}
              >
                Begin your portrait
                <ArrowRight size={16} strokeWidth={1.7} />
              </button>
            ) : (
              <>
                <div className="qty-stepper qty-stepper--large">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  >
                    <Minus size={13} strokeWidth={1.8} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((current) => current + 1)}
                  >
                    <Plus size={13} strokeWidth={1.8} />
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn--dark btn--large quick-view__add"
                  onClick={() => {
                    addToCart(product, { finish, size: size || undefined, quantity })
                    closeQuickView()
                  }}
                >
                  Add to bag
                  <span className="quick-view__add-price">${product.price * quantity}</span>
                </button>
              </>
            )}
          </div>

          <div className="quick-view__details">
            <div>
              <Ruler size={14} strokeWidth={1.5} />
              <span>{product.dimensions}</span>
            </div>
            <div>
              <Truck size={14} strokeWidth={1.5} />
              <span>Complimentary tracked delivery over $150</span>
            </div>
            <div>
              <ShieldCheck size={14} strokeWidth={1.5} />
              <span>30-day returns · Every piece numbered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
