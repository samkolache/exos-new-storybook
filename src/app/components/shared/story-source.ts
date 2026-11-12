/**
 * Storybook "Show code" for our components.
 *
 * `storySource()` prints every story as a complete, copy-paste-ready Angular component:
 * imports, @Component with the HTML template, and the data as typed class fields.
 * It is rebuilt from the story's current args, so changing a control updates the code.
 *
 * Example stories with their own template set `parameters.example` and pass the data the
 * template uses as args; the generator prints that template with that data as class fields.
 *
 * (`propsSource()` is the older template-only formatter, still used by the button stories.)
 */
import { FormControl, Validators } from '@angular/forms';

type Args = Record<string, unknown>;

interface SourceContext {
  args: Args;
  parameters?: { example?: boolean };
}

export interface SourceConfig {
  /** e.g. 'app-chip' */
  selector: string;
  /** e.g. 'ChipComponent' */
  component: string;
  /** Import path shown in the snippet, e.g. './components/chip/chip' */
  importPath: string;
  /** The component's input defaults: props equal to these are left out. */
  defaults: Args;
  /** Two-way inputs, printed as [(name)]="name". Can depend on the args. */
  models?: string[] | ((args: Args) => string[]);
  /** Field types by name, e.g. { options: 'ChipOption[]' }. Names ending in [] or a type are imported. */
  types?: Record<string, string>;
  /** Type for any other array of objects in example data, e.g. 'ChipOption[]'. */
  listType?: string;
  /** Outputs to wire to a handler: { itemSelected: { param: 'item: DropdownItem', body: "..." } } */
  handlers?: Record<string, { param: string; body: string }>;
}

const INDENT = '  ';

/** A JS/TS literal with single quotes, laid out for reading. */
function literal(value: unknown, depth = 0): string {
  const pad = INDENT.repeat(depth);
  if (value instanceof FormControl) {
    // The common validators are printed too, so the snippet behaves like the demo.
    const validators = (['required', 'requiredTrue', 'email'] as const).filter((v) => value.hasValidator(Validators[v]));
    const v = literal(value.value, depth);
    return validators.length
      ? `new FormControl(${v}, { nonNullable: true, validators: [${validators.map((n) => `Validators.${n}`).join(', ')}] })`
      : `new FormControl(${v})`;
  }
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (value === null || value === undefined || typeof value !== 'object') return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    const items = value.map((v) => literal(v, depth + 1));
    const oneLine = `[${items.join(', ')}]`;
    if (oneLine.length <= 60 && !value.some((v) => v && typeof v === 'object')) return oneLine;
    return `[\n${items.map((i) => `${pad}${INDENT}${i},`).join('\n')}\n${pad}]`;
  }
  const entries = Object.entries(value as Args)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${/^[a-zA-Z_$][\w$]*$/.test(k) ? k : `'${k}'`}: ${literal(v, depth + 1)}`);
  const oneLine = `{ ${entries.join(', ')} }`;
  if (oneLine.length <= 80) return oneLine;
  return `{\n${entries.map((e) => `${pad}${INDENT}${e},`).join('\n')}\n${pad}}`;
}

function attr(name: string, value: unknown): string {
  if (typeof value === 'string' && !value.includes('"')) return `${name}="${value}"`;
  return `[${name}]="${literal(value).replace(/"/g, '&quot;')}"`;
}

const isComplex = (v: unknown) => typeof v === 'object' && v !== null;
const typeNames = (t: string) => t.match(/[A-Z]\w*/g) ?? [];

/** Re-indents a template block to sit inside `template: \`...\``. */
function indentTemplate(template: string): string {
  const lines = template.replace(/^\n+|\s+$/g, '').split('\n');
  const minIndent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
  return lines.map((l) => (l.trim() ? `    ${l.slice(minIndent)}` : '')).join('\n');
}

function assemble(config: SourceConfig, template: string, fields: string[], methods: string[], extraTypes: Set<string>): string {
  const coreImports = ['Component'];
  const imports: string[] = [];
  const ngImports = [config.component];
  const usesForms = template.includes('formControl') || fields.some((f) => f.includes('new FormControl'));
  const usesJson = /\|\s*json/.test(template);
  if (usesJson) imports.push(`import { JsonPipe } from '@angular/common';`);
  imports.unshift(`import { ${coreImports.join(', ')} } from '@angular/core';`);
  if (usesForms) {
    const validators = fields.some((f) => f.includes('Validators.')) ? ', Validators' : '';
    imports.push(`import { FormControl, ReactiveFormsModule${validators} } from '@angular/forms';`);
    ngImports.push('ReactiveFormsModule');
  }
  if (usesJson) ngImports.push('JsonPipe');
  imports.push(`import { ${[config.component, ...[...extraTypes].sort()].join(', ')} } from '${config.importPath}';`);

  const body = [...fields, ...(fields.length && methods.length ? [''] : []), ...methods];
  return [
    ...imports,
    '',
    '@Component({',
    `  selector: 'app-example',`,
    `  imports: [${ngImports.join(', ')}],`,
    '  template: `',
    template,
    '  `,',
    '})',
    `export class ExampleComponent {${body.length ? `\n${body.map((l) => (l ? `  ${l}` : '')).join('\n')}\n` : ''}}`,
  ].join('\n');
}

