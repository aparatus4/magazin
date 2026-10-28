import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, CalendarDays, MapPin, X } from 'lucide-react'
import { projects, type Project } from '../data/catalog'
import { useBodyLock, useStore } from '../state/store'
import { Reveal } from './Reveal'

const filters: { id: 'all' | Project['filter']; label: string }[] = [
  { id: 'all', label: 'All projects' },
  { id: 'personal', label: 'Personal' },
  { id: 'home', label: 'Home' },
  { id: 'industry', label: 'Industry' },
  { id: 'jewellery', label: 'Jewellery' },
]

const spans: Record<string, string> = {
  maya: 'span 5',
  wren: 'span 7',
  noon: 'span 4',
  aster: 'span 4',
  kite: 'span 4',
  pulse: 'span 4',
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <button type="button" className={`project-card project-card--${project.size}`} onClick={onOpen}>
      <span className="project-card__media">
        <img src={project.image} alt={project.title} loading="lazy" draggable={false} />
        <span className="project-card__tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </span>
        <span className="project-card__open">
          View project
          <ArrowUpRight size={14} strokeWidth={1.7} />
        </span>
      </span>
      <span className="project-card__info">
        <span className="project-card__head">
          <span className="project-card__title">{project.title}</span>
          <span className="project-card__year">{project.year}</span>
        </span>
        <span className="project-card__meta">
          {project.client} <span aria-hidden="true">·</span> {project.location}
        </span>
        <span className="project-card__blurb">{project.blurb}</span>
      </span>
    </button>
  )
}

function ProjectLightbox({ project, onClose }: { project: Project; onClose: () => void }) {
  const { openProjectModal } = useStore()
  useBodyLock(true)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="project-lightbox" role="dialog" aria-modal="true" aria-label={project.title}>
      <button type="button" className="overlay-scrim" aria-label="Close project" onClick={onClose} />
      <div className="project-lightbox__panel">
        <button type="button" className="project-lightbox__close" aria-label="Close project" onClick={onClose}>
          <X size={18} strokeWidth={1.7} />
        </button>
        <div className="project-lightbox__image">
          <img src={project.image} alt={project.title} />
        </div>
        <div className="project-lightbox__body">
          <div className="project-lightbox__tags">
            {project.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <h2>{project.title}</h2>
          <div className="project-lightbox__meta">
            <span>
              <MapPin size={13} strokeWidth={1.6} />
              {project.location}
            </span>
            <span>
              <CalendarDays size={13} strokeWidth={1.6} />
              {project.year}
            </span>
          </div>
          <p className="project-lightbox__story">{project.story}</p>
          <dl className="project-lightbox__facts">
            <div>
              <dt>Client</dt>
              <dd>{project.client}</dd>
            </div>
            <div>
              <dt>Materials</dt>
              <dd>{project.materials}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{project.duration}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="btn btn--dark btn--large"
            onClick={() => {
              onClose()
              openProjectModal('custom')
            }}
          >
            Start a project like this
            <ArrowRight size={15} strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Projects() {
  const [filter, setFilter] = useState<'all' | Project['filter']>('all')
  const [active, setActive] = useState<Project | null>(null)
  const { openProjectModal } = useStore()

  const visible = projects.filter((project) => filter === 'all' || project.filter === filter)

  return (
    <section className="section projects" id="projects">
      <div className="container">
        <div className="section-intro">
          <Reveal>
            <p className="section-label">Selected projects</p>
            <h2 className="section-title">
              Things we’ve made
              <br />
              for <em className="serif">real people.</em>
            </h2>
          </Reveal>
          <Reveal className="section-intro__aside" delay={90}>
            <p className="section-copy">
              A portrait for a birthday. A model for a studio. A part for a machine that could not
              be replaced. Each project starts with a conversation and ends with something made to
              last.
            </p>
            <button
              type="button"
              className="link-arrow projects__cta-link"
              onClick={() => openProjectModal('custom')}
            >
              Add your project
              <ArrowUpRight size={15} strokeWidth={1.7} />
            </button>
          </Reveal>
        </div>

        <Reveal className="projects__filters" delay={40}>
          <div className="projects__filter-row" role="group" aria-label="Filter projects">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`project-filter ${filter === item.id ? 'is-active' : ''}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <span className="projects__count">
            {String(visible.length).padStart(2, '0')} projects
          </span>
        </Reveal>

        <div className="project-grid">
          {visible.map((project, index) => (
            <Reveal
              key={project.id}
              delay={(index % 3) * 60}
              className="project-cell"
              style={{ gridColumn: spans[project.id] ?? 'span 4' }}
            >
              <ProjectCard project={project} onOpen={() => setActive(project)} />
            </Reveal>
          ))}
          <Reveal delay={180} className="project-cell project-cell--cta" style={{ gridColumn: 'span 8' }}>
            <button
              type="button"
              className="projects-cta"
              onClick={() => openProjectModal('custom')}
            >
              <span className="eyebrow">Your project, next</span>
              <span className="projects-cta__title">
                Bring us the thing
                <br />
                <em className="serif">you can’t buy.</em>
              </span>
              <span className="projects-cta__foot">
                Start a conversation
                <span className="projects-cta__arrow">
                  <ArrowUpRight size={18} strokeWidth={1.6} />
                </span>
              </span>
            </button>
          </Reveal>
        </div>
      </div>

      {active && <ProjectLightbox project={active} onClose={() => setActive(null)} />}
    </section>
  )
}
