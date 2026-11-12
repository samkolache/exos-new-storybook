/**
 * Test for spec drawings: the docs show saved pictures (made by `npm run specs`), so this checks
 * that the live drawing still has the same numbers as the saved one. If a style changed and the
 * pictures weren't remade, the test fails and says what to run.
 */
interface SpecSwitch {
  arg: string;
}
interface SpecContext {
  canvasElement: HTMLElement;
  id: string;
  args: Record<string, unknown>;
  parameters: { specs?: { sizes?: boolean; switches?: SpecSwitch[] } };
}

/** The picture's name. Must match specKey() in .storybook/blocks/DeviceExample.tsx. */
const keyOf = (storyId: string, device: string, args: Record<string, string>) => {
  const parts = Object.keys(args)
    .sort()
    .map((k) => `${k}-${args[k]}`);
  return `${storyId}/${device}--${parts.length ? parts.join('_') : 'default'}`;
};

export async function checkSpecPicture({ canvasElement, id, args, parameters }: SpecContext): Promise<void> {
  const doc = canvasElement.ownerDocument;
  // Wait for the measurements to settle.
  let labels: string[] = [];
  let last = '';
  for (let i = 0; i < 40; i++) {
    await new Promise((done) => setTimeout(done, 150));
    labels = [...doc.querySelectorAll('.exos-redline__marker')].map((e) => e.textContent!.trim());
    const now = labels.join('|');
    if (labels.length && now === last) break;
    last = now;
  }
  const manifest = await fetch('specs/manifest.json')
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  // No saved pictures where the tests run (or none made yet): nothing to compare.
  if (!manifest) return;
  const specs = parameters.specs ?? {};
  const names = [...(specs.switches ?? []).map((s) => s.arg), ...(specs.sizes ? ['size'] : [])];
  const picked = Object.fromEntries(names.map((n) => [n, String(args[n])]));
  const device = doc.defaultView!.innerWidth < 672 ? 'mobile' : 'web';
  const key = keyOf(id, device, picked);
  const saved = manifest[key]?.labels as string[] | undefined;
  if (!saved) throw new Error(`No saved spec picture for ${key}. With Storybook running, run: npm run specs`);
  const a = [...saved].sort().join(' | ');
  const b = [...labels].sort().join(' | ');
  if (a !== b) {
    throw new Error(`The spec picture for ${key} is out of date.\n  Saved: ${a}\n  Now:   ${b}\nWith Storybook running, run: npm run specs`);
  }
}
