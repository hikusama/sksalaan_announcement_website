import { useEffect, useRef, useState, useCallback } from 'react'
import logo from './assets/logo.png'
import guide from './assets/guide.png'
import './App.css'
import { supabase } from "./supabaseClient";

const PAGE_SIZE = 5

function AnnouncementCard({ card, style }) {
  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—'

  const formatDateTime = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
  }

  return (
    <article className="ann-card" style={style} itemScope itemType="https://schema.org/NewsArticle">
      <div className="card-top">
        <img src={logo} alt="SK Youth Logo" className="card-logo" itemProp="image" />
        <div className="card-date">
          <div className="date-val" itemProp="datePublished">{formatDate(card.created_at)}</div>
          <div className="date-label">Posted</div>
        </div>
      </div>

      <h3 className="card-heading" itemProp="headline">{card.what}</h3>

      <div className="card-field">
        <div className="field-label">What</div>
        <div className="field-value" itemProp="description">{card.what}</div>
      </div>

      <div className="card-field">
        <div className="field-label">When</div>
        <div className="field-value" itemProp="dateModified">{formatDateTime(card.when)}</div>
      </div>

      <div className="card-field">
        <div className="field-label">Where</div>
        <div className="field-value" itemProp="locationCreated">{card.where}</div>
      </div>

      <hr className="card-divider" />

      <div className="card-field">
        <div className="field-label">Who</div>
        <div className="field-value" itemProp="author">{card.who}</div>
      </div>

      <hr className="card-divider" />

      <div className="card-field">
        <div className="field-label">Description</div>
        <div className="field-value" itemProp="articleBody">{card.description}</div>
      </div>
      
      <meta itemProp="publisher" content="SKYouth Salaan" />
      <meta itemProp="url" content={`https://sksalaan-announcement-website.vercel.app/announcements/${card.id}`} />
    </article>
  )
}

