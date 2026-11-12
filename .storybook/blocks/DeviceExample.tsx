import React, { useEffect, useRef, useState } from 'react';
import { Source, Subheading, useOf } from '@storybook/addon-docs/blocks';
import './docs.css';
import './device-example.css';

type Device = 'mobile' | 'web';

/** Real device widths, matching the Exos viewports. */
const WIDTH: Record<Device, number> = { mobile: 375, web: 1312 };
/**
 * Narrowest width that still counts as web: 672px (md) for components, whose mobile rules stop
 * there; 1056px (lg) when the example's layout itself changes on web (a separate `webOf`).
 */
const WEB_MIN_COMPONENT = 672;
const WEB_MIN_LAYOUT = 1056;

/** A story rendered in a frame at a real device width (so mobile CSS really applies), scaled to fit. */
const DeviceFrame = ({ storyId, device, webMin, urlArgs }: { storyId: string; device: Device; webMin: number; urlArgs?: string }) => {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [height, setHeight] = useState(120);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Grow the frame to its content (same origin, so we can measure it).
  useEffect(() => {
    const iframe = frame.current;
    if (!iframe) return;
    let ro: ResizeObserver | undefined;
    const measure = () => {
      const root = iframe.contentDocument?.getElementById('storybook-root');
      if (!root) return;
      const update = () => setHeight(Math.max(80, Math.ceil(root.getBoundingClientRect().height)));
      update();
      ro?.disconnect();
      ro = new ResizeObserver(update);
      ro.observe(root);
    };
    iframe.addEventListener('load', measure);
    return () => {
      iframe.removeEventListener('load', measure);
      ro?.disconnect();
    };
  }, [storyId, device, urlArgs]);

  // Mobile is always a true 375px. Web fills the panel (it only needs to be at least `webMin`
  // wide for the web rules to apply), so examples are shrunk as little as possible.
  const available = stageWidth ? stageWidth - 32 : WIDTH[device];
  const width = device === 'mobile' ? WIDTH.mobile : Math.min(WIDTH.web, Math.max(webMin, available));
  const scale = Math.min(1, available / width);

  return (
    <div ref={stage} className={`exos-device__stage exos-device__stage--${device}`}>
      <div className="exos-device__frame" style={{ width: width * scale, height: height * scale }}>
        <iframe
          key={`${storyId}-${device}-${urlArgs ?? ''}`}
          ref={frame}
          title={`${device} preview`}
          loading="lazy"
          src={`iframe.html?id=${storyId}&viewMode=story${urlArgs ? `&args=${urlArgs}` : ''}`}
          style={{ width, height, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
};

const MobileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="3.5" y="1" width="7" height="12" rx="1.5" />
    <path d="M6 11h2" strokeLinecap="round" />
  </svg>
);

const WebIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="1" y="2" width="12" height="8" rx="1.2" />
    <path d="M5 12.5h4M7 10v2.5" strokeLinecap="round" />
  </svg>
);

type StoryLike = {
  id: string;
  initialArgs?: Record<string, unknown>;
  parameters?: { docs?: { source?: { originalSource?: string; transform?: (code: string, ctx: unknown) => string } } };
};

/** The full example component for a story, from the same generator as "Show code" elsewhere. */
const fullCode = (story: StoryLike, args: Record<string, unknown> = {}): string => {
  const source = story.parameters?.docs?.source;
  const original = source?.originalSource ?? '';
  const allArgs = { ...(story.initialArgs ?? {}), ...args };
  return source?.transform ? source.transform(original, { args: allArgs, parameters: story.parameters }) : original;
};

/** Splits `template: \`...\`` out into its own HTML file and points the component at it with templateUrl. */
const splitFiles = (code: string): { html: string; ts: string } => {
  const match = /\n  template: `\n([\s\S]*?)\n  `,\n/.exec(code);
  if (!match) return { html: '', ts: code };
  const html = match[1]
    .split('\n')
    .map((line) => line.replace(/^ {4}/, ''))
    .join('\n');
  const ts = code.replace(match[0], "\n  templateUrl: './example.component.html',\n");
  return { html, ts };
};

type CodeFile = 'html' | 'ts';
const FILE_NAME: Record<CodeFile, string> = { html: 'example.component.html', ts: 'example.component.ts' };

type CanvasProps = {
  /** Story to show. */
  of: unknown;
  /** A different story (and code) for web, when the layout itself changes between devices. */
  webOf?: unknown;
  /** Which device shows first. */
  defaultDevice?: Device;
  /** Open the code panel straight away. */
  codeOpen?: boolean;
  /** Adds a Small / Medium / Large switch to the toolbar; the preview and code follow it. */
  sizeSwitch?: boolean;
  /** Any other toolbar switches, e.g. a colour switch. The preview and code follow each. */
  switches?: ArgSwitch[];
  /** A visual reference only: no code panel or copy button. */
  noCode?: boolean;
};

/** A toolbar switch that sets one story arg. `short` is shown when the canvas is narrow. */
export type ArgSwitch = { arg: string; label: string; options: { value: string; label: string; short?: string }[]; initial: string };

const SIZE_SWITCH: ArgSwitch = {
  arg: 'size',
  label: 'Size',
  initial: 'md',
  options: [
    { value: 'sm', label: 'Small', short: 'S' },
    { value: 'md', label: 'Medium', short: 'M' },
    { value: 'lg', label: 'Large', short: 'L' },
  ],
};

/**
 * A canvas like Storybook's, with a Mobile / Web switch in its action bar.
 * The preview renders at 375px or 1312px; with `webOf` the code switches too.
 */
export const DeviceCanvas = ({ of, webOf, defaultDevice = 'web', codeOpen = false, sizeSwitch = false, switches = [], noCode = false }: CanvasProps) => {
  const [device, setDevice] = useState<Device>(defaultDevice);
  const allSwitches = [...switches, ...(sizeSwitch ? [SIZE_SWITCH] : [])];
  const [picked, setPicked] = useState<Record<string, string>>(() => Object.fromEntries(allSwitches.map((sw) => [sw.arg, sw.initial])));
  const [showCode, setShowCode] = useState(codeOpen);
  const [file, setFile] = useState<CodeFile>('html');
  const [copied, setCopied] = useState(false);

  const mobileStory = useOf(of as never, ['story']).story as unknown as StoryLike;
  const webStory = useOf((webOf ?? of) as never, ['story']).story as unknown as StoryLike;
  const current = device === 'web' ? webStory : mobileStory;
  const files = splitFiles(fullCode(current, picked));
  const urlArgs = Object.entries(picked).map(([k, v]) => `${k}:${v}`).join(';') || undefined;

  const copy = async () => {
    await navigator.clipboard.writeText(files[file].trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="exos-device">
      <DeviceFrame
        storyId={current.id}
        device={device}
        webMin={webOf ? WEB_MIN_LAYOUT : WEB_MIN_COMPONENT}
        urlArgs={urlArgs}
      />

      <div className="exos-device__bar">
        {noCode ? (
          <span className="exos-device__ref">Visual reference</span>
        ) : (
        <div className="exos-device__actions">
          <button type="button" onClick={() => setShowCode((s) => !s)} aria-expanded={showCode} title={showCode ? 'Hide code' : 'Show code'} aria-label={showCode ? 'Hide code' : 'Show code'}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
              <path d="M8.98 1.63a.5.5 0 00-.96-.26l-3 11a.5.5 0 10.96.26l3-11zM3.32 3.62a.5.5 0 01.06.7L1.15 7l2.23 2.68a.5.5 0 11-.77.64l-2.5-3a.5.5 0 010-.64l2.5-3a.5.5 0 01.71-.06zM10.68 3.62a.5.5 0 00-.06.7L12.85 7l-2.23 2.68a.5.5 0 00.77.64l2.5-3a.5.5 0 000-.64l-2.5-3a.5.5 0 00-.71-.06z" />
            </svg>
            <span className="exos-device__label">{showCode ? 'Hide code' : 'Show code'}</span>
          </button>
          <button type="button" onClick={copy} title={`Copy ${file === 'html' ? 'HTML' : 'TypeScript'}`} aria-label={copied ? 'Copied' : `Copy ${file === 'html' ? 'HTML' : 'TypeScript'}`}>
            <svg width="14" height="14" viewBox="0 0 14 15" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M11.75.07A.5.5 0 0011.5 0h-6a.5.5 0 00-.5.5V3H.5a.5.5 0 00-.5.5v10a.5.5 0 00.5.5h8a.5.5 0 00.5-.5V11h4.5a.5.5 0 00.5-.5v-8a.5.5 0 00-.15-.36L11.86.15a.5.5 0 00-.11-.08zM9 10h4V3h-1.5a.5.5 0 01-.5-.5V1H6v2h.5a.5.5 0 01.36.15l1.99 2a.5.5 0 01.15.35V10zM1 4v9h7V6H6.5a.5.5 0 01-.5-.5V4H1z" />
            </svg>
            <span className="exos-device__label">{copied ? 'Copied' : `Copy ${file === 'html' ? 'HTML' : 'TypeScript'}`}</span>
          </button>
        </div>
        )}

        <div className="exos-device__switches">
        {allSwitches.map((sw) => (
          <div key={sw.arg} className="exos-device__switch" role="radiogroup" aria-label={sw.label}>
            {sw.options.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={picked[sw.arg] === o.value}
                aria-label={o.label}
                title={o.label}
                className={picked[sw.arg] === o.value ? 'is-active' : ''}
                onClick={() => setPicked((p) => ({ ...p, [sw.arg]: o.value }))}
              >
                <span className="exos-device__label">{o.label}</span>
                <span className="exos-device__short" aria-hidden="true">{o.short ?? o.label}</span>
              </button>
            ))}
          </div>
        ))}
        <div className="exos-device__switch" role="radiogroup" aria-label="Preview width">
          {(['mobile', 'web'] as Device[]).map((d) => (
            <button key={d} type="button" role="radio" aria-checked={device === d} aria-label={d === 'mobile' ? 'Mobile' : 'Web'} title={d === 'mobile' ? 'Mobile (375px)' : 'Web'} className={device === d ? 'is-active' : ''} onClick={() => setDevice(d)}>
              {d === 'mobile' ? <MobileIcon /> : <WebIcon />}
              <span className="exos-device__label">{d === 'mobile' ? 'Mobile' : 'Web'}</span>
            </button>
          ))}
        </div>
        </div>
      </div>

      {showCode && !noCode && (
        <div className="exos-device__code">
          <div className="exos-device__files" role="tablist" aria-label="Code file">
            {(['html', 'ts'] as CodeFile[]).map((f) => (
              <button key={f} type="button" role="tab" aria-selected={file === f} className={file === f ? 'is-active' : ''} onClick={() => setFile(f)}>
                <span className={`exos-device__file-dot exos-device__file-dot--${f}`} aria-hidden="true" />
                {FILE_NAME[f]}
              </button>
            ))}
          </div>
          <Source code={files[file]} language={file === 'html' ? 'html' : 'typescript'} />
        </div>
      )}
    </div>
  );
};

