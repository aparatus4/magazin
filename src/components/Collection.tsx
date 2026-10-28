import { useMemo, useState } from 'react'
import { ArrowUpRight, ChevronDown, SlidersHorizontal, Sparkles } from 'lucide-react'
import { products, shopCategories } from '../data/catalog'
import { useStore, type CollectionTab } from '../state/store'
import { ProductCard } from './ProductCard'
import { Reveal } from './Reveal'

const tabs: { id: CollectionTab; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'ready', label: 'Ready to ship' },
  { id: 'order', label: 'Made to order' },
  { id: 'custom', label: 'Made for you' },
]

type Sort = 'studio' | 'price-asc' | 'price-desc'

export function Collection() {
  const {
    collectionTab,
    collectionCategory,
    setCollectionTab,
    setCollectionCategory,
    openProjectModal,
  } = useStore()
  const [sort, setSort] = useState<Sort>('studio')

  const visible = useMemo(() => {
    const filtered = products.filter((product) => {
      const tabMatch = collectionTab === 'all' || product.type === collectionTab
      const categoryMatch = collectionCategory === 'all' || product.category === collectionCategory
      return tabMatch && categoryMatch
    })
    if (sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price)
    return filtered
  }, [collectionTab, collectionCategory, sort])

  const activeCategory = shopCategories.find((category) => category.id === collectionCategory)
  const countFor = (tab: CollectionTab) =>
    tab === 'all' ? products.length : products.filter((product) => product.type === tab).length

  return (
    <section className="section collection" id="collection">
      <div className="container">
        <div className="section-intro collection__intro">
          <Reveal>
            <p className="section-label">The Collection</p>
            <h2 className="section-title">
              Already made.
              <br />
              Or made <em className="serif">entirely yours.</em>
            </h2>
          </Reveal>
          <Reveal className="section-intro__aside" delay={90}>
            <p className="section-copy">
              A small, rotating edit of objects from our studio — some ready to leave the shelf
              today, some printed to order. Every one is finished by hand.
            </p>
            <span className="collection__intro-note">
              <span className="live-dot" aria-hidden="true" />
              New objects added every month
            </span>
          </Reveal>
        </div>

        <Reveal className="collection__toolbar">
          <div className="collection__tabs" role="tablist" aria-label="Product availability">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={collectionTab === tab.id}
                className={`collection-tab ${collectionTab === tab.id ? 'is-active' : ''}`}
                onClick={() => setCollectionTab(tab.id)}
              >
                {tab.label}
                <span>{String(countFor(tab.id)).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
          <label className="collection__sort">
            <SlidersHorizontal size={14} strokeWidth={1.6} />
            <span className="visually-hidden">Sort objects</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
              <option value="studio">Studio order</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
            </select>
            <ChevronDown size={13} strokeWidth={1.7} aria-hidden="true" />
          </label>
        </Reveal>

        <div className="collection__chips" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={`collection-chip ${collectionCategory === 'all' ? 'is-active' : ''}`}
            onClick={() => setCollectionCategory('all')}
          >
            All objects
          </button>
          {shopCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`collection-chip ${collectionCategory === category.id ? 'is-active' : ''}`}
              onClick={() => setCollectionCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="collection__count-row">
          <span>
            {activeCategory ? (
              <>
                <strong>{visible.length}</strong> {visible.length === 1 ? 'object' : 'objects'} in{' '}
                {activeCategory.name}
              </>
            ) : (
              <>
                <strong>{visible.length}</strong> of {products.length} objects
              </>
            )}
          </span>
          {collectionCategory !== 'all' && (
            <button type="button" className="collection__clear" onClick={() => setCollectionCategory('all')}>
              Clear filter
            </button>
          )}
        </div>

        {visible.length > 0 ? (
          <div className="product-grid">
            {visible.map((product, index) => (
              <Reveal key={product.id} delay={(index % 4) * 55}>
                <ProductCard product={product} />
              </Reveal>
            ))}
            <Reveal className="collection-cta-wrap" delay={(visible.length % 4) * 55}>
              <button
                type="button"
                className="collection-cta"
                onClick={() => openProjectModal('custom')}
              >
                <span className="collection-cta__icon">
                  <Sparkles size={18} strokeWidth={1.5} />
                </span>
                <span className="eyebrow">The custom bureau</span>
                <span className="collection-cta__title">
                  Your idea,
                  <br />
                  <em className="serif">next.</em>
                </span>
                <span className="collection-cta__copy">
                  A file, a sketch, or a half-formed thought. We’ll quote it within a day.
                </span>
                <span className="collection-cta__link">
                  Start a project
                  <ArrowUpRight size={15} strokeWidth={1.7} />
                </span>
              </button>
            </Reveal>
          </div>
        ) : (
          <div className="collection__empty">
            <span className="collection__empty-mark">
              <Sparkles size={20} strokeWidth={1.4} />
            </span>
            <h3>Nothing on the shelf — yet.</h3>
            <p>
              This corner of the collection is made to order. Tell us what you have in mind and
              we’ll make it just for you.
            </p>
            <div className="collection__empty-actions">
              <button type="button" className="btn btn--dark" onClick={() => openProjectModal('custom')}>
                Start a custom project
                <ArrowUpRight size={15} strokeWidth={1.7} />
              </button>
              <button
                type="button"
                className="btn btn--light"
                onClick={() => {
                  setCollectionTab('all')
                  setCollectionCategory('all')
                }}
              >
                See everything
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
