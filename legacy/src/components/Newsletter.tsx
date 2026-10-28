import { useState, type FormEvent } from 'react'
import { ArrowRight, Mail } from 'lucide-react'
import { useStore } from '../state/store'
import { Reveal } from './Reveal'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const { notify } = useStore()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!valid) {
      notify('That email looks incomplete', 'Check the address and try again.')
      return
    }
    setDone(true)
    notify('You’re on the list', 'A quiet letter, once a month. No noise.')
    setEmail('')
  }

  return (
    <section className="section newsletter" aria-label="Newsletter">
      <div className="container">
        <Reveal>
          <div className="newsletter__panel grain">
            <div className="newsletter__orb newsletter__orb--one" aria-hidden="true" />
            <div className="newsletter__orb newsletter__orb--two" aria-hidden="true" />
            <div className="newsletter__copy">
              <span className="newsletter__icon">
                <Mail size={17} strokeWidth={1.5} />
              </span>
              <p className="section-label section-label--plain">The FORMA letter</p>
              <h2 className="newsletter__title">
                New objects,
                <br />
                <em className="serif">quietly announced.</em>
              </h2>
              <p className="newsletter__blurb">
                Occasional notes from the studio: new editions, works in progress, and the things
                we’re learning along the way. Once a month, never more.
              </p>
            </div>

            <div className="newsletter__form-wrap">
              {done ? (
                <div className="newsletter__done">
                  <span className="newsletter__done-mark">✓</span>
                  <div>
                    <strong>You’re on the list.</strong>
                    <p>Look out for the next letter — it usually arrives on a Thursday.</p>
                  </div>
                </div>
              ) : (
                <form className="newsletter__form" onSubmit={submit}>
                  <label className="newsletter__field">
                    <span className="visually-hidden">Email address</span>
                    <input
                      type="email"
                      value={email}
                      placeholder="Your email address"
                      autoComplete="email"
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </label>
                  <button type="submit" className="newsletter__submit" aria-label="Subscribe">
                    <ArrowRight size={18} strokeWidth={1.7} />
                  </button>
                </form>
              )}
              <p className="newsletter__fine">
                Once a month. No noise. Unsubscribe whenever you like.
              </p>
              <div className="newsletter__meta">
                <span>9,400+ objects made</span>
                <span aria-hidden="true">·</span>
                <span>Brooklyn, NY</span>
                <span aria-hidden="true">·</span>
                <span>Since 2019</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