/** A Variations row (guidance left, example right) whose example has the Mobile / Web switch. */
export const DeviceVariation = ({
  title,
  of,
  webOf,
  sizeSwitch,
  switches,
  noCode,
  children,
}: {
  title: string;
  of: unknown;
  webOf?: unknown;
  sizeSwitch?: boolean;
  switches?: ArgSwitch[];
  noCode?: boolean;
  children?: React.ReactNode;
}) => (
  <section className="exos-docs-variation">
    <div className="exos-docs-variation__text">
      <Subheading>{title}</Subheading>
      {children}
    </div>
    <div className="exos-docs-variation__example">
      <DeviceCanvas of={of} webOf={webOf} sizeSwitch={sizeSwitch} switches={switches} noCode={noCode} />
    </div>
  </section>
);

// ─── Spec pictures ──────────────────────────────────────────────────────────
// Specs don't change between visits, so the docs show saved pictures instead of starting a live
// copy of the component every time. `npm run specs` makes them from the real components (with
// Storybook running); a test fails if a picture no longer matches the code.

/** Settings a spec drawing story declares: `parameters.specs`. */
export type SpecConfig = { sizes?: boolean; switches?: ArgSwitch[] };
type SpecEntry = { w: number; h: number; labels: string[] };
type SpecManifest = Record<string, SpecEntry>;

