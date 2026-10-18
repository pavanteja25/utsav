'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import images from './images.json';
import './celebration-showcase.css';

export default function CelebrationShowcase({ items, parent }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [mobile, setMobile] = useState(false);
  const reduced = useReducedMotion();
  const track = useRef(null);
  const panels = useRef([]);
  const buttons = useRef([]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)');
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (paused || hovered || focused || reduced || mobile) return;
    const timer = setInterval(() => {
      if (!document.hidden) setActive(i => (i + 1) % items.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [paused, hovered, focused, reduced, mobile, items.length]);

  function select(i, keyboard = false) {
    const destination = (i + items.length) % items.length;
    setActive(destination);
    setPaused(true);
    if (mobile && track.current && panels.current[destination]) {
      const panel = panels.current[destination];
      track.current.scrollTo({
        left: panel.offsetLeft - (track.current.clientWidth - panel.clientWidth) / 2,
        behavior: reduced ? 'instant' : 'smooth',
      });
    }
    if (keyboard) buttons.current[destination]?.focus({ preventScroll: true });
  }

  function handleKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey || !e.target.classList.contains('showcase-select')) return;
    const destinations = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: items.length - 1 };
    if (!(e.key in destinations)) return;
    e.preventDefault();
    select(destinations[e.key], true);
  }

  function handleScroll() {
    if (!mobile || !track.current) return;
    const center = track.current.scrollLeft + track.current.clientWidth / 2;
    let nearest = 0, distance = Infinity;
    panels.current.forEach((panel, i) => {
      if (!panel) return;
      const delta = Math.abs(panel.offsetLeft + panel.clientWidth / 2 - center);
      if (delta < distance) { nearest = i; distance = delta; }
    });
    setActive(nearest);
  }

  return <section className="celebration-showcase" aria-label="Choose your celebration" aria-roledescription="carousel"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onKeyDown={handleKey}
    onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
    <div className="showcase-track" ref={track} onScroll={handleScroll}>
      {items.map(([slug, title], i) => {
        const selected = i === active;
        return <motion.article key={slug} ref={el => { panels.current[i] = el; }}
          className={'showcase-panel' + (selected ? ' is-selected' : '')}
          initial={false} animate={{ flexGrow: selected ? (items.length > 3 ? 4.8 : 2.6) : 1 }}
          transition={{ duration: reduced ? 0 : .8, ease: [.22, 1, .36, 1] }}
          onPointerEnter={e => { if (e.pointerType === 'mouse' && !focused && !mobile) setActive(i); }}>
          <motion.img src={images[slug]?.[0]?.src} alt={title + ' celebration inspiration'}
            loading={i === 0 ? 'eager' : 'lazy'} draggable="false" initial={false}
            animate={{ scale: selected ? 1 : 1.1 }} transition={{ duration: reduced ? 0 : 1.3, ease: [.22, 1, .36, 1] }} />
          <button className="showcase-select" ref={el => { buttons.current[i] = el; }} aria-label={'Show ' + title}
            aria-pressed={selected} onClick={() => select(i)} onFocus={() => setActive(i)}>
            <span className="showcase-number">{String(i + 1).padStart(2, '0')}</span>
            <span className="showcase-spine" aria-hidden="true">{title}</span>
          </button>
          <div className="showcase-caption" aria-hidden={!selected} inert={!selected}>
            <Link href={'/services/' + parent + '/' + slug} tabIndex={selected ? 0 : -1}>
              <h2>{title}</h2><span className="showcase-visit"><ArrowUpRight size={24} aria-hidden="true" /></span>
            </Link>
          </div>
        </motion.article>;
      })}
    </div>
    <div className="showcase-toolbar">
      <div className="showcase-position" aria-live={paused || mobile ? 'polite' : 'off'} aria-atomic="true">
        <span>{String(active + 1).padStart(2, '0')}</span><span className="showcase-position-line" aria-hidden="true" /><span>{String(items.length).padStart(2, '0')}</span>
      </div>
      <div className="showcase-controls">
        {!reduced && !mobile && <button className="showcase-play" aria-label={paused ? 'Play automatic transitions' : 'Pause automatic transitions'} aria-pressed={paused}
          onClick={() => setPaused(p => !p)}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>}
        <button aria-label="Previous celebration" onClick={() => select(active - 1)}><ChevronLeft size={20} /></button>
        <button aria-label="Next celebration" onClick={() => select(active + 1)}><ChevronRight size={20} /></button>
      </div>
    </div>
  </section>;
}
