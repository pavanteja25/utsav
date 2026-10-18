'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import images from './images.json';

const ease = [.22, 1, .36, 1];

export default function SubcategoryCarousel({ items, parent }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [direction, setDirection] = useState(1);
  const reduced = useReducedMotion();
  const gesture = useRef(null);
  const swiped = useRef(false);
  const tabs = useRef([]);
  const engaged = hovered || focused;
  const index = active % items.length;
  const [slug, title] = items[index];
  const previous = (index - 1 + items.length) % items.length;
  const next = (index + 1) % items.length;

  function select(i, travel = 1) {
    setDirection(travel);
    setActive(i);
    setPaused(true);
  }

  useEffect(() => {
    if (paused || engaged || reduced) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setDirection(1);
      setActive(i => (i + 1) % items.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [paused, engaged, reduced, items.length]);

  function keyboard(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    let destination;
    if (e.key === 'ArrowRight') destination = next;
    else if (e.key === 'ArrowLeft') destination = previous;
    else if (e.key === 'Home') destination = 0;
    else if (e.key === 'End') destination = items.length - 1;
    else return;
    e.preventDefault();
    select(destination, e.key === 'ArrowLeft' ? -1 : 1);
    if (e.target.getAttribute('role') === 'tab') tabs.current[destination]?.focus();
  }

  return <section className="subcategory-carousel" aria-label="Celebration collections" aria-roledescription="carousel"
    onKeyDown={keyboard} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
    <motion.div className="subcategory-stage" initial={reduced ? false : { opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: reduced ? 0 : .8, ease }}
      onPointerDown={e => { swiped.current = false; gesture.current = { x: e.clientX, y: e.clientY }; }}
      onPointerCancel={() => { gesture.current = null; }}
      onPointerLeave={() => { gesture.current = null; }}
      onPointerUp={e => {
        if (!gesture.current) return;
        const dx = e.clientX - gesture.current.x, dy = e.clientY - gesture.current.y;
        gesture.current = null;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
          swiped.current = true;
          select(dx < 0 ? next : previous, dx < 0 ? 1 : -1);
        }
      }}
      onClickCapture={e => { if (swiped.current) { e.preventDefault(); e.stopPropagation(); swiped.current = false; } }}>
      <div className="subcategory-halo" aria-hidden="true" />
      {items.map(([key, label], i) => {
        let slot = (i - index + items.length) % items.length;
        if (slot > items.length / 2) slot -= items.length;
        const selected = slot === 0;
        const visible = Math.abs(slot) <= 1;
        return <motion.div key={key} className={'subcategory-card' + (selected ? ' is-active' : '')}
          initial={false} aria-hidden={!visible} inert={!visible ? true : undefined}
          role={selected ? 'tabpanel' : undefined} id={selected ? 'collection-panel-' + parent : undefined}
          aria-labelledby={selected ? 'collection-tab-' + key : undefined}
          style={{ zIndex: selected ? 3 : visible ? 2 : 0, pointerEvents: visible ? 'auto' : 'none' }}
          animate={{ x: `${slot * 87}%`, y: selected ? 0 : 28, scale: selected ? 1 : .7,
            rotate: selected ? 0 : slot * 6, rotateY: selected ? 0 : slot * -12, opacity: visible ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : .85, ease }}>
          {selected ? <Link href={'/services/' + parent + '/' + key} className="subcategory-feature-link" aria-label={'Explore ' + label}>
            <img src={images[key]?.[0]?.src} alt={label + ' celebration inspiration'} loading="eager" draggable="false" />
            <span className="subcategory-image-shade" />
            <span className="subcategory-card-note">Discover the details</span>
            <span className="subcategory-open"><ArrowUpRight size={22} aria-hidden="true" /></span>
          </Link> : <button className="subcategory-preview" tabIndex={visible ? 0 : -1}
            onClick={() => select(i, slot < 0 ? -1 : 1)} aria-label={'Show ' + label}>
            <img src={images[key]?.[0]?.src} alt="" loading="eager" draggable="false" />
            <span>{label}<ArrowUpRight size={20} aria-hidden="true" /></span>
          </button>}
        </motion.div>;
      })}
    </motion.div>
    <div className="subcategory-caption">
      <button className="subcategory-arrow" onClick={() => select(previous, -1)} aria-label="Previous celebration"><ChevronLeft size={21} /></button>
      <div aria-live={paused ? 'polite' : 'off'} aria-atomic="true">
        <span className="subcategory-count">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
        <div className="subcategory-title-window"><AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div key={slug} custom={direction} variants={{ enter: d => ({ opacity: 0, y: d * 22 }), exit: d => ({ opacity: 0, y: d * -22 }) }}
            initial={reduced ? false : 'enter'} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : 'exit'}
            transition={{ duration: reduced ? 0 : .25, ease }}>
            <Link href={'/services/' + parent + '/' + slug}><h2>{title}</h2></Link>
          </motion.div>
        </AnimatePresence></div>
      </div>
      <button className="subcategory-arrow" onClick={() => select(next)} aria-label="Next celebration"><ChevronRight size={21} /></button>
    </div>
    <div className="subcategory-tabs" role="tablist" aria-label="Choose a celebration">
      {items.map(([key, label], i) => <button key={key} ref={el => { tabs.current[i] = el; }} id={'collection-tab-' + key}
        role="tab" aria-selected={i === index} aria-controls={'collection-panel-' + parent} tabIndex={i === index ? 0 : -1}
        className={'subcategory-tab' + (i === index ? ' selected' : '')} onClick={() => select(i, i < index ? -1 : 1)}>
        <span className="subcategory-tab-image"><img src={images[key]?.[0]?.src} alt="" loading="lazy" />
          <span className="subcategory-progress" key={i === index ? String(paused) + String(engaged) : 'idle'}
            style={{ animationPlayState: engaged || paused || reduced ? 'paused' : 'running' }} /></span>
        <span>{label}</span>
      </button>)}
    </div>
    {!reduced && <button className="subcategory-play" aria-pressed={paused} onClick={() => setPaused(p => !p)}>
      {paused ? <Play size={13} /> : <Pause size={13} />}{paused ? 'Play slideshow' : 'Pause slideshow'}
    </button>}
  </section>;
}