export default function App() {
  const spRef          = useRef(null)
  const trackRef       = useRef(null)   // the .annn scroll container
  const loadingRef     = useRef(false)
  const pageRef        = useRef(1)

  const [isLoad,     setLoad]     = useState(false)
  const [totalRows,  setTotal]    = useState(0)
  const [data,       setData]     = useState([])
  const [activeIdx,  setActive]   = useState(0)   // 0-based card index in view
  const [showModal,  setModal]    = useState(false)

  /* ── fetch ─────────────────────────────────── */
  const fetchAnnouncements = useCallback(async (page = 1) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoad(true)

    const from = (page - 1) * PAGE_SIZE
    const to   = from + PAGE_SIZE - 1

    try {
      const [{ count }, { data: rows, error }] = await Promise.all([
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).range(from, to),
      ])
      if (error) throw error

      setTotal(count ?? 0)
      setData(prev => page === 1 ? (rows ?? []) : [...prev, ...(rows ?? [])])
      pageRef.current = page
    } catch (err) {
      console.error('fetchAnnouncements:', err.message)
    } finally {
      loadingRef.current = false
      setLoad(false)
    }
  }, [])

  useEffect(() => { fetchAnnouncements(1) }, [fetchAnnouncements])

  /* ── track scroll position for dots / arrow state ── */
  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const onScroll = () => {
      const cardW = el.firstChild?.offsetWidth ?? 1
      const idx   = Math.round(el.scrollLeft / (cardW + 20)) // 20 = gap
      setActive(idx)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [data])

  /* ── carousel nav ─────────────────────────────── */
  const scrollTo = (idx) => {
    const el = trackRef.current
    if (!el) return
    const cardW = el.firstChild?.offsetWidth ?? 0
    el.scrollTo({ left: idx * (cardW + 20), behavior: 'smooth' })
    setActive(idx)
  }

  const totalCards = data.length + (data.length > 0 ? 1 : 0) // cards + load-more/all-done
  const atStart    = activeIdx === 0
  const atEnd      = activeIdx >= totalCards - 1

  return (
    <>
      <main>
        <div id="content">
          <div className="page-scroll">

            {/* ── HERO ─────────────────────────────── */}
            <section className="fp">
              <div className="hero-left">
                <div className="lgu">
                  <div className="logoG"><img src={logo} alt="SK Youth Logo" /></div>
                  <div className="lgu-text">
                    <div className="name">SKYouth Announcement</div>
                    <div className="loc">Salaan</div>
                  </div>
                </div>

                <div className="hero-tag">Official Announcements</div>

                <h1 className="hero-title">
                  Updates for the<br />
                  <span className="accent">Youth of Salaan</span>
                </h1>

                <p className="hero-desc">
                  Stay informed with events, opportunities, and important notices
                  from your SK Council — all in one place.
                </p>

                <button className="btn-primary" onClick={() => setModal(true)}>
                  <span>Register Now</span>
                  <span className="arrow-wrap">
                    <i className="fas fa-arrow-right" style={{ fontSize: '0.75rem' }}></i>
                  </span>
                </button>
              </div>

              {/* Right visual */}
              <div className="hero-right">
                <div className="hero-visual">
                  <div className="ring ring-3" />
                  <div className="ring ring-2" />
                  <div className="ring ring-1" />
                  <div className="hero-logo-wrap">
                    <img src={logo} alt="" />
                  </div>
                  <div className="hero-badge">📢 Latest Updates</div>
                </div>
              </div>

              <button
                className="scroll-cta"
                onClick={() => spRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span>See Announcements</span>
                <i className="fas fa-chevron-down"></i>
              </button>
            </section>

            {/* ── ANNOUNCEMENTS ─────────────────────── */}
            <section ref={spRef} className="sp">
              <div className="sp-header">
                <h2 className="sp-title">
                  📢 <span>Announcements</span>
                </h2>
                {totalRows > 0 && (
                  <span className="sp-count">{data.length} of {totalRows}</span>
                )}
              </div>

              <div className="carousel-wrapper">
                {/* Track */}
                <div className="carousel-track-wrap">
                  <div ref={trackRef} className="annn">
                    {isLoad && data.length === 0 ? (
                      <div className="state-card">
                        <div className="spinner" />
                        <span>Loading announcements…</span>
                      </div>
                    ) : data.length === 0 ? (
                      <div className="state-card">
                        <i className="fas fa-bell-slash" style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.15)' }}></i>
                        <span>No announcements yet. Check back soon!</span>
                      </div>
                    ) : (
                      <>
                        {data.map((card, i) => (
                          <AnnouncementCard
                            key={card.id}
                            card={card}
                            style={{ animationDelay: `${i * 0.05}s` }}
                          />
                        ))}

                        {/* Load more / all done */}
                        <div className="load-more-card">
                          {totalRows === data.length ? (
                            <div className="all-done">
                              <i className="fas fa-check-circle"></i>
                              <span>All caught up!</span>
                            </div>
                          ) : (
                            <button
                              className="btn-load-more"
                              onClick={() => fetchAnnouncements(pageRef.current + 1)}
                              disabled={isLoad}
                            >
                              {isLoad
                                ? <><div className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} /> Loading…</>
                                : <><i className="fas fa-plus"></i> Load more</>}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer: prev • dots • next */}
                {data.length > 0 && (
                  <div className="carousel-footer">
                    <button
                      className="nav-btn"
                      onClick={() => scrollTo(activeIdx - 1)}
                      disabled={atStart}
                      aria-label="Previous"
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>

                    <div className="dots">
                      {Array.from({ length: totalCards }).map((_, i) => (
                        <button
                          key={i}
                          className={`dot-item${activeIdx === i ? ' active' : ''}`}
                          style={{ width: activeIdx === i ? undefined : '6px' }}
                          onClick={() => scrollTo(i)}
                          aria-label={`Go to card ${i + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      className="nav-btn"
                      onClick={() => scrollTo(activeIdx + 1)}
                      disabled={atEnd}
                      aria-label="Next"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                  </div>
                )}
              </div>
            </section>

          </div>{/* page-scroll */}
        </div>
      </main>

      {/* ── GUIDE MODAL ──────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(false)} aria-label="Close">
              <i className="fas fa-times"></i>
            </button>
            <img src={guide} alt="Registration Guide" />
          </div>
        </div>
      )}
    </>
  )
}