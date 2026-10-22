'use client';
import React, { useEffect, useRef, useState } from 'react';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
function Link({ to, ...props }) { return <NextLink href={to} {...props} />; }
function useLocation() { const raw = usePathname() || '/'; const pathname = raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw; return { pathname }; }
function useParams() { const raw = usePathname() || '/'; const p = raw.split('/').filter(Boolean); return { category: p[1], subcategory: p[2] }; }
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, ArrowDown, Menu, X, Flower2, Sparkles, Heart, Users, PartyPopper, Building2, Move, Pause, Play, ChevronLeft, ChevronRight, Instagram, Phone, Mail } from 'lucide-react';
import images from './images.json';
import SubcategoryCarousel from './CelebrationShowcase';
import HomeIntro from './HomeIntro';
import { ContentProvider, useUtsavContent } from './context/ContentContext';
import SmartImage from './components/SmartImage';

const fallbackServices = [
  ['wedding-decor', 'Wedding Decor', Heart, 'A beautiful beginning. A lifetime of memories.'],
  ['birthday-decor', 'Birthday Decor', PartyPopper, 'A little wonder, a lot of joy.'],
  ['traditional-celebrations', 'Traditional Celebrations', Flower2, 'Rooted in timeless culture and festive spirit.'],
  ['house-celebrations', 'House Celebrations', Users, 'The warmth of home, elevated for intimate moments.']
];
const weddings = [
  ['engagement', 'Engagement'],
  ['reception', 'Reception'],
  ['pellikoduku-pellikuthuru', 'Pellikoduku & Pellikuthuru'],
  ['haldi', 'Haldi'],
  ['mehendi', 'Mehendi'],
  ['sangeeth', 'Sangeeth'],
  ['wedding-day-decor', 'Wedding Day Decor']
];
const fallbackTitles = {
  'wedding-decor': 'Wedding Decor',
  'weddings': 'Wedding Decor',
  'birthday-decor': 'Birthday Decor',
  'birthdays': 'Birthday Decor',
  'traditional-celebrations': 'Traditional Celebrations',
  'house-celebrations': 'House Celebrations',
  engagement: 'Engagement',
  reception: 'Reception',
  'pellikoduku-pellikuthuru': 'Pellikoduku & Pellikuthuru',
  pellikoduku: 'Pellikoduku & Pellikuthuru',
  pellikuthuru: 'Pellikoduku & Pellikuthuru',
  haldi: 'Haldi',
  mehendi: 'Mehendi',
  sangeeth: 'Sangeeth',
  'wedding-day-decor': 'Wedding Day Decor'
};
const fallbackDescriptions = {
  'wedding-decor': 'From intimate pre-wedding rituals to grand mandaps, every setting honours your traditions and tells your love story.',
  'weddings': 'From intimate pre-wedding rituals to grand mandaps, every setting honours your traditions and tells your love story.',
  'birthday-decor': 'A little wonder, a lot of joy. Thoughtful themes, custom backdrops, artistic floral installations and vibrant celebratory touches.',
  'birthdays': 'A little wonder, a lot of joy. Thoughtful themes, custom backdrops, artistic floral installations and vibrant celebratory touches.',
  'traditional-celebrations': 'From Sankranti and Ugadi to Diwali and sacred rituals, celebrating the rich colours, fragrant marigolds, and sacred togetherness of our heritage.',
  'house-celebrations': 'The warmth of home, thoughtfully celebrated. Intimate poojas, housewarming ceremonies, and beautiful family gatherings.',
  engagement: 'The first promise deserves a beautiful setting. Bespoke floral backdrops, intimate seating, and a celebration that feels like you.',
  reception: 'Grand stages, enchanting ambient lighting, and opulent floral statements to celebrate your new beginning with everyone you cherish.',
  'pellikoduku-pellikuthuru': 'Honouring the bride and groom’s sacred new beginnings with rich Telugu traditions, fragrant flowers, and the warmth of family.',
  pellikoduku: 'Honouring the bride and groom’s sacred new beginnings with rich Telugu traditions, fragrant flowers, and the warmth of family.',
  pellikuthuru: 'Honouring the bride and groom’s sacred new beginnings with rich Telugu traditions, fragrant flowers, and the warmth of family.',
  haldi: 'Sunshine, marigolds and a little mischief. A bright, playful setting for your happiest pre-wedding moments.',
  mehendi: 'Vibrant hues, fragrant henna, and playful festivities. A celebratory setting adorned with floral swings, colorful drapes, and joyful energy.',
  sangeeth: 'A stage for your favourite people and your favourite songs. Rich colours, glowing lights and an unforgettable evening.',
  'wedding-day-decor': 'From the mandap to the smallest table detail, a setting that honours your traditions and tells your story.'
};

