import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Story } from '@storybook/addon-docs/blocks';
import './landing.css';

/** Opens another Storybook page from inside a docs page. */
const docsHref = (id: string) => `/?path=/docs/${id}`;

// ─── Welcome ────────────────────────────────────────────────────────────────

// Shapes and stars from the PCR designs (exported in pcr-demo/src/assets/figma):
// the "Report submitted" flower, moons and cross, and the AI sparkles.
import flower from './assets/submitted-flower.svg';
import moons from './assets/submitted-moons.svg';
import cross from './assets/submitted-cross.svg';
import starGold from './assets/submitted-sp1.svg';
import starBlue from './assets/report-ai.svg';
import starGreen from './assets/submit-spark.svg';
import starPurple from './assets/icon-kicker-sparkle.svg';
import aiSparkle from './assets/icon-ai-sparkle.svg';
// Backdrop: the perspective grid from the PCR check-in screen, and the halftone dots from MBA.
import heroGrid from './assets/hero-grid.svg';
import halftoneWarm from './assets/halftone-warm.webp';
import halftoneSide from './assets/halftone-side.webp';

/**
 * Where each shape floats: position (% of the hero), size (px), tilt and timing.
 * `phone` places it in the bands above and below the text on small screens; without it the
 * shape is hidden there.
 */
const SHAPES: { src: string; top: number; left: number; size: number; rotate: number; delay: number; phone?: [number, number] }[] = [
  { src: flower, top: 10, left: 8, size: 76, rotate: -12, delay: 0, phone: [3, 6] },
  { src: starGold, top: 6, left: 30, size: 44, rotate: 8, delay: 1.4, phone: [5, 42] },
  { src: moons, top: 12, left: 76, size: 64, rotate: 10, delay: 0.7, phone: [3, 76] },
  { src: aiSparkle, top: 34, left: 90, size: 54, rotate: 0, delay: 2.1 },
  { src: cross, top: 46, left: 3, size: 58, rotate: 18, delay: 1.1, phone: [86, 8] },
  { src: starBlue, top: 72, left: 16, size: 40, rotate: -6, delay: 0.3, phone: [90, 44] },
  { src: starPurple, top: 82, left: 44, size: 30, rotate: 12, delay: 1.8 },
  { src: flower, top: 70, left: 84, size: 52, rotate: 20, delay: 0.9, phone: [86, 78] },
  { src: starGreen, top: 19, left: 66, size: 26, rotate: -10, delay: 2.5 },
  { src: moons, top: 78, left: 70, size: 34, rotate: -18, delay: 1.6 },
];

/**
 * Welcome hero: full width, with a perspective grid floor, halftone dots and the PCR shapes
 * floating (and drifting a little with the pointer). Title, subtitle and links in the middle.
 */
export const Hero = ({ title, subtitle, children }: { title: React.ReactNode; subtitle: string; children?: React.ReactNode }) => {
  const hero = useRef<HTMLElement>(null);
  // Depth: shapes drift a little with the pointer, the bigger ones more. Mouse only, not on reduce motion.
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !hero.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = hero.current.getBoundingClientRect();
    hero.current.style.setProperty('--px', `${((e.clientX - r.left) / r.width - 0.5) * 2}`);
    hero.current.style.setProperty('--py', `${((e.clientY - r.top) / r.height - 0.5) * 2}`);
  };
  const reset = () => {
    hero.current?.style.setProperty('--px', '0');
    hero.current?.style.setProperty('--py', '0');
  };
  return (
    <header ref={hero} className="exos-hero exos-theme-dcfc" onPointerMove={onMove} onPointerLeave={reset}>
      <div className="exos-hero__backdrop" aria-hidden="true">
        <img className="exos-hero__halftone exos-hero__halftone--warm" src={halftoneWarm} alt="" />
        <img className="exos-hero__halftone exos-hero__halftone--side" src={halftoneSide} alt="" />
        <div className="exos-hero__floor">
          <img src={heroGrid} alt="" />
          <img src={heroGrid} alt="" />
        </div>
      </div>

      <div className="exos-hero__shapes" aria-hidden="true">
        {SHAPES.map((shape, i) => (
          <span
            key={i}
            className={`exos-hero__drift${shape.phone ? '' : ' exos-hero__shape--wide-only'}`}
            style={{
              top: `${shape.top}%`,
              left: `${shape.left}%`,
              ['--depth' as string]: `${shape.size / 4}px`,
              ['--phone-top' as string]: shape.phone ? `${shape.phone[0]}%` : undefined,
              ['--phone-left' as string]: shape.phone ? `${shape.phone[1]}%` : undefined,
            }}
          >
            <img
              className="exos-hero__shape"
              src={shape.src}
              alt=""
              style={{ width: shape.size, height: shape.size, animationDelay: `${shape.delay}s`, ['--tilt' as string]: `${shape.rotate}deg` }}
            />
          </span>
        ))}
      </div>

      <div className="exos-hero__content">
        <h1 className="exos-hero__title">{title}</h1>
        <p className="exos-hero__subtitle">{subtitle}</p>
        {children && <div className="exos-hero__links">{children}</div>}
      </div>
    </header>
  );
};

