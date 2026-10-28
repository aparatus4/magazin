import { Plus, Star } from 'lucide-react'
import type { Product } from '../data/catalog'
import { useStore } from '../state/store'

const typeLabels: Record<Product['type'], string> = {
  ready: 'Ready to ship',
  order: 'Made to order',
  custom: 'Made for you',
}

export function ProductCard({ product }: { product: Product }) {
  const { openQuickView, addToCart, openProjectModal } = useStore()
  const isCustom = product.type === 'custom'

  const quickAdd = () => {
    if (isCustom) {
      openProjectModal('portrait')
      return
    }
    addToCart(product)
  }

  return (
    <article className="product-card">
      <div className="product-card__media" style={{ backgroundColor: product.tone }}>
        <img src={product.image} alt={product.name} loading="lazy" draggable={false} />
        <button
          type="button"
          className="product-card__open"
          aria-label={`Quick view ${product.name}`}
          onClick={() => openQuickView(product)}
        />
        <div className="product-card__topline">
          <span className={`product-card__type product-card__type--${product.type}`}>
            {typeLabels[product.type]}
          </span>
          {product.badge && <span className="product-card__badge">{product.badge}</span>}
        </div>
        <div className="product-card__actions">
          <button
            type="button"
            className="product-card__action product-card__action--wide"
            onClick={() => openQuickView(product)}
          >
            Quick view
          </button>
          <button
            type="button"
            className="product-card__action product-card__action--icon"
            aria-label={isCustom ? `Begin ${product.name}` : `Add ${product.name} to bag`}
            onClick={quickAdd}
          >
            {isCustom ? <span className="product-card__custom-mark">+</span> : <Plus size={16} strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      <div className="product-card__info">
        <div className="product-card__meta">
          <span>{product.categoryLabel}</span>
          <span className="product-card__rating">
            <Star size={10} fill="currentColor" strokeWidth={1} />
            {product.rating.toFixed(1)}
          </span>
        </div>
        <h3>
          <button type="button" onClick={() => openQuickView(product)}>
            {product.name}
          </button>
        </h3>
        <p className="product-card__blurb">{product.blurb}</p>
        <div className="product-card__foot">
          <span className="product-card__availability">{product.availability}</span>
          <span className="product-card__price">
            {product.pricePrefix && <em>{product.pricePrefix} </em>}${product.price}
          </span>
        </div>
      </div>
    </article>
  )
}