function Photo({ item, className = '', ...rest }) {
  return <SmartImage className={className} src={item?.src} alt={item?.alt || 'Indian event design inspiration'} loading="lazy" {...rest} />;
}
function Logo({ beige = false }) { return <span className="logo-crop"><img src={beige ? '/brand/logo-beige.webp' : '/brand/logo-green.webp'} alt="The Utsav House — Handcrafting Memories" /></span> }
function ThreeFlorals() { const ref = useRef(); const reduced = useReducedMotion(); useEffect(() => { if (reduced) return; let dispose, stopped = false; import('three').then(T => { if (stopped) return; try { const host = ref.current, scene = new T.Scene(), camera = new T.PerspectiveCamera(40, 1, .1, 100); camera.position.z = 9; const renderer = new T.WebGLRenderer({ alpha: true, antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); host.appendChild(renderer.domElement); const group = new T.Group(); scene.add(group); const mat = new T.MeshStandardMaterial({ color: 0xb6a46d, metalness: .6, roughness: .4 }); for (let j = 0; j < 3; j++) { const flower = new T.Group(); for (let i = 0; i < 8; i++) { const petal = new T.Mesh(new T.TorusGeometry(.48, .018, 6, 48), mat); petal.scale.set(.5, 1, 1); petal.position.set(Math.sin(i * Math.PI / 4) * .42, Math.cos(i * Math.PI / 4) * .42, 0); petal.rotation.z = -i * Math.PI / 4; flower.add(petal) } flower.position.set(j === 0 ? -2.5 : 2.4, j === 1 ? 2 : -2, j * .3); group.add(flower) } scene.add(new T.AmbientLight(0xffffff, 2)); const light = new T.DirectionalLight(0xffe5ba, 4); light.position.set(3, 3, 5); scene.add(light); let pointer = 0; const move = e => pointer = (e.clientX / innerWidth - .5) * .5; window.addEventListener('pointermove', move); const resize = () => { renderer.setSize(host.clientWidth, host.clientHeight); camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix() }; const ro = new ResizeObserver(resize); ro.observe(host); let id; const tick = t => { group.rotation.y += (pointer - group.rotation.y) * .025; group.children.forEach((g, i) => { g.rotation.z = t * .00005 * (i % 2 ? -1 : 1); g.rotation.x = Math.sin(t * .0003 + i) * .25 }); renderer.render(scene, camera); id = requestAnimationFrame(tick) }; id = requestAnimationFrame(tick); dispose = () => { cancelAnimationFrame(id); ro.disconnect(); window.removeEventListener('pointermove', move); scene.traverse(o => { o.geometry?.dispose() }); mat.dispose(); renderer.dispose(); renderer.domElement.remove() } } catch { } }); return () => { stopped = true; dispose?.() } }, [reduced]); return <div ref={ref} className="three-florals" aria-hidden="true" /> }
function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    if (!open) return;
    function escape(e) {
      if (e.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
    }
    const media = window.matchMedia('(max-width: 760px)');
    const resize = () => { if (!media.matches) setOpen(false); };
    window.addEventListener('keydown', escape);
    media.addEventListener('change', resize);
    return () => { window.removeEventListener('keydown', escape); media.removeEventListener('change', resize); };
  }, [open]);
  return <header className={(loc.pathname === '/' ? 'landing-header' : '') + (open ? ' menu-is-open' : '')}>
    <Link to="/" className="brand" aria-label="The Utsav House home"><Logo /></Link>
    <button ref={toggle} className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="primary-navigation">{open ? <X /> : <Menu />}</button>
    <nav id="primary-navigation" aria-label="Main navigation" className={open ? 'open' : ''}>
      {['About', 'Services', 'Gallery', 'Contact'].map(n => <Link key={n} className={loc.pathname === '/' + n.toLowerCase() ? 'active' : ''} aria-current={loc.pathname === '/' + n.toLowerCase() ? 'page' : undefined} to={'/' + n.toLowerCase()} onClick={() => setOpen(false)}>{n}</Link>)}
    </nav>
    <div className="header-actions"><Link className="button cream nav-cta" to="/contact">Plan Your Event <ArrowUpRight size={17} /></Link><CallButton /></div>
  </header>;
}
function CallButton() { return <a className="button call-button" href="tel:+919676837722" aria-label="Call The Utsav House on +91 9676837722"><Phone size={16} aria-hidden="true" />Call</a>; }
function Button({ to = '/contact', children = 'Plan Your Event', light = false }) { return <Link className={'button ' + (light ? 'cream' : '')} to={to}>{children}<ArrowUpRight size={18} /></Link> }
function Title({ eyebrow, children, text }) { return <div className="section-title"><p className="eyebrow">{eyebrow}</p><h1>{children}</h1>{text && <p className="lede">{text}</p>}<span className="divider">— <Flower2 size={20} /> —</span></div> }
function Reveal({ children, direction = 'left', delay = 0, className = '' }) { const reduced = useReducedMotion(); if (reduced) return <div className={className}>{children}</div>; const offset = direction === 'left' ? -40 : direction === 'right' ? 40 : 0; return <motion.div className={className} initial={{ opacity: 0, x: offset }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.16, margin: '0px 0px -40px 0px' }} transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>; }

