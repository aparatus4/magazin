import { useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Quote, Star } from 'lucide-react'
import { products, reviews } from '../data/catalog'
import { useStore } from '../state/store'
import { Reveal } from './Reveal'

export function Reviews() {
  const [index, setIndex] = useState(0)
  const active = reviews[index]
  const { openQuickView } = useStore()
  const product = active.productId ? products.find((item) => item.id === active.productId) : null

  const go = (direction: number) => {
    setIndex((current) => (current + direction + reviews.length) % reviews.length)
  }

  return (
    <section className="section reviews" id="reviews">
      <div className="container">
        <Reveal>
          <div className="reviews__panel grain">
            <div className="reviews__summary">
              <p className="section-label section-label--plain reviews__label">Client reviews</p>
              <div className="reviews__score-row">
                <span className="reviews__score">4.9</span>
                <div className="reviews__score-aside">
                  <span className="star-row" aria-label="4.9 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <Star key={star} size={15} />
                    ))}
                  </span>
                  <span>2,480 verified reviews</span>
                </div>
              </div>
              <p className="reviews__summary-copy">
                Every object leaves the studio with a handwritten note. Most of the people who
                receive one write back.
              </p>
              <div className="reviews__summary-stats">
                <div>
                  <strong>98%</strong>
                  <span>would order again</span>
                </div>
                <div>
                  <strong>94%</strong>
                  <span>gift a FORMA object</span>
                </div>
              </div>
              <div className="reviews__sources">
                <span>Google · 4.9</span>
                <span>Trustpilot · 4.8</span>
                <span>Studio · 5.0</span>
              </div>
            </div>

            <div className="reviews__carousel">
              <div className="reviews__carousel-top">
                <span className="reviews__quote-mark">
                  <Quote size={26} strokeWidth={1.2} />
                </span>
                <span className="reviews__index">
                  {String(index + 1).padStart(2, '0')} / {String(reviews.length).padStart(2, '0')}
                </span>
              </div>

              <div className="reviews__quote-wrap" key={active.id}>
                <blockquote className="reviews__quote">{active.quote}</blockquote>
                <div className="reviews__author">
                  <span className="reviews__avatar" style={{ backgroundColor: active.tone }}>
                    {active.initials}
                  </span>
                  <span className="reviews__author-text">
                    <strong>{active.name}</strong>
                    <span>
                      {active.location} <span aria-hidden="true">·</span> {active.date}
                    </span>
                  </span>
                  <span className="reviews__author-rating">
                    <span className="star-row" aria-hidden="true">
                      {[0, 1, 2, 3, 4].map((star) => (
                        <Star key={star} size={11} />
                      ))}
                    </span>
                    <span>Verified</span>
                  </span>
                </div>
              </div>

              <div className="reviews__carousel-foot">
                {product ? (
                  <button
                    type="button"
                    className="reviews__product"
                    onClick={() => openQuickView(product)}
                  >
                    <img src={product.image} alt="" />
                    <span>
                      <span className="eyebrow">Reviewed object</span>
                      <strong>{active.project}</strong>
                    </span>
                    <ArrowUpRight size={14} strokeWidth={1.7} />
                  </button>
                ) : (
                  <span className="reviews__product reviews__product--plain">
                    <span className="eyebrow">Project</span>
                    <strong>{active.project}</strong>
                  </span>
                )}

                <div className="reviews__arrows">
                  <button
                    type="button"
                    className="icon-button reviews__arrow"
                    aria-label="Previous review"
                    onClick={() => go(-1)}
                  >
                    <ArrowLeft size={16} strokeWidth={1.6} />
                  </button>
                  <button
                    type="button"
                    className="icon-button reviews__arrow"
                    aria-label="Next review"
                    onClick={() => go(1)}
                  >
                    <ArrowRight size={16} strokeWidth={1.6} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="reviews__rail" delay={120}>
          {reviews.map((review, reviewIndex) => (
            <button
              key={review.id}
              type="button"
              className={`review-chip ${reviewIndex === index ? 'is-active' : ''}`}
              aria-label={`Read review from ${review.name}`}
              onClick={() => setIndex(reviewIndex)}
            >
              <span className="review-chip__avatar" style={{ backgroundColor: review.tone }}>
                {review.initials}
              </span>
              <span className="review-chip__text">
                <strong>{review.name}</strong>
                <span>{review.location}</span>
              </span>
              <span className="star-row" aria-hidden="true">
                <Star size={9} />
              </span>
            </button>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
