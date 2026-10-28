import { ArrowUp, ArrowUpRight, Instagram, Mail, MapPin } from 'lucide-react'
import { shopCategories } from '../data/catalog'
import { useStore } from '../state/store'

const studioLinks = [
  { label: 'Portrait Studio', href: '#portrait' },
  { label: 'Custom Printing', href: '#custom' },
  { label: 'Projects', href: '#projects' },
  { label: 'Materials & finishes', href: '#materials' },
  { label: 'Client reviews', href: '#reviews' },
]

export function Footer() {
  const { showCollection, openProjectModal } = useStore()

  return (
    <footer className="site-footer grain">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <a className="footer__logo" href="#top" aria-label="FORMA — back to top">
              <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M16 2.8 29.2 10 16 17.2 2.8 10 16 2.8Z" fill="currentColor" />
                <path d="M2.8 15.2 16 22.4 29.2 15.2" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" opacity=".7" />
                <path d="M2.8 20.7 16 27.9 29.2 20.7" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" opacity=".34" />
              </svg>
              <span className="brand__word">forma</span>
            </a>
            <p className="footer__blurb">
              A 3D printing atelier for objects with a point of view. Designed, printed, and
              finished by hand in Brooklyn.
            </p>
            <a className="footer__email" href="mailto:studio@forma.example">
              <Mail size={14} strokeWidth={1.5} />
              studio@forma.example
            </a>
            <a className="footer__address" href="#top">
              <MapPin size={14} strokeWidth={1.5} />
              64 Wythe Avenue, Brooklyn, NY
            </a>
            <div className="footer__socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="FORMA on Instagram">
                <Instagram size={16} strokeWidth={1.6} />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer">
                Pinterest
              </a>
              <a href="https://are.na" target="_blank" rel="noreferrer">
                Are.na
              </a>
            </div>
          </div>

          <nav className="footer__col" aria-label="Shop">
            <p className="footer__col-title">Shop</p>
            <button type="button" onClick={() => showCollection({ tab: 'all', category: 'all' })}>
              All objects
            </button>
            {shopCategories.slice(0, 6).map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => showCollection({ category: category.id, tab: 'all' })}
              >
                {category.name}
              </button>
            ))}
            <button type="button" onClick={() => showCollection({ tab: 'all', category: 'all' })}>
              The full catalogue
              <ArrowUpRight size={12} strokeWidth={1.7} />
            </button>
          </nav>

          <nav className="footer__col" aria-label="Studio">
            <p className="footer__col-title">Studio</p>
            {studioLinks.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
            <button type="button" onClick={() => openProjectModal('custom')}>
              Start a project
              <ArrowUpRight size={12} strokeWidth={1.7} />
            </button>
          </nav>

          <nav className="footer__col" aria-label="Support">
            <p className="footer__col-title">Support</p>
            <a href="mailto:studio@forma.example">Contact the studio</a>
            <a href="#reviews">Shipping & returns</a>
            <a href="#materials">Care guide</a>
            <a href="#portrait-process">The portrait process</a>
            <a href="#custom">Trade & wholesale</a>
            <a href="#top">FAQs</a>
          </nav>

          <div className="footer__col footer__col--visit">
            <p className="footer__col-title">Visit</p>
            <p className="footer__visit-copy">
              The atelier is open by appointment, Tuesday to Saturday, 10–5.
            </p>
            <a className="footer__visit-link" href="mailto:studio@forma.example?subject=Studio%20visit">
              Book a visit
              <ArrowUpRight size={12} strokeWidth={1.7} />
            </a>
            <div className="footer__hours">
              <span>Tue–Sat</span>
              <span>10:00–17:00</span>
            </div>
            <div className="footer__status">
              <span className="live-dot" aria-hidden="true" />
              Now booking November projects
            </div>
          </div>
        </div>

        <div className="footer__wordmark" aria-hidden="true">
          forma
        </div>

        <div className="footer__bottom">
          <span>© 2026 FORMA Studio. All objects, made personal.</span>
          <div className="footer__legal">
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
            <a href="#top">Accessibility</a>
            <button type="button" className="footer__top-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Back to top
              <ArrowUp size={13} strokeWidth={1.7} />
            </button>
          </div>
        </div>

        <p className="footer__credit">
          Portrait sculpture based on the “Infinite” 3D head scan by Lee Perry-Smith, licensed under{' '}
          <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">
            CC BY 3.0
          </a>
          . Model via three.js examples. All other objects and imagery are original studio work.
        </p>
      </div>
    </footer>
  )
}
