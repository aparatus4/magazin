import { useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, ScanLine, Sparkles } from 'lucide-react'
import { finishes, portraitSteps } from '../data/catalog'
import { useStore } from '../state/store'
import { PortraitViewer } from './PortraitViewer'
import { Reveal } from './Reveal'

const portraitFinishes = finishes.filter((finish) =>
  ['porcelain', 'sandstone', 'obsidian'].includes(finish.id),
)

export function PortraitStudio() {
  const [finishId, setFinishId] = useState('porcelain')
  const { openProjectModal } = useStore()
  const finish = portraitFinishes.find((item) => item.id === finishId) ?? portraitFinishes[0]

  return (
    <section className="section portrait" id="portrait">
      <div className="container">
        <div className="portrait__top">
          <Reveal className="portrait__copy">
            <p className="section-label">The Portrait Studio</p>
            <h2 className="section-title portrait__title">
              A likeness,
              <br />
              <em className="serif">sculpted</em> from a photograph.
            </h2>
            <p className="section-copy portrait__intro">
              Three photographs are all we need. An artist models your portrait by hand in digital
              clay, sends you a 360° preview, then prints it in fine layers and finishes every
              surface in our Brooklyn atelier.
            </p>
            <ul className="portrait__points">
              {['One round of refinements included', 'Numbered, certified, and dated', 'Felt-lined plinth and travel case'].map(
                (point) => (
                  <li key={point}>
                    <span className="portrait__point-icon">
                      <Check size={12} strokeWidth={2} />
                    </span>
                    {point}
                  </li>
                ),
              )}
            </ul>
            <div className="portrait__actions">
              <button
                type="button"
                className="btn btn--dark btn--large"
                onClick={() => openProjectModal('portrait')}
              >
                Begin your portrait
                <ArrowUpRight size={16} strokeWidth={1.7} className="btn__arrow" />
              </button>
              <a className="btn btn--light btn--large" href="#portrait-process">
                How it works
                <ArrowRight size={15} strokeWidth={1.7} />
              </a>
            </div>
            <p className="portrait__price">
              From <strong>$189</strong> <span aria-hidden="true">·</span> 14–18 studio days{' '}
              <span aria-hidden="true">·</span> Worldwide delivery
            </p>
          </Reveal>

          <Reveal className="portrait__stage-wrap" delay={120}>
            <div className="portrait__stage">
              <div className="portrait__stage-bg" aria-hidden="true" />
              <PortraitViewer finish={finish} />
              <div className="portrait__stage-chip portrait__stage-chip--top glass">
                <ScanLine size={14} strokeWidth={1.6} />
                <span>Photo → digital clay → print</span>
              </div>
              <div className="portrait__stage-chip portrait__stage-chip--bottom glass">
                <span className="portrait__stage-dot" aria-hidden="true" />
                <span>0.06 mm layers · hand-finished</span>
              </div>
              <div className="portrait__stage-tag">
                <span className="eyebrow">The Portrait</span>
                <strong>
                  24 <span>cm</span>
                </strong>
                <span className="text-small">Porcelain, satin finish</span>
              </div>
            </div>

            <div className="finish-picker" role="group" aria-label="Choose a portrait finish">
              <span className="finish-picker__label">
                <Sparkles size={13} strokeWidth={1.6} />
                Finish
              </span>
              <div className="finish-picker__options">
                {portraitFinishes.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`finish-pick ${option.id === finish.id ? 'is-active' : ''}`}
                    aria-pressed={option.id === finish.id}
                    onClick={() => setFinishId(option.id)}
                  >
                    <span className="finish-pick__swatch" style={{ background: option.swatch }} />
                    {option.name}
                  </button>
                ))}
              </div>
              <span className="finish-picker__note">{finish.note}</span>
            </div>
          </Reveal>
        </div>

        <div className="portrait__process" id="portrait-process">
          <Reveal className="portrait__process-head">
            <p className="section-label section-label--plain">From photograph to heirloom</p>
            <h3 className="portrait__process-title">
              Four quiet steps,
              <br />
              <em className="serif">made around you.</em>
            </h3>
            <p className="portrait__process-note">
              Every portrait is made by one artist, one printer, and one pair of hands — from the
              first photograph to the final inspection.
            </p>
          </Reveal>

          <ol className="portrait__steps">
            {portraitSteps.map((step, index) => (
              <li key={step.number}>
                <Reveal delay={index * 80}>
                  <div className="portrait-step">
                    <span className="portrait-step__number">{step.number}</span>
                    <span className="portrait-step__line" aria-hidden="true" />
                    <h4>{step.title}</h4>
                    <p>{step.copy}</p>
                    <span className="portrait-step__note">{step.note}</span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