const ICONS: Record<string, React.ReactNode> = {
  github: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 014 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  ),
  foundations: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <rect x="1.75" y="1.75" width="12.5" height="12.5" rx="1.75" />
      <path d="M6 1.75v12.5M10 1.75v12.5" />
    </svg>
  ),
  catalog: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1.75" y="1.75" width="5" height="5" rx="1.25" />
      <rect x="9.25" y="1.75" width="5" height="5" rx="1.25" />
      <rect x="1.75" y="9.25" width="5" height="5" rx="1.25" />
      <rect x="9.25" y="9.25" width="5" height="5" rx="1.25" />
    </svg>
  ),
};

/** Small rounded link with an icon (Catalog, Foundations…). */
export const LinkPill = ({ href, icon, primary = false, children }: { href: string; icon?: keyof typeof ICONS; primary?: boolean; children: React.ReactNode }) => {
  const external = /^https?:/.test(href);
  return (
    <a className={`exos-pill${primary ? ' exos-pill--primary' : ''}`} href={href} target={external ? '_blank' : '_top'} rel={external ? 'noreferrer' : undefined}>
      {icon && ICONS[icon]}
      {children}
    </a>
  );
};

/** The "Start here" row. */
export const CardGrid = ({ children }: { children: React.ReactNode }) => <div className="exos-start">{children}</div>;

/** Line icons for the start-here cards (20px, currentColor). */
const START_ICONS: Record<string, React.ReactNode> = {
  catalog: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.75" y="2.75" width="5.5" height="5.5" rx="1.25" />
      <rect x="11.75" y="2.75" width="5.5" height="5.5" rx="1.25" />
      <rect x="2.75" y="11.75" width="5.5" height="5.5" rx="1.25" />
      <rect x="11.75" y="11.75" width="5.5" height="5.5" rx="1.25" />
    </svg>
  ),
  components: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2.5l6.5 3.75v7.5L10 17.5l-6.5-3.75v-7.5L10 2.5z" />
      <path d="M3.5 6.25L10 10l6.5-3.75M10 10v7.5" />
    </svg>
  ),
  patterns: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="2" />
      <path d="M2.75 7.25h14.5M8.25 7.25v10" />
    </svg>
  ),
  // Ruler and columns: the grid and spacing everything sits on.
  foundations: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="2" />
      <path d="M7.5 2.75v14.5M12.5 2.75v14.5" />
    </svg>
  ),
};

/**
 * A start-here card: icon tile, title, a line of description and a link line.
 * Without `href` it shows as coming soon and isn't clickable.
 */
export const StartCard = ({
  title,
  href,
  icon,
  cta,
  children,
}: {
  title: string;
  href?: string;
  icon: keyof typeof START_ICONS;
  /** Link text at the bottom, e.g. "Browse catalog". */
  cta?: string;
  children: React.ReactNode;
}) => {
  const external = !!href && /^https?:/.test(href);
  const body = (
    <>
      <span className="exos-start__icon">{START_ICONS[icon]}</span>
      <span className="exos-start__title">{title}</span>
      <span className="exos-start__body">{children}</span>
      <span className="exos-start__cta">
        {href ? (
          <>
            {cta}
            <span aria-hidden="true">{external ? ' ↗' : ' →'}</span>
          </>
        ) : (
          'Coming soon'
        )}
      </span>
    </>
  );
  return href ? (
    <a className="exos-start__card" href={href} target={external ? '_blank' : '_top'} rel={external ? 'noreferrer' : undefined}>
      {body}
    </a>
  ) : (
    <div className="exos-start__card exos-start__card--soon" aria-disabled="true">
      {body}
    </div>
  );
};

