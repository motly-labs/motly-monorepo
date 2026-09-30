import { parseColor } from './color.js';
import { pathProblem, toEase } from './easing.js';
import type { ChildSpec, HeldParameter } from './spec.js';
import { ANGLE, LENGTH, TIME, toNumber, UNITLESS, type Units } from './units.js';

/** Throws if `value`, found at `path` in the Spec, is not what that place takes. */
type Check = (value: unknown, path: string) => void;

function show(value: unknown): string {
  return typeof value === 'string' ? `'${value}'` : (JSON.stringify(value) ?? String(value));
}

function fail(path: string, value: unknown, hint: string): never {
  throw new Error(`motly: ${path} cannot be ${show(value)}. ${hint}`);
}

function isTagged(value: unknown, tag: string): value is Record<string, unknown> {
  return (
    typeof value === 'object' && value !== null && (value as { __motly?: unknown }).__motly === tag
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** `check`, also accepting an `each()` of values it accepts. Every value is checked, picked or not. */
function distributable(check: Check): Check {
  return (value, path) => {
    if (!isTagged(value, 'each')) return check(value, path);
    const values = value.values;
    if (!Array.isArray(values) || values.length === 0) {
      fail(path, value, 'each() needs at least one value.');
    }
    for (const [i, item] of values.entries()) {
      if (isTagged(item, 'each')) fail(`${path}.each[${i}]`, item, 'each() cannot nest.');
      check(item, `${path}.each[${i}]`);
    }
  };
}

/** `check`, also accepting Keyframes of values `frame` accepts. */
function keyframes(check: Check, frame: Check = check): Check {
  return (value, path) => {
    if (!Array.isArray(value)) return check(value, path);
    if (value.length === 0) fail(path, value, 'Keyframes need at least one value.');
    for (const [i, item] of value.entries()) {
      if (Array.isArray(item)) fail(`${path}[${i}]`, item, 'Keyframes cannot nest.');
      frame(item, `${path}[${i}]`);
    }
  };
}

/** One number: a finite number, a string in one of `units`, or a `rand()` of two numbers. */
function numberIn(units: Units): Check {
  return (value, path) => {
    if (typeof value === 'number' && Number.isFinite(value)) return;
    if (typeof value === 'string' && toNumber(value, units) !== undefined) return;
    if (isTagged(value, 'rand')) {
      if (Number.isFinite(value.min) && Number.isFinite(value.max)) return;
      fail(path, value, 'A rand() needs two numbers, min and max.');
    }
    if (isPlainObject(value) && !('__motly' in value)) {
      fail(path, value, 'Keyframes are an array.');
    }
    const allowed = Object.keys(units);
    const unitHint = allowed.length === 0 ? '' : `, a string in ${allowed.join(', ')}`;
    fail(path, value, `Use a number${unitHint}, or rand().`);
  };
}

const numeric = (units: Units) => distributable(keyframes(numberIn(units)));

/** A length of time, 0 or more, called `what` in error messages. */
function time(what: string): Check {
  return (value, path) => {
    if (Array.isArray(value)) fail(path, value, `A ${what} is one value, not Keyframes.`);
    numberIn(TIME)(value, path);
    const lowest =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? (toNumber(value, TIME) as number)
          : Math.min((value as { min: number }).min, (value as { max: number }).max);
    if (lowest < 0) fail(path, value, `A ${what} cannot be negative.`);
  };
}

const duration = distributable(time('duration'));
const delay = distributable(time('delay'));

// Colors a Renderer can paint but core cannot interpolate: fine as a constant, not as a Keyframe.
const PAINT_ONLY = /^(none|currentcolor|[a-z-]+\(.*\))$/i;

function colorString(value: unknown, path: string): asserts value is string {
  if (isPlainObject(value)) fail(path, value, 'Keyframes are an array.');
  if (typeof value !== 'string') fail(path, value, 'Use a CSS color.');
}

const color = distributable(
  keyframes(
    (value, path) => {
      colorString(value, path);
      if (PAINT_ONLY.test(value) || parseColor(value) !== undefined) return;
      fail(path, value, 'Use a CSS color.');
    },
    (value, path) => {
      colorString(value, path);
      if (parseColor(value) !== undefined) return;
      fail(path, value, 'A Keyframe color must be named, hex, rgb() or rgba(), to interpolate.');
    },
  ),
);

const curve: Check = (value, path) => {
  if (typeof value === 'string' && value.startsWith('M')) {
    const problem = pathProblem(value);
    if (problem !== undefined) fail(path, value, problem);
    return;
  }
  if (toEase(value) !== undefined) return;
  fail(
    path,
    value,
    'Use a CSS easing keyword, four cubic-bezier numbers with both x in 0–1, an SVG path ' +
      'starting with M, or an imported named curve.',
  );
};

/** An `easing`: one Curve, or a map from the names in `properties`, or `default`, to Curves. */
function easing(properties: readonly string[]): Check {
  return distributable((value, path) => {
    if (!isPlainObject(value)) return curve(value, path);
    for (const [name, item] of Object.entries(value)) {
      if (name !== 'default' && !properties.includes(name)) {
        throw new Error(`motly: ${path}.${name} names no property this Spec animates.`);
      }
      curve(item, `${path}.${name}`);
    }
  });
}

const staggerTime = time('stagger');

/** A `stagger`: a time, or `each` as a time with an optional `easing` Curve. */
const stagger: Check = (value, path) => {
  if (!isPlainObject(value) || '__motly' in value) return staggerTime(value, path);
  for (const name of Object.keys(value)) {
    if (name !== 'each' && name !== 'easing') {
      throw new Error(`motly: ${path}.${name} is not a field of a stagger. Use each and easing.`);
    }
  }
  if (value.each === undefined) {
    throw new Error(`motly: ${path}.each is missing. A stagger needs the time between starts.`);
  }
  staggerTime(value.each, `${path}.each`);
  if (value.easing !== undefined) curve(value.easing, `${path}.easing`);
};

const restAt: Check = (value, path) => {
  if (typeof value !== 'number' || !(value >= 0 && value <= 1)) {
    fail(path, value, 'Use a progress from 0 to 1.');
  }
};

/** A whole number, `min` or more. */
function wholeFrom(min: number): Check {
  return (value, path) => {
    if (!Number.isInteger(value) || (value as number) < min) {
      fail(path, value, `Use a whole number, ${min} or more.`);
    }
  };
}

/** One angle, held for a Burst's life: `what` names it in error messages. */
function oneAngle(what: string): Check {
  return (value, path) => {
    if (Array.isArray(value)) fail(path, value, `A ${what} is one value, not Keyframes.`);
    numberIn(ANGLE)(value, path);
  };
}

/** A Burst's arc: one angle from 0 to 360 degrees, a `rand()` included at both ends. */
const spread = distributable((value, path) => {
  oneAngle('spread')(value, path);
  const ends =
    typeof value === 'number'
      ? [value]
      : typeof value === 'string'
        ? [toNumber(value, ANGLE) as number]
        : [(value as { min: number }).min, (value as { max: number }).max];
  if (ends.some((end) => end < 0 || end > 360)) {
    fail(path, value, 'Use an angle from 0 to 360 degrees.');
  }
});

const orient: Check = (value, path) => {
  if (typeof value !== 'boolean') fail(path, value, 'Use true or false.');
};

const direction = distributable((value, path) => {
  if (value !== 1 && value !== -1)
    fail(path, value, 'Use 1 for clockwise or -1 for counterclockwise.');
});

// An SVG path's commands and numbers, starting with a move. Whether it draws well is the author's
// to judge, as in an SVG file.
const SVG_PATH = /^\s*M[\s\d.,eE+\-MZLHVCSQTA]*$/i;

const svgPath = distributable((value, path) => {
  if (typeof value !== 'string' || !SVG_PATH.test(value)) {
    fail(path, value, 'Use an SVG path starting with M.');
  }
});

/**
 * The fields of a Shape: `radius`, which every kind has; its kind's own `animated` and `held`
 * parameters; those every kind shares; and an `easing` keyed by every animated one.
 */
function shapeFields<
  A extends Record<string, Check> & { [F in HeldParameter]?: never },
  H extends { [F in HeldParameter]?: Check } = Record<never, Check>,
>(animated: A, held = {} as H) {
  const properties = {
    radius: numeric(LENGTH),
    ...animated,
    angle: numeric(ANGLE),
    scale: numeric(UNITLESS),
    opacity: numeric(UNITLESS),
    fill: color,
    stroke: color,
    strokeWidth: numeric(LENGTH),
  };
  return {
    ...properties,
    ...held,
    duration,
    delay,
    restAt,
    easing: easing(Object.keys(properties)),
  };
}

type Kind = ChildSpec['kind'];
type SpecOf<K extends Kind> = Extract<ChildSpec, { kind: K }>;
/** The fields a Spec of kind `K` takes: not its `kind`, nor the other kinds' fields it marks absent. */
type FieldOf<K extends Kind> = {
  [F in keyof SpecOf<K>]-?: F extends 'kind'
    ? never
    : [Exclude<SpecOf<K>[F], undefined>] extends [never]
      ? never
      : F;
}[keyof SpecOf<K>];
type RequiredField<S> = Exclude<
  { [F in keyof S]-?: object extends Pick<S, F> ? never : F }[keyof S],
  'kind'
>;

/**
 * The fields each kind of Spec takes, with what each one accepts. The compiler holds it to the
 * Spec types: a field missing here, or here and not there, fails to build.
 */
const FIELDS = {
  circle: shapeFields({}),
  polygon: shapeFields({}, { points: distributable(wholeFrom(3)) }),
  star: shapeFields({ innerRadius: numeric(UNITLESS) }, { points: distributable(wholeFrom(2)) }),
  cross: shapeFields({}),
  line: shapeFields({}),
  zigzag: shapeFields({ amplitude: numeric(LENGTH) }, { points: distributable(wholeFrom(2)) }),
  path: shapeFields({}, { d: svgPath }),
  burst: {
    count: wholeFrom(0),
    delay,
    restAt,
    stagger,
    radius: numeric(LENGTH),
    easing: easing(['radius']),
    angle: distributable(oneAngle('Burst angle')),
    spread,
    orient,
    children: distributable((value, path) => validate(value, path)),
  },
  swirl: {
    size: distributable(numberIn(ANGLE)),
    frequency: distributable(numberIn(UNITLESS)),
    direction,
    child: (value, path) => validate(value, path),
  },
} satisfies { [K in Kind]: { [F in FieldOf<K>]: Check } };

/** Every field FIELDS has and the Spec types do not, by kind: none, or the build fails below. */
type UnknownField = { [K in Kind]: Exclude<keyof (typeof FIELDS)[K], FieldOf<K>> }[Kind];
true satisfies [UnknownField] extends [never] ? true : UnknownField;

/** Why each field a kind cannot do without is needed, by kind. */
const REQUIRED: { readonly [K in Kind]?: Readonly<Record<string, string>> } = {
  polygon: { points: 'A polygon needs its number of corners.' },
  star: { points: 'A star needs its number of tips.' },
  zigzag: { points: 'A zigzag needs its number of corners.' },
  path: { d: 'A path needs the SVG path to draw.' },
  burst: { children: 'A Burst needs a Child to spawn.' },
  swirl: { child: 'A Swirl needs a Child to bend.' },
} satisfies {
  [K in Kind as RequiredField<SpecOf<K>> extends never ? never : K]: {
    [F in RequiredField<SpecOf<K>>]: string;
  };
};

const at = (path: string, name: string) => (path === '' ? name : `${path}.${name}`);

/**
 * Throws, naming the place, if `spec` is not a Spec: every field of every Spec in the tree is
 * checked, including `each()` values no Child picks and the Child of a Burst with no Children. A
 * Spec from JSON gets the same guarantees as one the compiler has checked.
 */
export function validate(spec: unknown, path = ''): void {
  if (!isPlainObject(spec)) fail(path || 'the Spec', spec, 'A Spec is an object with a kind.');
  const kind = spec.kind;
  const fields =
    typeof kind === 'string' && Object.hasOwn(FIELDS, kind)
      ? (FIELDS[kind as Kind] as Readonly<Record<string, Check>>)
      : undefined;
  if (fields === undefined) {
    fail(at(path, 'kind'), kind, `Use one of ${Object.keys(FIELDS).join(', ')}.`);
  }
  for (const [name, value] of Object.entries(spec)) {
    if (name === 'kind' || value === undefined) continue;
    const check = fields[name];
    if (check === undefined) {
      throw new Error(`motly: ${at(path, name)} is not a field of a ${kind}.`);
    }
    check(value, at(path, name));
  }
  for (const [name, why] of Object.entries(REQUIRED[kind as Kind] ?? {})) {
    if (spec[name] === undefined) throw new Error(`motly: ${at(path, name)} is missing. ${why}`);
  }
}
