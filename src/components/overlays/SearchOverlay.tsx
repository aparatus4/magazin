import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { products, shopCategories } from '../../data/catalog'
import { useBodyLock, useStore } from '../../state/store'

const trends = ['Portrait bust', 'Möbius vase', 'Aster ring', 'Tabletop', 'Replacement part']

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, openQuickView, showCollection, openProjectModal } = useStore()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useBodyLock(searchOpen)

  useEffect(() => {
    if (!searchOpen) return
    setQuery('')
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
    }
  }, [searchOpen, setSearchOpen])

  const term = query.trim().toLowerCase()

  const productResults = useMemo(() => {
    if (!term) return []
    return products
      .filter((product) =>
        [product.name, product.categoryLabel, product.blurb, product.description, ...product.materials]
          .join(' ')
          .toLowerCase()
          .includes(term),
      )
      .slice(0, 6)
  }, [term])

  const categoryResults = useMemo(() => {
    if (!term) return []
    return shopCategories.filter((category) =>
      [category.name, category.tagline, category.description, ...category.subcategories.map((item) => item.name)]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [term])

  if (!searchOpen) return null

  return (
    <div className="search-layer" role="dialog" aria-modal="true" aria-label="Search FORMA">
      <button
        type="button"
        className="overlay-scrim search-layer__scrim"
        aria-label="Close search"
        onClick={() => setSearchOpen(false)}
      />
      <div className="search-panel">
        <div className="search-panel__bar">
          <Search size={20} strokeWidth={1.5} className="search-panel__icon" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            placeholder="Search objects, materials, projects…"
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search objects, materials, projects"
          />
          <button
            type="button"
            className="search-panel__close"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          >
            <span>Esc</span>
            <X size={15} strokeWidth={1.7} />
          </button>
        </div>

        {!term ? (
          <div className="search-default">
            <div className="search-group">
              <p className="eyebrow">Popular searches</p>
              <div className="search-trends">
                {trends.map((trend) => (
                  <button key={trend} type="button" onClick={() => setQuery(trend)}>
                    {trend}
                    <ArrowUpRight size={12} strokeWidth={1.6} />
                  </button>
                ))}
              </div>
            </div>
            <div className="search-featured">
              <p className="eyebrow">Signature object</p>
              <button
                type="button"
                className="search-feature-card"
                onClick={() => openQuickView(products[0])}
              >
                <span className="search-feature-card__media" style={{ backgroundColor: products[0].tone }}>
                  <img src={products[0].image} alt="" />
                </span>
                <span className="search-feature-card__text">
                  <span className="eyebrow">From your photograph</span>
                  <strong>The Portrait</strong>
                  <span>A museum-grade bust, sculpted in your likeness. From $189.</span>
                </span>
                <ArrowUpRight size={17} strokeWidth={1.6} />
              </button>
            </div>
            <div className="search-categories">
              <p className="eyebrow">Browse by discipline</p>
              <div>
                {shopCategories.slice(0, 6).map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      showCollection({ category: category.id, tab: 'all' })
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="search-results">
            <div className="search-results__head">
              <span>
                {productResults.length + categoryResults.length} results for “{query}”
              </span>
              <button
                type="button"
                className="search-results__clear"
                onClick={() => setQuery('')}
              >
                Clear
              </button>
            </div>

            {categoryResults.length > 0 && (
              <div className="search-results__categories">
                {categoryResults.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      showCollection({ category: category.id, tab: 'all' })
                    }}
                  >
                    {category.name}
                    <span>{category.count}</span>
                  </button>
                ))}
              </div>
            )}

            {productResults.length > 0 ? (
              <ul className="search-products">
                {productResults.map((product) => (
                  <li key={product.id}>
                    <button type="button" onClick={() => openQuickView(product)}>
                      <span className="search-products__media" style={{ backgroundColor: product.tone }}>
                        <img src={product.image} alt="" />
                      </span>
                      <span className="search-products__text">
                        <span>{product.categoryLabel}</span>
                        <strong>{product.name}</strong>
                      </span>
                      <span className="search-products__price">
                        {product.pricePrefix && `${product.pricePrefix} `}${product.price}
                      </span>
                      <ArrowUpRight size={15} strokeWidth={1.6} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="search-empty">
                <h3>No objects by that name — yet.</h3>
                <p>We make things that aren’t in the catalogue all the time. Tell us what you’re looking for.</p>
                <button
                  type="button"
                  className="btn btn--dark"
                  onClick={() => {
                    setSearchOpen(false)
                    openProjectModal('custom')
                  }}
                >
                  Start a custom search
                  <ArrowUpRight size={15} strokeWidth={1.7} />
                </button>
              </div>
            )}

            <div className="search-results__foot">
              <span>Can’t find it? If a printer can make it, we can.</span>
              <button
                type="button"
                className="link-arrow"
                onClick={() => {
                  setSearchOpen(false)
                  openProjectModal('custom')
                }}
              >
                Ask the studio
                <ArrowUpRight size={13} strokeWidth={1.7} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