// ─── Catalog ────────────────────────────────────────────────────────────────

export type CatalogItem = {
  name: string;
  description: string;
  /** Docs page id, e.g. 'components-chip--docs'. */
  docs: string;
  /** Story shown as the live preview. */
  of: unknown;
  group: string;
};

/** Groups in reading order, each with its own tint. Unknown groups go last, in grey. */
const GROUP_ORDER = ['Actions', 'Forms', 'Navigation', 'Feedback', 'Display'];
const groupKey = (group: string) => (GROUP_ORDER.includes(group) ? group.toLowerCase() : 'other');

/**
 * The live preview, scaled down to fit its tile if it's bigger, never up.
 * Measured after the story renders, and again whenever it changes size.
 */
const Specimen = ({ of }: { of: unknown }) => {
  const stage = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      if (!stage.current || !inner.current) return;
      const pad = 32;
      const w = inner.current.scrollWidth;
      const h = inner.current.scrollHeight;
      if (!w || !h) return;
      const next = Math.min(1, (stage.current.clientWidth - pad) / w, (stage.current.clientHeight - pad) / h);
      setScale((s) => (Math.abs(s - next) > 0.01 ? next : s));
    };
    const observer = new ResizeObserver(fit);
    if (stage.current) observer.observe(stage.current);
    if (inner.current) observer.observe(inner.current);
    const timer = setTimeout(fit, 400);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);
  return (
    <div ref={stage} className="exos-catalog__stage" inert>
      <div ref={inner} className="exos-catalog__specimen" style={{ transform: `scale(${scale})` }}>
        <Story of={of as never} inline />
      </div>
    </div>
  );
};

/** Searchable, filterable grid of components: a live preview, the name and one line each. */
export const Catalog = ({ items }: { items: CatalogItem[] }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const q = query.trim().toLowerCase();

  const allGroups = useMemo(() => {
    const names = [...new Set(items.map((i) => i.group))];
    return names.sort((a, b) => (GROUP_ORDER.indexOf(a) + 99) % 99 - (GROUP_ORDER.indexOf(b) + 99) % 99 || a.localeCompare(b));
  }, [items]);

  const matches = (i: CatalogItem) => !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);

  const groups = useMemo(
    () =>
      allGroups
        .filter((g) => filter === 'All' || g === filter)
        .map((group) => ({
          group,
          items: items.filter((i) => i.group === group && matches(i)).sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .filter((g) => g.items.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, allGroups, filter, q],
  );
  const count = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="exos-catalog">
      <div className="exos-catalog__tools">
        <label className="exos-catalog__search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="7" cy="7" r="4.75" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search components…"
            aria-label="Search components"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="exos-catalog__filters" role="group" aria-label="Filter by group">
          {['All', ...allGroups].map((g) => {
            const n = items.filter((i) => (g === 'All' || i.group === g) && matches(i)).length;
            return (
              <button
                key={g}
                type="button"
                className={`exos-catalog__filter exos-catalog__filter--${g === 'All' ? 'all' : groupKey(g)}`}
                aria-pressed={filter === g}
                onClick={() => setFilter(g)}
              >
                {g}
                <span className="exos-catalog__filter-count">{n}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="exos-catalog__count" aria-live="polite">
        {count} {count === 1 ? 'component' : 'components'}
      </p>

      {groups.map(({ group, items: groupItems }) => (
        <section key={group} className={`exos-catalog__group exos-catalog__group--${groupKey(group)}`}>
          <h2 className="exos-catalog__group-title">
            <span className="exos-catalog__dot" aria-hidden="true" />
            {group}
            <span className="exos-catalog__group-count">{groupItems.length}</span>
          </h2>
          <div className="exos-catalog__grid">
            {groupItems.map((item) => (
              <a key={item.name} className="exos-catalog__card" href={docsHref(item.docs)} target="_top">
                <Specimen of={item.of} />
                <span className="exos-catalog__body">
                  <span className="exos-catalog__name">{item.name}</span>
                  <span className="exos-catalog__description">{item.description}</span>
                  <span className="exos-catalog__open" aria-hidden="true">
                    Open docs <span>→</span>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>
      ))}

      {!count && (
        <div className="exos-catalog__empty">
          <p>No components match “{query}”.</p>
          <button type="button" onClick={() => { setQuery(''); setFilter('All'); }}>
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};
