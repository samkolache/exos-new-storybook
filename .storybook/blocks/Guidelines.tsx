import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Story } from '@storybook/addon-docs/blocks';
import './guidelines.css';

// ─── On this page ───────────────────────────────────────────────────────────

type NavItem = { id: string; text: string };

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * "On this page" navigation: a sticky list of the page's sections (h2) on the right, highlighting
 * the one being read. On narrow screens it sits at the top of the page instead.
 */
export const PageNav = () => {
  const [items, setItems] = useState<NavItem[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    document.body.classList.add('exos-has-pagenav');
    // Wait a frame so every section on the page has rendered.
    const raf = requestAnimationFrame(() => {
      const content = document.querySelector('.sbdocs-content');
      const nodes = [...(content?.querySelectorAll<HTMLElement>('h2') ?? [])].filter(
        (el) => !el.classList.contains('sbdocs-subtitle') && !el.closest('.sbdocs-subtitle') && el.textContent?.trim(),
      );
      const sections: NavItem[] = nodes.map((el) => {
        if (!el.id) el.id = slug(el.textContent ?? '');
        return { id: el.id, text: el.textContent!.trim() };
      });
      setItems(sections);
      const onScroll = () => {
        let current = sections[0]?.id ?? '';
        for (const h of sections) {
          const el = document.getElementById(h.id);
          if (el && el.getBoundingClientRect().top <= 140) current = h.id;
        }
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections.at(-1)?.id ?? current;
        setActive(current);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanup = () => window.removeEventListener('scroll', onScroll);
    });
    let cleanup = () => {};
    return () => {
      cancelAnimationFrame(raf);
      cleanup();
      document.body.classList.remove('exos-has-pagenav');
    };
  }, []);

  if (!items.length) return null;
  return (
    <nav className="exos-pagenav" aria-label="On this page">
      <p className="exos-pagenav__title">On this page</p>
      <ul>
        {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={active === item.id ? 'is-active' : ''}
                aria-current={active === item.id ? 'location' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setActive(item.id);
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
      </ul>
    </nav>
  );
};

// ─── Page header, section strips, half markers ─────────────────────────────

/** Status, Figma link, code tag and last update, under the title. */
export const ComponentMeta = ({ status, figma, code, updated }: { status: 'Stable' | 'Beta' | 'Draft'; figma?: string; code?: string; updated?: string }) => (
  <div className="exos-meta">
    <span className={`exos-meta__status exos-meta__status--${status.toLowerCase()}`}>{status}</span>
    {figma && (
      <a href={figma} target="_blank" rel="noreferrer">
        Figma ↗
      </a>
    )}
    {code && (
      <span>
        Code · <code>{code}</code>
      </span>
    )}
    {updated && <span>Updated · {updated}</span>}
  </div>
);

// ─── Do / Don't ─────────────────────────────────────────────────────────────

/** A grid of Do / Don't cards. */
export const DoDont = ({ children }: { children: React.ReactNode }) => <div className="exos-dodont">{children}</div>;

/** One card: a live example, a green ✓ or red ✕, and a one-line caption. */
export const Guideline = ({ type, of, children }: { type: 'do' | 'dont'; of: unknown; children: React.ReactNode }) => (
  <figure className={`exos-guideline exos-guideline--${type}`}>
    <div className="exos-guideline__preview">
      <span className="exos-guideline__badge" aria-hidden="true">
        {type === 'do' ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 6.2L4.8 8.5 9.5 3.6" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        )}
      </span>
      <div className="exos-guideline__stage" inert>
        <Story of={of as never} inline />
      </div>
    </div>
    <figcaption>
      <strong>{type === 'do' ? 'Do' : "Don't"}</strong> {children}
    </figcaption>
  </figure>
);

// ─── Specimens (edge cases) ─────────────────────────────────────────────────

export const SpecimenGrid = ({ children }: { children: React.ReactNode }) => <div className="exos-specimens">{children}</div>;

/** A live example with a one-line caption, in a dashed card. */
export const Specimen = ({ of, children }: { of: unknown; children: React.ReactNode }) => (
  <figure className="exos-specimen">
    <div className="exos-specimen__stage" inert>
      <Story of={of as never} inline />
    </div>
    <figcaption>{children}</figcaption>
  </figure>
);

// ─── Screen reader output ───────────────────────────────────────────────────

/** What assistive tech gets for one element: name, role, state and position, plus the group. */
export const ScreenReader = ({ name, role, state, position, group, description }: { name: string; role: string; state: string; position?: string; group?: string; description?: string }) => (
  <div className="exos-sr">
    <span className="exos-sr__icon" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 5.5h2.5L8 2.5v9L4.5 8.5H2z" />
        <path d="M10 4.5a3.5 3.5 0 010 5" />
      </svg>
    </span>
    <div>
      <q>{[name, role, state, position, group, description].filter(Boolean).join(', ')}</q>
      <div className="exos-sr__facts">
        {(
          [
            ['Name', name],
            ['Role', role],
            ['State', state],
            ['Position', position],
            ['Group', group],
            ['Description', description],
          ] as const
        )
          .filter(([, value]) => value)
          .map(([key, value]) => (
            <span key={key} className="exos-sr__fact">
              <span className="exos-sr__key">{key}</span>
              <span className="exos-sr__val">{value}</span>
            </span>
          ))}
      </div>
    </div>
  </div>
);

// ─── Related ────────────────────────────────────────────────────────────────

export const Related = ({ items }: { items: { title: string; text: string; href: string }[] }) => (
  <div className="exos-related">
    {items.map((item) => (
      <a key={item.title} href={item.href} target={/^https?:/.test(item.href) ? '_blank' : '_top'} rel="noreferrer">
        <b>{item.title}</b>
        <span>{item.text}</span>
      </a>
    ))}
  </div>
);

// ─── Specs and tokens, read live from the theme ─────────────────────────────

const px = (v: string) => `${Math.round(parseFloat(v) * 10) / 10}px`;

/** One extra part to measure inside a sample at each size, e.g. the icon or the remove button. */
export type SpecPart = {
  /** Row name, e.g. "Remove button". */
  label: string;
  /** What to measure inside the sample. */
  selector: string;
  /** Inner HTML of the sample. */
  html: string;
  /** Sample classes before the size class; defaults to the main `baseClass`. */
  baseClass?: string;
  element?: 'button' | 'span';
};

type SpecProps = {
  baseClass: string;
  sizes: { label: string; className: string }[];
  sample: string;
  groupClass?: string;
  /** The sample's element: chips are buttons, tags are spans, fields are inputs. */
  element?: 'button' | 'span' | 'input';
  labelClass?: string;
  /**
   * Also measure on a phone (375px wide), and show Web and Mobile side by side for each size,
   * with the values that change on mobile highlighted.
   */
  mobile?: boolean;
  /** Extra parts to measure (icon, checkbox, remove button…). Used with `mobile`. */
  parts?: SpecPart[];
};

const radiusText = (v: string) => (parseFloat(v) >= 999 ? 'Full' : px(v));
const boxText = (r: DOMRect) => {
  const w = Math.round(r.width * 10) / 10;
  const h = Math.round(r.height * 10) / 10;
  return w === h ? `${w}px` : `${w} × ${h}px`;
};

/** The table rows for one device, measured in `doc`. */
const measureRows = (doc: Document, props: SpecProps): string[][] => {
  const { element = 'button', parts = [] } = props;
  const win = doc.defaultView!;
  const els = [...doc.querySelectorAll<HTMLElement>('[data-sample]')];
  const cs = els.map((el) => win.getComputedStyle(el));
  // One value per row, each with its unit, so every cell reads on its own.
  const rows: string[][] = [
    ['Height', ...els.map((el) => px(String(el.getBoundingClientRect().height)))],
    ['Padding, top and bottom', ...cs.map((c) => px(c.paddingTop))],
    ['Padding, left and right', ...cs.map((c) => px(c.paddingRight))],
    ['Font size', ...cs.map((c) => px(c.fontSize))],
    ['Line height', ...cs.map((c) => px(c.lineHeight))],
    ['Font weight', ...cs.map((c) => c.fontWeight)],
    ['Border', ...cs.map((c) => px(c.borderTopWidth))],
    ['Corner radius', ...cs.map((c) => radiusText(c.borderTopLeftRadius))],
  ];
  if (element !== 'input') rows.push(['Gap between icon and text', ...cs.map((c) => px(c.columnGap))]);
  for (const part of parts) {
    rows.push([
      part.label,
      ...props.sizes.map((_, i) => {
        const el = doc.querySelector<HTMLElement>(`[data-part="${part.label}"][data-size="${i}"] ${part.selector}`);
        return el ? boxText(el.getBoundingClientRect()) : '—';
      }),
    ]);
  }
  // A tap area larger than the sample is drawn with ::after.
  rows.push([
    'Tap area height',
    ...els.map((el) => {
      const after = win.getComputedStyle(el, '::after');
      return after.content && after.content !== 'none' && after.position === 'absolute' ? px(after.height) : 'Same as height';
    }),
  ]);
  const group = doc.querySelector<HTMLElement>('[data-group]');
  if (group) {
    const g = win.getComputedStyle(group);
    rows.push(['Space between chips', ...els.map(() => px(g.columnGap))]);
  }
  return rows;
};

const escapeHtml = (v: string) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** The samples as HTML, so they can be put in a frame of any width. */
const samplesHtml = (props: SpecProps): string => {
  const { baseClass, sizes, sample, groupClass, element = 'button', labelClass = 'chip-label', parts = [] } = props;
  const cls = (base: string, size: string) => `${base} ${size}`.trim();
  const tag = (el: string, attrs: string, inner: string) =>
    el === 'input' ? `<input ${attrs} value="${escapeHtml(sample)}" readonly tabindex="-1">` : `<${el} ${attrs}${el === 'button' ? ' type="button" tabindex="-1"' : ''}>${inner}</${el}>`;
  const main = sizes.map((s) => tag(element, `data-sample class="${cls(baseClass, s.className)}"`, `<span class="${labelClass}">${escapeHtml(sample)}</span>`));
  const extra = parts.flatMap((part) =>
    sizes.map((s, i) => tag(part.element ?? (element === 'input' ? 'span' : element), `data-part="${part.label}" data-size="${i}" class="${cls(part.baseClass ?? baseClass, s.className)}"`, part.html)),
  );
  return `<div class="exos-theme-dcfc" style="display:flex;flex-wrap:wrap;align-items:flex-start;gap:24px;padding:16px">${[...main, ...extra].join('')}${groupClass ? `<div data-group class="${groupClass}"></div>` : ''}</div>`;
};

/** Renders the samples in a hidden frame `width` px wide (so its media queries apply) and measures them. */
const measureAt = (width: number, props: SpecProps): Promise<string[][]> =>
  new Promise((resolve) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    Object.assign(frame.style, { position: 'absolute', left: '-20000px', top: '0', width: `${width}px`, height: '600px', border: '0', visibility: 'hidden' });
    document.body.appendChild(frame);
    const doc = frame.contentDocument!;
    doc.open();
    doc.write('<!doctype html><html><head><meta name="viewport" content="width=device-width"></head><body></body></html>');
    doc.close();
    // Same theme as the docs page: copy its stylesheets in.
    const sheets = [...document.querySelectorAll<HTMLElement>('style, link[rel="stylesheet"]')].map((n) => n.cloneNode(true) as HTMLElement);
    const loaded = sheets
      .filter((n): n is HTMLLinkElement => n instanceof HTMLLinkElement || n.tagName === 'LINK')
      .map((l) => new Promise<void>((done) => { l.addEventListener('load', () => done()); l.addEventListener('error', () => done()); setTimeout(done, 2000); }));
    sheets.forEach((n) => doc.head.appendChild(n));
    doc.body.innerHTML = samplesHtml(props);
    Promise.all(loaded).then(() =>
      requestAnimationFrame(() => {
        const rows = measureRows(doc, props);
        frame.remove();
        resolve(rows);
      }),
    );
  });

/**
 * Measures the real component at each size from the theme CSS, so the numbers can't drift.
 * With `mobile`, it measures at phone and web widths and shows both.
 */
export const SizeSpecs = (props: SpecProps) => (props.mobile ? <DeviceSizeSpecs {...props} /> : <WebSizeSpecs {...props} />);

/** Web and Mobile, side by side for each size; values that change on mobile are highlighted. */
const DeviceSizeSpecs = (props: SpecProps) => {
  const [web, setWeb] = useState<string[][] | null>(null);
  const [mobile, setMobile] = useState<string[][] | null>(null);
  useEffect(() => {
    let live = true;
    measureAt(1312, props).then((r) => live && setWeb(r));
    measureAt(375, props).then((r) => live && setMobile(r));
    return () => {
      live = false;
    };
    // Measured once: the samples are fixed for a page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { sizes } = props;
  return (
    <div className="exos-specs exos-specs--devices">
      <table>
        <thead>
          <tr>
            <th rowSpan={2} />
            {sizes.map((s) => (
              <th key={s.label} colSpan={2} className="exos-specs__size">
                {s.label}
              </th>
            ))}
          </tr>
          <tr>
            {sizes.map((s) => (
              <React.Fragment key={s.label}>
                <th className="exos-specs__device">Web</th>
                <th className="exos-specs__device exos-specs__device--mobile">Mobile</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {(web ?? []).map(([name, ...webValues], r) => {
            const mobileValues = mobile?.[r]?.slice(1) ?? [];
            return (
              <tr key={name}>
                <td>{name}</td>
                {webValues.map((w, i) => {
                  const m = mobileValues[i] ?? '…';
                  return (
                    <React.Fragment key={i}>
                      <td className="exos-specs__web">{w}</td>
                      <td className={m !== w && m !== '…' ? 'exos-specs__mobile is-diff' : 'exos-specs__mobile'}>{m}</td>
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="exos-specs__note">
        <span className="exos-specs__swatch" aria-hidden="true" /> Highlighted: different on mobile (below 672px). Measured from the theme at 375px and web width, so it always matches the code.
      </p>
    </div>
  );
};

/**
 * Measures the real component at each size from the theme CSS, so the numbers can't drift.
 * Renders hidden samples like `<button class="chip chip-single chip-sm">`, then reads computed styles.
 */
const WebSizeSpecs = ({
  baseClass,
  sizes,
  sample,
  groupClass,
  element = 'button',
  labelClass = 'chip-label',
}: SpecProps) => {
  const host = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<string[][]>([]);
  useLayoutEffect(() => {
    const els = [...(host.current?.querySelectorAll<HTMLElement>('[data-sample]') ?? [])];
    const group = host.current?.querySelector<HTMLElement>('[data-group]');
    const cs = els.map((el) => getComputedStyle(el));
    const radius = (v: string) => (parseFloat(v) >= 999 ? 'Full' : px(v));
    const table = [
      ['Height', ...els.map((el) => px(String(el.getBoundingClientRect().height)))],
      ['Padding (top / side)', ...cs.map((c) => `${px(c.paddingTop)} / ${px(c.paddingRight)}`)],
      ['Text', ...cs.map((c) => `${px(c.fontSize)} / ${px(c.lineHeight)}, ${c.fontWeight}`)],
      ['Border', ...cs.map((c) => px(c.borderTopWidth))],
      ['Corner radius', ...cs.map((c) => radius(c.borderTopLeftRadius))],
    ];
    // Inputs have no icon gap: their icons sit in the padding.
    if (element !== 'input') table.push(['Gap (icon to text)', ...cs.map((c) => px(c.columnGap))]);
    if (group) {
      const g = getComputedStyle(group);
      table.push(['Gap between chips', ...els.map(() => px(g.columnGap))]);
    }
    setRows(table);
  }, []);
  return (
    <div className="exos-specs">
      <div ref={host} className="exos-theme-dcfc exos-specs__samples" aria-hidden="true">
        {sizes.map((s) =>
          element === 'input' ? (
            <input key={s.label} data-sample className={`${baseClass} ${s.className}`.trim()} defaultValue={sample} readOnly tabIndex={-1} />
          ) : React.createElement(
            element,
            { key: s.label, 'data-sample': true, className: `${baseClass} ${s.className}`.trim(), ...(element === 'button' ? { type: 'button', tabIndex: -1 } : {}) },
            <span className={labelClass}>{sample}</span>,
          ),
        )}
        {groupClass && <div data-group className={groupClass} />}
      </div>
      <table>
        <thead>
          <tr>
            <th />
            {sizes.map((s) => (
              <th key={s.label}>{s.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, ...values]) => (
            <tr key={name}>
              <td>{name}</td>
              {values.map((v, i) => (
                <td key={i}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** The CSS variables a component uses, with their live values (colour swatches where they are colours). */
export const TokenTable = ({ tokens }: { tokens: { name: string; use: string }[] }) => {
  const host = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    if (!host.current) return;
    const cs = getComputedStyle(host.current);
    setValues(Object.fromEntries(tokens.map((t) => [t.name, cs.getPropertyValue(t.name).trim()])));
    // Measured once: the token list is fixed for a page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const isColor = (v: string) => /^(#|rgb|hsl)/i.test(v);
  return (
    <div ref={host} className="exos-theme-dcfc exos-tokens">
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Value</th>
            <th>Used for</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.name}>
              <td>
                <code>{t.name}</code>
              </td>
              <td>
                {isColor(values[t.name] ?? '') && <span className="exos-tokens__swatch" style={{ background: values[t.name] }} />}
                <code>{values[t.name] || '—'}</code>
              </td>
              <td>{t.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