function ServiceLinks() {
  const { categories } = useUtsavContent();
  const topCategories = categories.filter(c => !c.parent_slug);
  return (
    <div className="celebration-grid">
      {topCategories.map(s => (
        <Link to={'/services/' + s.slug} key={s.slug} className="celebration-link">
          <div className="celebration-image">
            <SmartImage src={s.cover_image || '/images/hero-wedding-garden.webp'} alt={s.cover_alt || s.title} loading="lazy" width="720" height="800" />
          </div>
          <h3>{s.title}</h3>
        </Link>
      ))}
    </div>
  );
}

function Home() {
  const { siteSettings, getCategoryImages, getCategoryTitle } = useUtsavContent();
  return <>
    <section className="hero hero-banner" aria-labelledby="hero-title">
      <SmartImage
        className="hero-banner-image"
        src={siteSettings?.hero_image || '/images/hero-wedding-garden.webp'}
        alt={siteSettings?.hero_image_alt || 'Ivory floral wedding mandap beside a lake in the warm evening light'}
        fetchPriority="high"
        loading="eager"
      />
      <div className="hero-copy">
        <p className="eyebrow">{siteSettings?.hero_eyebrow || 'EVENT PLANNING & DESIGN · INDIA'}</p>
        <h1 id="hero-title" style={{ whiteSpace: 'pre-line' }}>{siteSettings?.hero_title || 'Moments\nthat stay\nforever.'}</h1>
        <p className="hero-description" style={{ whiteSpace: 'pre-line' }}>{siteSettings?.hero_description || 'Thoughtfully planned. Beautifully designed.\nWe turn your special moments into unforgettable memories.'}</p>
        <div className="actions">
          <Button light />
          <CallButton />
          <Link className="text-link" to="/about">Our Story <ArrowUpRight size={18} /></Link>
        </div>
      </div>
      <a className="hero-scroll" href="#services">Scroll to explore<ArrowDown size={26} strokeWidth={1} aria-hidden="true" /></a>
    </section>

    <Reveal direction="right">
      <section id="services" className="section services-home">
        <h2 className="celebrations-heading">Events for every story</h2>
        <ServiceLinks />
      </section>
    </Reveal>

    <section className="story section">
      <Reveal direction="left" className="story-images-wrap">
        <div className="story-images">
          <Photo item={{ src: siteSettings?.story_image_1 || '/images/event-100.jpg', alt: 'Story inspiration left' }} />
          <Photo item={{ src: siteSettings?.story_image_2 || '/images/event-101.jpg', alt: 'Story inspiration right' }} />
          <span className="small-seal">MADE WITH<br />♡<br />MEANING</span>
        </div>
      </Reveal>
      <Reveal direction="right">
        <div>
          <p className="eyebrow">THE UTSAV HOUSE</p>
          <h2>Rooted in tradition.<br /><em>Designed around you.</em></h2>
          <p>Utsav is the feeling of coming together. Of a home filled with laughter, flowers chosen with love, and traditions shared across generations.</p>
          <p>We bring that feeling to every celebration — weaving your story into the colours, textures and little details that make it yours.</p>
          <Button to="/about">Get to know us</Button>
        </div>
      </Reveal>
    </section>

    <Reveal direction="left">
      <section className="featured section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A LITTLE INSPIRATION</p>
            <h2>Beautifully Indian.<br /><em>Uniquely yours.</em></h2>
          </div>
          <Button to="/gallery">Explore the gallery</Button>
        </div>
        <div className="feature-grid">
          {['wedding-day-decor', 'haldi', 'sangeeth'].map(k => {
            const catImgs = getCategoryImages(k);
            const firstImg = catImgs && catImgs[0] ? catImgs[0] : { src: '/images/event-100.jpg', alt: k };
            return (
              <Link to={'/services/wedding-decor/' + k} key={k}>
                <Photo item={firstImg} />
                <div>
                  <h3>{getCategoryTitle(k) || fallbackTitles[k]}</h3>
                  <ArrowUpRight />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </Reveal>

    <Reveal direction="right">
      <Testimonials />
    </Reveal>

    <Reveal direction="left">
      <CTA />
    </Reveal>
  </>;
}

function Testimonials() {
  const { testimonials } = useUtsavContent();
  const activeReviews = testimonials.filter(t => t.is_visible !== false);
  return (
    <section className="testimonials section">
      <Title eyebrow="KIND WORDS">Love, in their words</Title>
      <div className="marquee" tabIndex="0" aria-label="Client testimonials. Focus or hover to pause.">
        <div className="marquee-track">
          {[0, 1].map(copy => (
            <div className="quote-set" key={copy} aria-hidden={copy === 1}>
              {activeReviews.map((item, i) => (
                <blockquote key={item.id || i}>
                  <span>“</span>
                  <p>{item.quote}</p>
                  <cite>{item.client_name} · {item.event_type}</cite>
                </blockquote>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() { return <section className="cta"><Flower2 strokeWidth={1} /><p className="eyebrow">LET’S MAKE SOMETHING BEAUTIFUL</p><h2>Your next chapter,<br /><em>thoughtfully celebrated.</em></h2><Button light>Tell us your story</Button></section> }

function About() {
  const { siteSettings } = useUtsavContent();
  return <>
    <section className="section about-page">
      <Title eyebrow="OUR STORY" text="A celebration should feel like you. Warm, personal and full of meaning.">
        More than an event.<br /><em>A feeling to remember.</em>
      </Title>
      <div className="about-layout">
        <Reveal direction="left">
          <Photo item={{ src: siteSettings?.about_image || '/images/event-109.jpg', alt: 'The Utsav House royal temple mandap' }} />
        </Reveal>
        <Reveal direction="right">
          <div>
            <p className="eyebrow">HANDCRAFTING MEMORIES</p>
            <h2>Rooted in tradition.<br /><em>Designed around you.</em></h2>
            <p>The Utsav House is an event planning and design studio rooted in the warmth of Indian celebrations. From sacred family rituals to wedding days filled with hundreds of loved ones, our approach begins with your story.</p>
            <p>We believe magnificent aesthetic design belongs alongside thoughtful execution: a considered palette, meaningful traditions, and space for you to be fully present with those you love.</p>
            <div style={{ marginTop: '30px' }}><Button to="/contact">Plan With Us</Button></div>
          </div>
        </Reveal>
      </div>
      <Reveal direction="left">
        <div className="stats-grid">
          <div><div className="stat-number">500+</div><div className="stat-label">Personalised Designs</div></div>
          <div><div className="stat-number">360°</div><div className="stat-label">Event Planning and Execution</div></div>
          <div><div className="stat-number">100%</div><div className="stat-label">Bespoke Production</div></div>
          <div><div className="stat-number">40+</div><div className="stat-label">Master Artisans & Florists</div></div>
        </div>
      </Reveal>
      <div className="section-title"><p className="eyebrow">OUR GUIDING PRINCIPLES</p><h2>How We Bring Your Vision To Life</h2></div>
      <Reveal direction="right">
        <div className="principles">
          {[['01', 'We listen', 'Your family rituals, your vision, and your heritage. That is where every creative concept begins.'], ['02', 'We imagine', 'A harmonious design story with custom floral sketches, architectural 3D layouts, and curated color palettes.'], ['03', 'We handcraft', 'Meticulous coordination with master florists and lighting designers so every detail connects seamlessly.']].map(([n, t, p]) => (
            <article key={n}><span>{n}</span><h3>{t}</h3><p>{p}</p></article>
          ))}
        </div>
      </Reveal>
    </section>
    <Reveal direction="left"><CTA /></Reveal>
  </>;
}

function Services() {
  return <>
    <section className="section services-page">
      <Title eyebrow="CELEBRATE YOUR WAY" text="From the first spark of an idea to the final finishing touch, we shape events that linger in hearts forever.">
        A world of celebrations
      </Title>
      <Reveal direction="right"><ServiceLinks /></Reveal>
      <div style={{ marginTop: '80px' }}>
        <div className="section-title"><p className="eyebrow">CURATED EXPERIENCES</p><h2>Celebration Collections</h2><p className="lede">Whether an intimate ceremony or a grand multi-day wedding celebration, we have tailored collections to suit your vision.</p></div>
        <Reveal direction="left">
          <div className="tiers-grid">
            <div className="tier-card">
              <h3>The Intimate Utsav</h3>
              <p>Thoughtful styling for family ceremonies, poojas, haldi, and home festivities.</p>
              <ul className="tier-features">
                <li>Traditional fresh floral styling</li>
                <li>Handcrafted backdrop & seating setup</li>
                <li>Brass urlis, lamps & marigold drapes</li>
                <li>Day-of decorative styling coordination</li>
              </ul>
              <Button to="/contact" light>Inquire Collection</Button>
            </div>
            <div className="tier-card featured">
              <span className="tier-badge">Most Cherished</span>
              <h3>The Heritage Grandeur</h3>
              <p>Our hallmark complete wedding & grand celebration spatial transformation.</p>
              <ul className="tier-features">
                <li>Grand custom mandap or stage architecture</li>
                <li>Full spatial entrance & pathway floral arches</li>
                <li>Artisanal ambient lighting & chandelier production</li>
                <li>Bespoke dining & guest lounge curations</li>
                <li>Dedicated senior design lead on-site</li>
              </ul>
              <Button to="/contact">Plan Heritage Event</Button>
            </div>
            <div className="tier-card">
              <h3>The Royal Bespoke</h3>
              <p>Complete multi-day luxury wedding production, couture styling & concierge execution.</p>
              <ul className="tier-features">
                <li>Comprehensive multi-event thematic narratives</li>
                <li>Custom structural builds, sets & 3D renders</li>
                <li>Imported exotic florals & heritage fabrics</li>
                <li>Celebrity hospitality & artist stage logistics</li>
                <li>Complete 24/7 senior planning team</li>
              </ul>
              <Button to="/contact" light>Discuss Bespoke</Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
    <Reveal direction="right"><CTA /></Reveal>
  </>;
}

function ServicePage() {
  const { category: rawCat, subcategory } = useParams();
  const { getCategoryImages, getCategoryTitle, getCategoryDescription } = useUtsavContent();
  const category = (rawCat === 'weddings') ? 'wedding-decor' : (rawCat === 'birthdays') ? 'birthday-decor' : rawCat;
  const key = subcategory || category;
  const isWedding = category === 'wedding-decor' || category === 'weddings';
  const pageTitle = getCategoryTitle(key) || fallbackTitles[key];
  const pageDesc = getCategoryDescription(key) || fallbackDescriptions[key] || fallbackServices.find(s => s[0] === key)?.[3];

  if (!pageTitle || (subcategory && (!isWedding || (!weddings.some(a => a[0] === subcategory) && subcategory !== 'pellikoduku' && subcategory !== 'pellikuthuru')))) {
    return <NotFound />;
  }

  const items = (!subcategory && isWedding) ? weddings : null;
  const list = getCategoryImages(key);

  return <>
    <section className="section service-page">
      <Link className="back-link" to={subcategory ? '/services/' + category : '/services'}>
        <ChevronLeft size={15} /> {subcategory ? (getCategoryTitle(category) || fallbackTitles[category]) : 'All services'}
      </Link>
      <Title eyebrow={subcategory ? (getCategoryTitle(category) || fallbackTitles[category]) : 'OUR SERVICES'} text={pageDesc}>
        {pageTitle}
      </Title>
      {items && <SubcategoryCarousel key={category} items={items} parent={category} />}
      <div className="collection-heading">
        <h2>{items ? 'A glimpse of the possibilities' : 'A little inspiration'}</h2>
        <span>{list.length} frames of inspiration</span>
      </div>
      <p className="demo-note">Curated inspiration imagery, handcrafted for memorable celebrations.</p>
      <ImageGrid items={list} />
      <div className="center-action"><Button>Plan {pageTitle.toLowerCase()}</Button></div>
    </section>
    <CTA />
  </>;
}

function ImageGrid({ items }) {
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    const key = e => {
      if (e.key === 'Escape') setSelected(null);
      if (e.key === 'ArrowRight') setSelected(s => s === null ? null : (s + 1) % items.length);
      if (e.key === 'ArrowLeft') setSelected(s => s === null ? null : (s - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [items.length]);

  return <>
    <div className="masonry">
      {items.map((im, i) => (
        <button key={i} onClick={() => setSelected(i)} aria-label={'View ' + (im.alt || 'Moment')}>
          <Photo item={im} />
          <span>View moment <ArrowUpRight size={16} /></span>
        </button>
      ))}
    </div>
    {selected !== null && (
      <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setSelected(null)}>
        <button autoFocus className="close" aria-label="Close image" onClick={() => setSelected(null)}><X /></button>
        <button aria-label="Previous image" onClick={e => { e.stopPropagation(); setSelected((selected - 1 + items.length) % items.length); }}><ChevronLeft /></button>
        <figure onClick={e => e.stopPropagation()}>
          <Photo item={items[selected]} />
          <figcaption>{selected + 1} / {items.length} · {items[selected]?.alt}</figcaption>
        </figure>
        <button aria-label="Next image" onClick={e => { e.stopPropagation(); setSelected((selected + 1) % items.length); }}><ChevronRight /></button>
      </div>
    )}
  </>;
}

function Gallery() {
  const { getCategoryImages } = useUtsavContent();
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const field = useRef();
  const offset = useRef({ x: 0, y: 0 });
  const drag = useRef(null);
  const dragMoved = useRef(0);
  const velocity = useRef({ x: 0, y: 0 });
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const all = [
    ...getCategoryImages('wedding-decor').slice(0, 8),
    ...getCategoryImages('wedding-day-decor').slice(0, 6),
    ...getCategoryImages('engagement').slice(0, 6),
    ...getCategoryImages('reception').slice(0, 6),
    ...getCategoryImages('haldi').slice(0, 6),
    ...getCategoryImages('mehendi').slice(0, 6),
    ...getCategoryImages('sangeeth').slice(0, 6),
    ...getCategoryImages('pellikoduku-pellikuthuru').slice(0, 6),
    ...getCategoryImages('traditional-celebrations').slice(0, 6),
    ...getCategoryImages('house-celebrations').slice(0, 6),
    ...getCategoryImages('birthday-decor').slice(0, 6)
  ];

  useEffect(() => {
    let id, last = performance.now();
    const tick = t => {
      let dt = Math.min(t - last, 40);
      last = t;
      if (!drag.current && !reduced && !paused && lightboxIndex === null) {
        const speed = 0.038;
        offset.current.x += dt * speed;
        offset.current.y += dt * (speed * 0.65);
      }
      if (!drag.current && !reduced && lightboxIndex === null) {
        offset.current.x += velocity.current.x;
        offset.current.y += velocity.current.y;
        velocity.current.x *= 0.92;
        velocity.current.y *= 0.92;
      }
      const el = field.current;
      if (el) {
        const w = el.offsetWidth / 2, h = el.offsetHeight / 2;
        if (w > 0 && h > 0) {
          offset.current.x = ((offset.current.x % w) + w) % w;
          offset.current.y = ((offset.current.y % h) + h) % h;
          el.style.transform = `translate3d(${-offset.current.x}px,${-offset.current.y}px,0)`;
        }
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [reduced, paused, lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const key = e => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % all.length);
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i - 1 + all.length) % all.length);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [lightboxIndex, all.length]);

  const handlePointerDown = e => {
    if (e.target.closest('.gallery-back-btn') || e.target.closest('.lightbox')) return;
    drag.current = { x: e.clientX, y: e.clientY };
    dragMoved.current = 0;
    velocity.current = { x: 0, y: 0 };
  };
  const handlePointerMove = e => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    dragMoved.current += Math.hypot(dx, dy);
    if (dragMoved.current >= 6) e.currentTarget.setPointerCapture(e.pointerId);
    offset.current.x -= dx;
    offset.current.y -= dy;
    velocity.current = { x: -dx * 0.7, y: -dy * 0.7 };
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const handlePointerUp = () => { drag.current = null; };
  const handleWheel = e => { offset.current.x += e.deltaX; offset.current.y += e.deltaY; };
  const handlePhotoClick = i => { if (dragMoved.current < 6) { setLightboxIndex(i); } };

  return (
    <section className="gallery-page beige">
      <Link to="/" className="gallery-back-btn" aria-label="Back to website"><ChevronLeft size={18} /> <span>Back</span></Link>
      <button className="gallery-motion-toggle" onClick={() => setPaused(p => !p)} aria-pressed={paused || !!reduced} disabled={!!reduced}>
        {paused || reduced ? <Play size={16} /> : <Pause size={16} />}
        {reduced ? 'Motion reduced' : paused ? 'Resume motion' : 'Pause motion'}
      </button>
      <div className="gallery-center-hero">
        <p className="eyebrow">THE UTSAV HOUSE · INSPIRATION</p>
        <h1>REAL MOMENTS.</h1>
        <p className="gallery-subtitle">Weddings, Receptions, Engagements & Traditions · Handcrafting Memories</p>
      </div>
      <div className="gallery-viewport" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel}>
        <div className="infinite-field" ref={field}>
          {[0, 1, 2, 3].map(copy => (
            <div className="gallery-tile" key={copy} aria-hidden={copy > 0}>
              {all.map((im, i) => (
                <button type="button" className="gallery-photo" key={i} tabIndex={copy === 0 ? 0 : -1} aria-label={'View ' + (im.alt || 'celebration moment')} onClick={e => { if (e.detail === 0) setLightboxIndex(i); else handlePhotoClick(i); }}>
                  <Photo item={im} draggable="false" />
                  <span>{im.alt || 'Celebration moment'}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {lightboxIndex !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setLightboxIndex(null)}>
          <button autoFocus className="close" aria-label="Close image" onClick={() => setLightboxIndex(null)}><X /></button>
          <button aria-label="Previous image" onClick={e => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + all.length) % all.length); }}><ChevronLeft /></button>
          <figure onClick={e => e.stopPropagation()}>
            <Photo item={all[lightboxIndex]} />
            <figcaption>{lightboxIndex + 1} / {all.length} · {all[lightboxIndex]?.alt}</figcaption>
          </figure>
          <button aria-label="Next image" onClick={e => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % all.length); }}><ChevronRight /></button>
        </div>
      )}
    </section>
  );
}

function Contact() {
  const { siteSettings, categories } = useUtsavContent();
  const [done, setDone] = useState(false);
  const topCategories = categories.filter(c => !c.parent_slug);

  function submit(e) {
    e.preventDefault();
    const details = [...new FormData(e.currentTarget).entries()]
      .filter(([, value]) => String(value).trim())
      .map(([key, value]) => key + ': ' + String(value).trim());
    const text = 'THE UTSAV HOUSE - EVENT ENQUIRY\n\n' + details.join('\n');
    window.open('https://wa.me/919676837722?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
    setDone(true);
  }

  return (
    <section className="section contact">
      <Reveal direction="left">
        <div>
          <p className="eyebrow">LET’S BEGIN</p>
          <h1>Every beautiful<br />celebration starts<br />with <em>a hello.</em></h1>
          <p>Tell us what you are dreaming of.<br />Let’s make room for a little magic and craft an unforgettable experience.</p>
          <div className="contact-info-cards">
            <div className="contact-info-item">
              <div className="contact-info-icon"><Heart size={20} /></div>
              <div className="contact-info-text">
                <h4>Call & Direct Line</h4>
                <p>
                  <a href={`tel:${(siteSettings?.phone_primary || '+91 96768 37722').replace(/\s+/g, '')}`}>
                    {siteSettings?.phone_primary || '+91 96768 37722'}
                  </a>
                  {' / '}
                  <a href={`tel:${(siteSettings?.phone_secondary || '+91 96768 47722').replace(/\s+/g, '')}`}>
                    {siteSettings?.phone_secondary || '+91 96768 47722'}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${siteSettings?.email_address || 'theutsavhouse@gmail.com'}`}>
                    {siteSettings?.email_address || 'theutsavhouse@gmail.com'}
                  </a>
                </p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon"><Instagram size={20} /></div>
              <div className="contact-info-text">
                <h4>Follow our celebrations</h4>
                <p>
                  <a
                    href={siteSettings?.instagram_url || 'https://www.instagram.com/the_utsavhouse/'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {siteSettings?.instagram_handle || '@the_utsavhouse'}
                  </a>
                </p>
              </div>
            </div>
          </div>
          <a href="https://wa.me/919676837722?text=Hello%20The%20Utsav%20House,%20I%20would%20like%20to%20plan%20a%20celebration" target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
            <span>💬 Chat directly on WhatsApp</span> <ArrowUpRight size={16} />
          </a>
          <div style={{ marginTop: '30px', borderRadius: '16px', overflow: 'hidden', height: '220px' }}>
            <Photo item={{ src: siteSettings?.contact_image || '/images/wedding-day-decor/wedding-day-decor-01.jpeg', alt: 'Wedding entrance arch decorated with flowers and hanging bells' }} />
          </div>
        </div>
      </Reveal>
      <Reveal direction="right">
        <form onSubmit={submit}>
          <h2>Your celebration, your way.</h2>
          <p>Tell us about your event and send your enquiry on WhatsApp.</p>
          <div className="form-row">
            <label>Your name<input required name="Name" autoComplete="name" placeholder="Full name" /></label>
            <label>Phone<input required type="tel" name="Phone" autoComplete="tel" placeholder="Your phone number" /></label>
          </div>
          <label>
            What are we celebrating?
            <select required name="Celebration" defaultValue="">
              <option value="" disabled>Select your event</option>
              {topCategories.map(cat => (
                <option key={cat.slug} value={cat.title}>{cat.title}</option>
              ))}
            </select>
          </label>
          <label>Event date <span className="field-optional">(optional)</span><input type="date" name="Date" /></label>
          <label>A little about your event <span className="field-optional">(optional)</span><textarea name="Message" rows="3" placeholder="Share a date, venue or anything you have in mind." /></label>
          <button className="button" type="submit">Enquire on WhatsApp <ArrowUpRight size={18} /></button>
          <small>Opens WhatsApp with your event details. Tap send there to share your enquiry with our team.</small>
          {done && <p role="status" className="success">Continue in WhatsApp to send your enquiry to +91 96768 37722.</p>}
        </form>
      </Reveal>
    </section>
  );
}

function Footer() {
  const { categories, siteSettings } = useUtsavContent();
  const topCategories = categories.filter(c => !c.parent_slug);
  const instagramUrl = siteSettings?.instagram_url || 'https://www.instagram.com/the_utsavhouse/';
  const instagramHandle = siteSettings?.instagram_handle || '@the_utsavhouse';
  const emailAddress = siteSettings?.email_address || 'theutsavhouse@gmail.com';
  const phonePrimary = siteSettings?.phone_primary || '+91 96768 37722';
  const phoneSecondary = siteSettings?.phone_secondary || '+91 96768 47722';

  return (
    <footer>
      <div>
        <Logo />
        <p className="footer-tagline">Thoughtfully planned. Beautifully designed.<br />Handcrafting memories, here in India.</p>
        <div className="footer-contact-links" aria-label="Contact channels & social handles">
          {phonePrimary && (
            <a href={`tel:${phonePrimary.replace(/\s+/g, '')}`} className="footer-contact-item" aria-label={`Call ${phonePrimary}`}>
              <span className="footer-icon-badge"><Phone size={14} aria-hidden="true" /></span>
              <span>{phonePrimary}</span>
            </a>
          )}
          {phoneSecondary && (
            <a href={`tel:${phoneSecondary.replace(/\s+/g, '')}`} className="footer-contact-item" aria-label={`Call ${phoneSecondary}`}>
              <span className="footer-icon-badge"><Phone size={14} aria-hidden="true" /></span>
              <span>{phoneSecondary}</span>
            </a>
          )}
          {instagramHandle && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-contact-item" aria-label={`Instagram profile ${instagramHandle}`} title="Instagram">
              <span className="footer-icon-badge"><Instagram size={14} aria-hidden="true" /></span>
              <span>{instagramHandle}</span>
            </a>
          )}
          {emailAddress && (
            <a href={`mailto:${emailAddress}`} className="footer-contact-item" aria-label={`Email ${emailAddress}`} title="Email">
              <span className="footer-icon-badge"><Mail size={14} aria-hidden="true" /></span>
              <span>{emailAddress}</span>
            </a>
          )}
        </div>
      </div>
      <div>
        <p className="eyebrow">EXPLORE</p>
        {['About', 'Services', 'Gallery', 'Contact'].map(t => <Link to={'/' + t.toLowerCase()} key={t}>{t}</Link>)}
      </div>
      <div>
        <p className="eyebrow">CELEBRATIONS</p>
        {topCategories.map(cat => (
          <Link key={cat.slug} to={'/services/' + cat.slug}>{cat.title}</Link>
        ))}
        <Link to="/contact">Plan your event ↗</Link>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} The Utsav House <span>Made for meaningful moments.</span>
      </div>
    </footer>
  );
}

function NotFound() { return <section className="section not-found"><p className="eyebrow">404 · A LITTLE DETOUR</p><h1>Let’s find your<br /><em>way back.</em></h1><Button to="/">Back home</Button></section>; }

function AppInner() {
  const location = useLocation();
  const isGallery = location.pathname.startsWith('/gallery');
  const reduced = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = (location.pathname === '/' ? 'Handcrafting Memories' : location.pathname.split('/').at(-1).replaceAll('-', ' ')) + ' | The Utsav House';
  }, [location.pathname]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      {!isGallery && <Header />}
      {location.pathname === '/' && <HomeIntro />}
      <AnimatePresence mode="wait">
        <motion.main
          id="main"
          key={location.pathname}
          initial={reduced || location.pathname === '/' ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -12 }}
          transition={{ duration: 0.3 }}
        >
          {location.pathname === '/' ? <Home /> :
            location.pathname === '/about' ? <About /> :
            location.pathname === '/services' ? <Services /> :
            location.pathname.startsWith('/services/') ? <ServicePage /> :
            location.pathname.startsWith('/gallery') ? <Gallery /> :
            location.pathname === '/contact' ? <Contact /> :
            <NotFound />}
        </motion.main>
      </AnimatePresence>
      {!isGallery && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <AppInner />
    </ContentProvider>
  );
}
