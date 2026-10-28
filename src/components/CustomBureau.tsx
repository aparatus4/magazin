import { useRef, useState, type DragEvent } from 'react'
import { ArrowUpRight, Check, FileUp, ShieldCheck, UploadCloud, X } from 'lucide-react'
import { customServices } from '../data/catalog'
import { useStore } from '../state/store'
import { CategoryIcon } from './CategoryIcon'
import { PrinterViewer } from './PrinterViewer'
import { Reveal } from './Reveal'

const formats = ['STL', 'OBJ', 'STEP', '3MF']

export function CustomBureau() {
  const { openProjectModal, notify } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)

  const acceptFile = (nextFile: File | undefined) => {
    if (!nextFile) return
    setFile(nextFile)
    notify('File received by the studio', `${nextFile.name} · we’ll quote within one business day`)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    acceptFile(event.dataTransfer.files?.[0])
  }

  return (
    <section className="section custom" id="custom">
      <div className="container">
        <Reveal>
          <div className="custom-panel grain">
            <div className="custom-panel__copy">
              <p className="section-label section-label--plain custom-panel__label">
                Custom Print Bureau · {formats.join(' / ')}
              </p>
              <h2 className="custom-panel__title">
                Your file. Our machines.
                <br />
                <em className="serif">A finished object.</em>
              </h2>
              <p className="custom-panel__intro">
                From a single replacement part to a five-hundred-piece run. Send us what you have —
                a CAD file, a scan, a sketch, or a problem that needs solving — and our engineers
                will find the right material, the right process, and a beautiful finish.
              </p>

              <ul className="custom-panel__points">
                {[
                  'Quote within one business day',
                  '14 materials · 0.05–0.4 mm layers',
                  'Engineer review included on every order',
                ].map((point) => (
                  <li key={point}>
                    <span className="custom-panel__check">
                      <Check size={11} strokeWidth={2.2} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>

              <div
                className={`custom-upload ${dragging ? 'is-dragging' : ''} ${file ? 'is-filled' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="visually-hidden"
                  accept=".stl,.obj,.step,.stp,.3mf,.zip,.iges,.igs"
                  onChange={(event) => acceptFile(event.target.files?.[0])}
                />
                {file ? (
                  <>
                    <span className="custom-upload__icon">
                      <Check size={18} strokeWidth={2} />
                    </span>
                    <span className="custom-upload__text">
                      <strong>{file.name}</strong>
                      <span>Received · we’ll email a quote within a day</span>
                    </span>
                    <button
                      type="button"
                      className="custom-upload__remove"
                      aria-label="Remove uploaded file"
                      onClick={() => {
                        setFile(null)
                        if (inputRef.current) inputRef.current.value = ''
                      }}
                    >
                      <X size={15} strokeWidth={1.7} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="custom-upload__button"
                    onClick={() => inputRef.current?.click()}
                  >
                    <span className="custom-upload__icon">
                      <UploadCloud size={19} strokeWidth={1.6} />
                    </span>
                    <span className="custom-upload__text">
                      <strong>Drop a file, or browse</strong>
                      <span>STL, OBJ, STEP, 3MF · up to 200 MB</span>
                    </span>
                    <span className="custom-upload__arrow">
                      <ArrowUpRight size={16} strokeWidth={1.7} />
                    </span>
                  </button>
                )}
              </div>

              <div className="custom-panel__actions">
                <button
                  type="button"
                  className="btn btn--light btn--large"
                  onClick={() => openProjectModal('custom')}
                >
                  Start a custom project
                  <ArrowUpRight size={16} strokeWidth={1.7} />
                </button>
                <span className="custom-panel__secure">
                  <ShieldCheck size={14} strokeWidth={1.6} />
                  NDA available
                </span>
              </div>
            </div>

            <div className="custom-panel__stage">
              <div className="custom-stage">
                <div className="custom-stage__bar">
                  <span className="custom-stage__live">
                    <span className="live-dot" aria-hidden="true" />
                    Live build
                  </span>
                  <span className="custom-stage__spec">PLA · 0.12 mm · 62%</span>
                </div>
                <PrinterViewer />
                <div className="custom-stage__foot">
                  <div className="custom-stage__foot-item">
                    <span>Layer height</span>
                    <strong>0.12 mm</strong>
                  </div>
                  <div className="custom-stage__foot-item">
                    <span>Est. finish</span>
                    <strong>4h 20m</strong>
                  </div>
                  <div className="custom-stage__foot-item">
                    <span>Machine</span>
                    <strong>Forma 01</strong>
                  </div>
                </div>
                <span className="custom-stage__note">Object study · live from the studio floor</span>
              </div>
              <p className="custom-panel__stage-note">
                <FileUp size={14} strokeWidth={1.5} />
                Every file is inspected by an engineer before it reaches a machine.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="custom-services">
          <Reveal className="custom-services__head">
            <p className="section-label">More than a printer</p>
            <h3 className="custom-services__title">
              A full studio, <em className="serif">behind every object.</em>
            </h3>
          </Reveal>
          <div className="custom-services__grid">
            {customServices.map((service, index) => (
              <Reveal key={service.title} delay={(index % 3) * 60}>
                <div className="service-item">
                  <div className="service-item__top">
                    <span className="service-item__icon">
                      <CategoryIcon name={service.icon} size={18} strokeWidth={1.5} />
                    </span>
                    <span className="service-item__number">0{index + 1}</span>
                  </div>
                  <h4>{service.title}</h4>
                  <p>{service.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
