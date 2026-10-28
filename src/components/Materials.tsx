import { useState } from 'react'
import { ArrowUpRight, Layers3 } from 'lucide-react'
import { finishes } from '../data/catalog'
import { useStore } from '../state/store'
import { FinishViewer } from './FinishViewer'
import { Reveal } from './Reveal'

export function Materials() {
  const [finishId, setFinishId] = useState('sage')
  const finish = finishes.find((item) => item.id === finishId) ?? finishes[0]
  const { openProjectModal } = useStore()
  const index = finishes.findIndex((item) => item.id === finish.id)
  const surface = finish.note.split(' · ')[1] ?? finish.note
  const surfaceLabel = surface.charAt(0).toUpperCase() + surface.slice(1)

  return (
    <section className="section materials" id="materials">
      <div className="container">
        <div className="section-intro materials__intro">
          <Reveal>
            <p className="section-label">Materials & finishes</p>
            <h2 className="section-title">
              One object.
              <br />
              <em className="serif">Six ways to feel it.</em>
            </h2>
          </Reveal>
          <Reveal className="section-intro__aside" delay={90}>
            <p className="section-copy">
              Colour is pigment, not paint. Finish is hand-work, not a coat. Choose a material and
              the object changes character — from chalk-soft mineral to mirror-polished chrome.
            </p>
          </Reveal>
        </div>

        <Reveal>
          <div className="materials__panel">
            <div className="materials__stage" style={{ backgroundColor: finish.swatch }}>
              <div className="materials__stage-glow" aria-hidden="true" />
              <FinishViewer finish={finish} />
              <div className="materials__stage-top">
                <span className="pill">
                  <span className="live-dot" aria-hidden="true" />
                  Live finish preview
                </span>
                <span className="materials__swatch-index">
                  {String(index + 1).padStart(2, '0')} / {String(finishes.length).padStart(2, '0')}
                </span>
              </div>
              <div className="materials__stage-caption">
                <span className="eyebrow">Finish study · Möbius vase</span>
                <strong>{finish.name}</strong>
                <span>{finish.note}</span>
              </div>
            </div>

            <div className="materials__copy">
              <div className="materials__copy-head">
                <span className="materials__copy-icon">
                  <Layers3 size={18} strokeWidth={1.5} />
                </span>
                <p>{finish.description}</p>
              </div>

              <div className="materials__swatches" role="group" aria-label="Choose a finish">
                {finishes.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`material-swatch ${option.id === finish.id ? 'is-active' : ''}`}
                    aria-pressed={option.id === finish.id}
                    onClick={() => setFinishId(option.id)}
                  >
                    <span
                      className="material-swatch__chip"
                      style={{ background: option.swatch }}
                    />
                    <span className="material-swatch__text">
                      <strong>{option.name}</strong>
                      <span>{option.note}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="materials__specs">
                <div>
                  <span>Surface</span>
                  <strong>{surfaceLabel}</strong>
                </div>
                <div>
                  <span>Roughness</span>
                  <strong>{finish.roughness.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Character</span>
                  <strong>{finish.metalness > 0.5 ? 'Reflective' : 'Soft-touch'}</strong>
                </div>
              </div>

              <div className="materials__actions">
                <button
                  type="button"
                  className="btn btn--dark"
                  onClick={() => openProjectModal('custom')}
                >
                  Request a finish sample
                  <ArrowUpRight size={15} strokeWidth={1.7} />
                </button>
                <span className="materials__note">
                  Material samples ship free within the US.
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
