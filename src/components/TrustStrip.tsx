import { trustItems } from '../data/catalog'
import { CategoryIcon } from './CategoryIcon'
import { Reveal } from './Reveal'

export function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Why FORMA">
      <div className="container">
        <ul className="trust-strip__grid">
          {trustItems.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={index * 70}>
                <div className="trust-item">
                  <span className="trust-item__icon">
                    <CategoryIcon name={item.icon} size={17} strokeWidth={1.5} />
                  </span>
                  <span className="trust-item__text">
                    <strong>{item.title}</strong>
                    <span>{item.copy}</span>
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
