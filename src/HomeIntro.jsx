'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function HomeIntro() {
  const [visible, setVisible] = useState(true);
  const overlay = useRef(null);
  const logo = useRef(null);

  useEffect(() => {
    if (!visible) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) { setVisible(false); return; }

    let stopped = false;
    let hold;
    const animations = [];
    const brand = document.querySelector('header .brand');
    const originalVisibility = brand?.style.visibility;
    const originalOverflow = document.body.style.overflow;
    const content = [...document.querySelectorAll('header, main, footer, .skip-link')];
    const originalInert = content.map(el => el.inert);
    content.forEach(el => { el.inert = true; });
    document.body.style.overflow = 'hidden';
    if (brand) brand.style.visibility = 'hidden';

    const finish = () => { if (!stopped) setVisible(false); };
    const changed = () => finish();
    reduced.addEventListener('change', changed);
    window.addEventListener('resize', changed);

    async function run() {
      const image = logo.current;
      if (!image || !brand) { finish(); return; }
      try { await image.decode(); } catch { finish(); return; }
      if (stopped) return;
      const reveal = image.animate([
        { opacity: 0, transform: 'translate(-50%, -44%) scale(.94)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
      ], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
      animations.push(reveal);
      try { await reveal.finished; } catch { return; }
      if (stopped) return;
      hold = window.setTimeout(async () => {
        if (stopped) return;
        const from = image.getBoundingClientRect();
        const target = brand.getBoundingClientRect();
        // Match the contained navbar image without stretching the artwork.
        const scale = Math.min(target.width / from.width, target.height / from.height);
        const x = target.left + (target.width - from.width * scale) / 2;
        const y = target.top + (target.height - from.height * scale) / 2;
        reveal.cancel();
        Object.assign(image.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, transform: 'none' });
        const flight = image.animate([
          { transform: 'translate(0,0) scale(1)' },
          { transform: `translate(${x - from.left}px,${y - from.top}px) scale(${scale})` },
        ], { duration: 1150, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
        const curtain = overlay.current.animate([
          { backgroundColor: '#35482e' }, { backgroundColor: 'rgba(53,72,46,0)' },
        ], { duration: 900, delay: 250, easing: 'ease-in-out', fill: 'forwards' });
        animations.push(flight, curtain);
        try { await flight.finished; finish(); } catch { /* Cancelled on skip or navigation. */ }
      }, 450);
    }
    run();

    return () => {
      stopped = true;
      clearTimeout(hold);
      animations.forEach(animation => animation.cancel());
      reduced.removeEventListener('change', changed);
      window.removeEventListener('resize', changed);
      document.body.style.overflow = originalOverflow;
      if (brand) brand.style.visibility = originalVisibility;
      content.forEach((el, i) => { el.inert = originalInert[i]; });
      if (overlay.current?.contains(document.activeElement)) brand?.focus({ preventScroll: true });
    };
  }, [visible]);

  if (!visible) return null;
  return <div ref={overlay} className="home-intro" role="dialog" aria-modal="true" aria-label="Welcome to The Utsav House"
    onKeyDown={e => { if (e.key === 'Escape') setVisible(false); }}>
    <img ref={logo} className="home-intro-logo" src="/brand/logo-green.webp" alt="The Utsav House — Handcrafting Memories" loading="eager" fetchPriority="high" />
    <button className="home-intro-skip" onClick={() => setVisible(false)}>Skip introduction <ArrowRight size={16} aria-hidden="true" /></button>
  </div>;
}
