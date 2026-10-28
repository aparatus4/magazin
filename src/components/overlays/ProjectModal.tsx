import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Check, Paperclip, Sparkles, X } from 'lucide-react'
import { useBodyLock, useStore, type ProjectService } from '../../state/store'

const serviceCopy: Record<
  ProjectService,
  { label: string; titleLead: string; titleEm: string; line: string; image?: string }
> = {
  portrait: {
    label: 'The Portrait Studio',
    titleLead: 'A likeness,',
    titleEm: 'kept forever.',
    line: 'Three photographs. One artist. A portrait made only for you.',
    image: '/renders/portrait-bust.jpg',
  },
  custom: {
    label: 'Custom Print Bureau',
    titleLead: 'If you can imagine it,',
    titleEm: 'we can form it.',
    line: 'From a CAD file to a rough sketch — our engineers will find the way.',
    image: '/renders/echo-house.jpg',
  },
  other: {
    label: 'The studio',
    titleLead: 'Start with',
    titleEm: 'a sentence.',
    line: 'Tell us what you’re trying to make. We’ll take it from there.',
  },
}

export function ProjectModal() {
  const { projectModal, closeProjectModal, notify } = useStore()
  const [service, setService] = useState<ProjectService>(projectModal?.service ?? 'custom')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [details, setDetails] = useState('')
  const [timeline, setTimeline] = useState('No rush')
  const [file, setFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  useBodyLock(Boolean(projectModal))

  useEffect(() => {
    if (!projectModal) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeProjectModal()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [projectModal, closeProjectModal])

  if (!projectModal) return null

  const copy = serviceCopy[service]

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !email.trim() || !details.trim()) {
      setError('Please add your name, email, and a sentence about the project.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('That email looks incomplete. Please check it and try again.')
      return
    }
    setError('')
    setSubmitted(true)
    notify('Your brief is with the studio', 'We’ll reply within one business day.')
  }

  return (
    <div className="project-modal" role="dialog" aria-modal="true" aria-label="Start a project">
      <button
        type="button"
        className="overlay-scrim"
        aria-label="Close project request"
        onClick={closeProjectModal}
      />
      <div className="project-modal__panel">
        <button
          type="button"
          className="overlay-close project-modal__close"
          aria-label="Close project request"
          onClick={closeProjectModal}
        >
          <X size={18} strokeWidth={1.6} />
        </button>

        <aside className="project-modal__aside">
          <span className="eyebrow">{copy.label}</span>
          <h2>
            {copy.titleLead} <em className="serif">{copy.titleEm}</em>
          </h2>
          <p>{copy.line}</p>
          {copy.image && (
            <div className="project-modal__aside-image" aria-hidden="true">
              <img src={copy.image} alt="" />
            </div>
          )}
          <ol className="project-modal__steps">
            <li>
              <span>01</span> Tell us the idea
            </li>
            <li>
              <span>02</span> We reply within a day
            </li>
            <li>
              <span>03</span> Approve the plan, then we make
            </li>
          </ol>
          <p className="project-modal__aside-note">
            <Sparkles size={13} strokeWidth={1.6} />
            Every project includes a complimentary design review.
          </p>
        </aside>

        <div className="project-modal__body">
          {submitted ? (
            <div className="project-modal__success">
              <span className="project-modal__success-mark">
                <Check size={24} strokeWidth={2} />
              </span>
              <span className="eyebrow">Brief received</span>
              <h3>A quiet start to something good.</h3>
              <p>
                Thank you, {name.split(' ')[0]}. Your project is now with our studio. A real person
                will reply within one business day — usually sooner.
              </p>
              <div className="project-modal__summary">
                <div>
                  <span>Service</span>
                  <strong>{copy.label}</strong>
                </div>
                <div>
                  <span>Timeline</span>
                  <strong>{timeline}</strong>
                </div>
                {file && (
                  <div>
                    <span>File</span>
                    <strong>{file.name}</strong>
                  </div>
                )}
              </div>
              <button type="button" className="btn btn--dark btn--large" onClick={closeProjectModal}>
                Return to the studio
                <ArrowRight size={15} strokeWidth={1.7} />
              </button>
              <p className="project-modal__success-note">Studio hours · Tuesday to Saturday</p>
            </div>
          ) : (
            <>
              <div className="project-modal__head">
                <span className="eyebrow">Start a project</span>
                <h3>Tell us what you have in mind.</h3>
                <p>A few lines are enough. We’ll reply with questions, materials, and a plan.</p>
              </div>

              <form className="project-form" onSubmit={submit}>
                <div className="project-form__services" role="group" aria-label="Project type">
                  {(['portrait', 'custom', 'other'] as ProjectService[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={service === option ? 'is-active' : ''}
                      aria-pressed={service === option}
                      onClick={() => setService(option)}
                    >
                      {option === 'portrait' ? 'A portrait' : option === 'custom' ? 'Custom printing' : 'Something else'}
                    </button>
                  ))}
                </div>

                <div className="project-form__row">
                  <label className="project-field">
                    <span>Your name</span>
                    <input
                      type="text"
                      value={name}
                      placeholder="First and last"
                      autoComplete="name"
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>
                  <label className="project-field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={email}
                      placeholder="you@example.com"
                      autoComplete="email"
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>
                </div>

                <label className="project-field">
                  <span>What are you making?</span>
                  <textarea
                    value={details}
                    rows={4}
                    placeholder="A portrait for my father’s 70th, a replacement bracket for a 1974 boat, a small run of ceramic pendants…"
                    onChange={(event) => setDetails(event.target.value)}
                  />
                </label>

                <div className="project-form__row">
                  <label className="project-field">
                    <span>Timeline</span>
                    <select value={timeline} onChange={(event) => setTimeline(event.target.value)}>
                      <option>No rush</option>
                      <option>Within a month</option>
                      <option>Within two weeks</option>
                      <option>As soon as possible</option>
                    </select>
                  </label>
                  <div className="project-field project-field--file">
                    <span>Reference file <em>optional</em></span>
                    <input
                      ref={fileRef}
                      type="file"
                      className="visually-hidden"
                      onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    />
                    <button type="button" className="project-file" onClick={() => fileRef.current?.click()}>
                      <Paperclip size={14} strokeWidth={1.6} />
                      {file ? file.name : 'Attach a file'}
                    </button>
                  </div>
                </div>

                {error && <p className="project-form__error">{error}</p>}

                <div className="project-form__foot">
                  <p>
                    No obligation. No spam. Just a considered reply from the studio.
                  </p>
                  <button type="submit" className="btn btn--dark btn--large">
                    Send the brief
                    <ArrowRight size={15} strokeWidth={1.7} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