let manifestPromise: Promise<SpecManifest> | null = null;
const loadManifest = () =>
  (manifestPromise ??= fetch('specs/manifest.json')
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}))) as Promise<SpecManifest>;

/** The picture's name for these settings. Must match scripts/spec-pictures.mjs. */
export const specKey = (storyId: string, device: Device, args: Record<string, string>): string => {
  const parts = Object.keys(args)
    .sort()
    .map((k) => `${k}-${args[k]}`);
  return `${storyId}/${device}--${parts.length ? parts.join('_') : 'default'}`;
};

/** The spec drawing as a saved picture, with the same switches as a live canvas. Switching is instant. */
export const SpecPictures = ({ of, defaultDevice = 'web' }: { of: unknown; defaultDevice?: Device }) => {
  const story = useOf(of as never, ['story']).story as unknown as StoryLike & { parameters?: { specs?: SpecConfig } };
  const config = story.parameters?.specs ?? {};
  const allSwitches = [...(config.switches ?? []), ...(config.sizes ? [SIZE_SWITCH] : [])];
  const [device, setDevice] = useState<Device>(defaultDevice);
  const [picked, setPicked] = useState<Record<string, string>>(() => Object.fromEntries(allSwitches.map((sw) => [sw.arg, sw.initial])));
  const [manifest, setManifest] = useState<SpecManifest | null>(null);
  useEffect(() => {
    loadManifest().then(setManifest);
  }, []);

  const key = specKey(story.id, device, picked);
  const entry = manifest?.[key];

  return (
    <div className="exos-device exos-device--pictures">
      <div className={`exos-device__stage exos-device__stage--${device}`}>
        {entry ? (
          <img
            className="exos-device__picture"
            src={`specs/${key}.png`}
            width={entry.w}
            height={entry.h}
            alt={`Measurements: ${entry.labels.join(', ')}.`}
          />
        ) : (
          <p className="exos-device__missing">
            {manifest ? 'This picture hasn’t been made yet. With Storybook running, run npm run specs.' : 'Loading…'}
          </p>
        )}
      </div>
      <div className="exos-device__bar">
        <span className="exos-device__ref">Measured from the code</span>
        <div className="exos-device__switches">
          {allSwitches.map((sw) => (
            <div key={sw.arg} className="exos-device__switch" role="radiogroup" aria-label={sw.label}>
              {sw.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={picked[sw.arg] === o.value}
                  aria-label={o.label}
                  title={o.label}
                  className={picked[sw.arg] === o.value ? 'is-active' : ''}
                  onClick={() => setPicked((p) => ({ ...p, [sw.arg]: o.value }))}
                >
                  <span className="exos-device__label">{o.label}</span>
                  <span className="exos-device__short" aria-hidden="true">{o.short ?? o.label}</span>
                </button>
              ))}
            </div>
          ))}
          <div className="exos-device__switch" role="radiogroup" aria-label="Preview width">
            {(['mobile', 'web'] as Device[]).map((d) => (
              <button key={d} type="button" role="radio" aria-checked={device === d} aria-label={d === 'mobile' ? 'Mobile' : 'Web'} title={d === 'mobile' ? 'Mobile (375px)' : 'Web'} className={device === d ? 'is-active' : ''} onClick={() => setDevice(d)}>
                {d === 'mobile' ? <MobileIcon /> : <WebIcon />}
                <span className="exos-device__label">{d === 'mobile' ? 'Mobile' : 'Web'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
