import type { CSSProperties } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { shopCategories } from '../data/catalog'
import { useStore } from '../state/store'
import { CategoryIcon } from './CategoryIcon'
import { Reveal } from './Reveal'

const featured = new Set(['personalised', 'prototypes'])

export function CategoryGrid() {
  const { showCollection } = useStore()

  return (
    <section className="section categories" id="categories">
      <div className="container">
        <div className="section-intro">
          <Reveal>
            <p className="section-label">The full studio</p>
            <h2 className="section-title">
              Everything a printer
              <br />
              can do, <em className="serif">considered.</em>
            </h2>
          </Reveal>
          <Reveal className="section-intro__aside" delay={100}>
            <p className="section-copy">
              Ten disciplines, one atelier. From a portrait for the mantel to a bracket that keeps a
              machine running — if it can be printed, it can be made beautifully here.
            </p>
            <button
              type="button"
              className="link-arrow categories__all"
              onClick={() => showCollection({ tab: 'all', category: 'all' })}
            >
              Browse every object
              <ArrowUpRight size={15} strokeWidth={1.7} />
            </button>
          </Reveal>
        </div>

        <div className="category-grid">
          {shopCategories.map((category, index) => {
            const isFeatured = featured.has(category.id)
            return (
              <Reveal
                key={category.id}
                delay={(index % 4) * 60}
                className={`category-cell ${isFeatured ? 'category-cell--featured' : ''}`}
              >
                <button
                  type="button"
                  className="category-card"
                  style={{ '--category-tint': category.tint } as CSSProperties}
                  onClick={() => showCollection({ category: category.id, tab: 'all' })}
                >
                  {isFeatured && category.feature.image && (
                    <span className="category-card__image" aria-hidden="true">
                      <img src={category.feature.image} alt="" loading="lazy" draggable={false} />
                    </span>
                  )}
                  <span className="category-card__top">
                    <span className="category-card__icon">
                      <CategoryIcon name={category.icon} size={isFeatured ? 24 : 19} />
                    </span>
                    <span className="category-card__count">{category.count}</span>
                  </span>
                  <span className="category-card__body">
                    <span className="category-card__name">{category.name}</span>
                    <span className="category-card__tagline">{category.tagline}</span>
                    <span className="category-card__subs">
                      {category.subcategories.slice(0, 3).map((subcategory) => (
                        <span key={subcategory.name}>{subcategory.name}</span>
                      ))}
                      <span className="category-card__more">
                        +{category.subcategories.length - 3} more
                      </span>
                    </span>
                  </span>
                  <span className="category-card__foot">
                    <span className="category-card__cta">
                      Explore <ArrowRight size={13} strokeWidth={1.7} />
                    </span>
                    <span className="category-card__arrow">
                      <ArrowUpRight size={16} strokeWidth={1.6} />
                    </span>
                  </span>
                </button>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