function fieldFor(config: SourceConfig, name: string, value: unknown, extraTypes: Set<string>): string {
  const type =
    config.types?.[name] ??
    (Array.isArray(value) && value.some((v) => isComplex(v)) ? config.listType : undefined);
  if (type) typeNames(type).forEach((t) => extraTypes.add(t));
  return `${name}${type ? `: ${type}` : ''} = ${literal(value, 1)};`;
}

/** Story code panel: a full Angular component built from the story's current args. */
export function storySource(config: SourceConfig) {
  return (code: string, ctx: SourceContext): string => {
    const extraTypes = new Set<string>();
    const fields: string[] = [];
    const methods: string[] = [];

    // Example story with its own template (marked by parameters.example): print that
    // template, with the args it uses as fields. Depending on the story, `code` is the
    // story source (template inside it) or the template itself.
    const exampleTemplate = ctx.parameters?.example
      ? (/template:\s*`([\s\S]*?)`/.exec(code)?.[1] ?? code)
      : undefined;
    if (exampleTemplate) {
      const data = ctx.args ?? {};
      for (const [name, value] of Object.entries(data)) {
        if (typeof value === 'function') continue;
        // Only names bound in the template, e.g. [options]="area" → area.
        if (new RegExp(`="${name}"|\\b${name}\\.`).test(exampleTemplate)) fields.push(fieldFor(config, name, value, extraTypes));
      }
      return assemble(config, indentTemplate(exampleTemplate), fields, methods, extraTypes);
    }

    // Playground story: build the tag from the args.
    const args = ctx.args ?? {};
    const models = typeof config.models === 'function' ? config.models(args) : (config.models ?? []);
    const attrs: string[] = [];
    for (const [name, value] of Object.entries(args)) {
      if (typeof value === 'function' || value === undefined) continue;
      if (models.includes(name)) continue;
      if (JSON.stringify(value) === JSON.stringify(config.defaults[name])) continue;
      if (value === null) continue;
      if (isComplex(value)) {
        attrs.push(`[${name}]="${name}"`);
        fields.push(fieldFor(config, name, value, extraTypes));
      } else {
        attrs.push(attr(name, value));
      }
    }
    for (const name of models) {
      const value = name in args ? args[name] : config.defaults[name];
      attrs.push(`[(${name})]="${name}"`);
      fields.push(fieldFor(config, name, value ?? null, extraTypes));
    }
    for (const [output, { param, body }] of Object.entries(config.handlers ?? {})) {
      const method = `on${output[0].toUpperCase()}${output.slice(1)}`;
      attrs.push(`(${output})="${method}($event)"`);
      typeNames(param.split(':')[1] ?? '').forEach((t) => extraTypes.add(t));
      methods.push(`${method}(${param}): void {`, `  ${body}`, '}');
    }

    const oneLine = `<${config.selector}${attrs.length ? ` ${attrs.join(' ')}` : ''} />`;
    const tag =
      oneLine.length <= 80
        ? `    ${oneLine}`
        : `    <${config.selector}\n${attrs.map((a) => `      ${a}`).join('\n')}\n    />`;
    return assemble(config, tag, fields, methods, extraTypes);
  };
}

/** Older formatter: just the tag with changed props. Used by the button stories. */
export function propsSource(selector: string, defaults: Args) {
  return (code: string, ctx: SourceContext): string => {
    if (!code.includes('@Component')) return code;
    const props = Object.entries(ctx.args)
      .filter(([, value]) => typeof value !== 'function' && value !== undefined)
      .filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(defaults[key]))
      .map(([key, value]) =>
        typeof value === 'string' && !value.includes('"')
          ? `${key}="${value}"`
          : `[${key}]="${JSON.stringify(value).replaceAll('"', "'")}"`,
      );
    if (!props.length) return `<${selector} />`;
    const oneLine = `<${selector} ${props.join(' ')} />`;
    return oneLine.length <= 100 ? oneLine : `<${selector}\n  ${props.join('\n  ')}\n/>`;
  };
}
