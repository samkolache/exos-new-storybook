#!/usr/bin/env node
// Makes the pictures shown in each component's Specs section, from the real components.
//
//   npm run storybook   (in one terminal)
//   npm run specs       (in another)
//
// For every story named "Spec drawing", every combination of its switches (parameters.specs)
// and both devices, it opens the story, waits for the measurements, crops to the drawing and
// saves public/specs/<story>/<device>--<switches>.png. It also writes public/specs/manifest.json
// with each picture's size and its labels; a test compares those labels with the live code.
//
// Options: --url http://localhost:6006 · --only <part of a story id>

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'specs');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const BASE = arg('url', 'http://localhost:6006');
const ONLY = arg('only', '');

/** Same widths the docs use: a phone, and a web panel. */
const DEVICES = { mobile: 375, web: 1100 };
const SIZES = { arg: 'size', options: [{ value: 'sm' }, { value: 'md' }, { value: 'lg' }] };

/** The picture's name. Must match specKey() in .storybook/blocks/DeviceExample.tsx. */
const keyOf = (storyId, device, args) => {
  const parts = Object.keys(args).sort().map((k) => `${k}-${args[k]}`);
  return `${storyId}/${device}--${parts.length ? parts.join('_') : 'default'}`;
};

/** Every combination of the switches: [{ size: 'sm', note: 'help' }, …]. */
const combos = (switches) =>
  switches.reduce((all, sw) => all.flatMap((c) => sw.options.map((o) => ({ ...c, [sw.arg]: o.value }))), [{}]);

const index = await fetch(`${BASE}/index.json`).then((r) => {
  if (!r.ok) throw new Error(`Storybook isn't running at ${BASE} (start it with npm run storybook).`);
  return r.json();
});
const stories = Object.values(index.entries)
  .filter((e) => e.type === 'story' && e.id.endsWith('--spec-drawing') && e.id.includes(ONLY))
  .map((e) => e.id);

const browser = await chromium.launch();
const manifest = {};

/** Reads parameters.specs for a story from the preview. */
async function configOf(page, id) {
  await page.goto(`${BASE}/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'domcontentloaded' });
  return page.evaluate(async (storyId) => {
    const preview = window.__STORYBOOK_PREVIEW__;
    await preview.storeInitializationPromise;
    const story = await preview.storyStoreValue.loadStory({ storyId });
    return story.parameters.specs ?? {};
  }, id);
}

/** Opens one combination, waits until the labels stop changing, and saves the cropped picture. */
async function shoot(page, id, device, args) {
  await page.setViewportSize({ width: DEVICES[device], height: 900 });
  const argString = Object.entries(args).map(([k, v]) => `${k}:${v}`).join(';');
  await page.goto(`${BASE}/iframe.html?id=${id}&viewMode=story${argString ? `&args=${argString}` : ''}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.exos-redline__marker', { timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  let last = '';
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(250);
    const now = await page.$$eval('.exos-redline__marker', (els) => els.map((e) => `${e.textContent.trim()}@${Math.round(e.getBoundingClientRect().left)}`).join('|'));
    if (now === last) break;
    last = now;
  }
  // Crop to the example, its labels and its lines, with a little room around.
  const box = await page.evaluate(() => {
    const parts = [
      document.querySelector('.exos-redline__content'),
      ...document.querySelectorAll('.exos-redline__marker, .exos-redline__svg line, .exos-redline__svg rect, .exos-redline__svg path'),
    ];
    const rects = parts.filter(Boolean).map((e) => e.getBoundingClientRect()).filter((r) => r.width || r.height);
    const pad = 16;
    const l = Math.max(0, Math.floor(Math.min(...rects.map((r) => r.left)) - pad));
    const t = Math.max(0, Math.floor(Math.min(...rects.map((r) => r.top)) - pad));
    const r = Math.min(document.documentElement.clientWidth, Math.ceil(Math.max(...rects.map((x) => x.right)) + pad));
    const b = Math.ceil(Math.max(...rects.map((x) => x.bottom)) + pad);
    return { x: l, y: t, width: r - l, height: b - t };
  });
  const labels = await page.$$eval('.exos-redline__marker', (els) => els.map((e) => e.textContent.trim()));
  const key = keyOf(id, device, args);
  const file = join(OUT, `${key}.png`);
  await mkdir(dirname(file), { recursive: true });
  await page.screenshot({ path: file, clip: box });
  manifest[key] = { w: box.width, h: box.height, labels };
  return key;
}

try {
  if (!ONLY) await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const setup = await browser.newPage();
  const jobs = [];
  for (const id of stories) {
    const config = await configOf(setup, id);
    const switches = [...(config.switches ?? []), ...(config.sizes ? [SIZES] : [])];
    for (const args of combos(switches)) for (const device of Object.keys(DEVICES)) jobs.push({ id, device, args });
  }
  await setup.close();

  // A few pages at once; each picture at 2x for sharp text.
  const pages = await Promise.all(Array.from({ length: 4 }, () => browser.newPage({ deviceScaleFactor: 2 })));
  let done = 0;
  await Promise.all(
    pages.map(async (page) => {
      while (jobs.length) {
        const job = jobs.shift();
        const key = await shoot(page, job.id, job.device, job.args);
        done++;
        process.stdout.write(`\r${done} pictures… ${key.padEnd(70)}`);
      }
    }),
  );

  // Merge with the existing manifest when only some stories were redone.
  let previous = {};
  if (ONLY) {
    try {
      previous = JSON.parse(await (await import('node:fs/promises')).readFile(join(OUT, 'manifest.json'), 'utf8'));
    } catch {}
  }
  const merged = { ...previous, ...manifest };
  const sorted = Object.fromEntries(Object.keys(merged).sort().map((k) => [k, merged[k]]));
  await writeFile(join(OUT, 'manifest.json'), `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`\nSaved ${Object.keys(manifest).length} pictures for ${stories.length} components in public/specs.`);
} finally {
  await browser.close();
}
