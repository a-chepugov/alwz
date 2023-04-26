import Convertor from './Converter';

export const boolean = new Convertor<boolean>((i): i is boolean => typeof i === 'boolean', () => false);
boolean
	.undefined(boolean.fallback)
	.number(Boolean)
	.bigint(Boolean)
	.string(Boolean)
	.symbol((i) => boolean.convert(string.convert(i)))
	.register((i): i is null => i === null, boolean.fallback)
	.register((i): i is Date => i instanceof Date, (i: Date) => Boolean(i.getTime()))
	.register(Array.isArray, (i: Array<any>) => boolean.convert(i[0]))
	.register((i): i is any => true, Boolean)
;

export const number = new Convertor<number>((i): i is number => typeof i === 'number', () => NaN);
number
	.undefined(Number)
	.boolean(Number)
	.bigint(Number)
	.string(Number)
	.symbol((i) => Number(string.convert(i)))
	.register((i): i is null => i === null, Number)
	.register((i): i is Date => i instanceof Date, (i: Date) => i.getTime())
	.register(Array.isArray, (i: Array<any>) => number.convert(i[0]))
;

export const [
	byte,
	short,
	int,
	long
] = [
	[-128, 127],
	[-32768, 32767],
	[-2147483648, 2147483647],
	[
		Math.max(Number.MIN_SAFE_INTEGER, -(2 ** 63)),
		Math.min(Number.MAX_SAFE_INTEGER, (2 ** 63) - 1)
	],
	[0, 255],
	[0, 65535],
	[0, 4294967295],
	[
		0,
		Math.min(Number.MAX_SAFE_INTEGER, (2 ** 64) - 1)
	],
]
	.map(([min, max]) => {
		const convertor = new Convertor<number>(
			(i): i is number => typeof i === 'number' && Number.isInteger(i) && min <= i && i <= max,
			() => 0
		);
		convertor
			.undefined(convertor.fallback)
			.boolean(Number)
			.number((i) => {
				if (i <= min) {
					return min;
				} else if (i >= max) {
					return max;
				} else {
					const value = Math.trunc(i);
					if (Number.isInteger(value)) {
						return value;
					} else {
						return convertor.fallback();
					}
				}
			})
			.bigint((i) => convertor.convert(Number(i)))
			.string((i) => convertor.convert(Number(i)))
			.symbol((i) => convertor.convert(string.convert(i)))
			.register((i): i is null => i === null, convertor.fallback)
			.register((i): i is Date => i instanceof Date, (i: Date) => convertor.convert(i.getTime()))
			.register(Array.isArray, (i: Array<any>) => convertor.convert(i[0]));
		return convertor;
	})
;

export const string = new Convertor<string>((i): i is string => typeof i === 'string', () => '');
string
	.undefined(string.fallback)
	.boolean((i) => i ? ' ' : string.fallback())
	.number((i) => i === i ? String(i) : string.fallback())
	.bigint(String)
	.symbol((i) => Symbol.keyFor(i) || string.fallback())
	.register((i): i is null  => i === null, string.fallback)
	.register((i): i is Date => i instanceof Date, (i: Date) => {
		const value = i.getTime();
		return Number.isFinite(value) ? i.toISOString() : string.fallback();
	})
	.register(Array.isArray, (i: Array<any>) => string.convert(i[0]))
	.register((i): i is any => true, String)
;

export const symbol = new Convertor<symbol>((i): i is symbol => typeof i === 'symbol', () => Symbol.for(''));
symbol
	.register((i): i is any => true, (i) => Symbol.for(string.convert(i)))
;

export const array = new Convertor<Array<any>>(Array.isArray, () => []);
array
	.undefined(array.fallback)
	.boolean((i) => [i])
	.number((i) => [i])
	.bigint((i) => [i])
	.string((i) => [i])
	.symbol((i) => [i])
	.register((i): i is null => i === null, array.fallback)
	.register((i): i is Iterable<any> => typeof i === 'object' && i !== null && i[Symbol.iterator], Array.from)
	.register((i): i is any => true, (i) => [i])
;

// eslint-disable-next-line @typescript-eslint/ban-types
export const fn = new Convertor<Function>((i): i is Function => typeof i === 'function', () => new Function);
fn
	.register((i): i is any => true, (i) => () => i)
;

export const date = new Convertor<Date>((i): i is Date => i instanceof Date, () => new Date(NaN));
date
	.undefined(date.fallback)
	.boolean((i) => new Date(Number(i)))
	.number((i) => new Date(i))
	.bigint((i) => new Date(Number(i)))
	.string((i) => new Date(i))
	.symbol((i) => new Date(string.convert(i)))
	.register(Array.isArray, (i: Array<any>) => date.convert(i[0]))
;

export const map = new Convertor<Map<any, any>>((i): i is Map<any, any> => i instanceof Map, () => new Map());
map
	.register((i): i is Iterable<any> => typeof i === 'object' && i !== null && i[Symbol.iterator], (i: Iterable<any>) => {
		const result = new Map();
		for (const item of i) {
			if (item && item[Symbol.iterator]) {
				const [key, value] = item;
				result.set(key, value);
			}
		}
		return result;
	})
;

export const weakmap = new Convertor<WeakMap<any, any>>((i): i is WeakMap<any, any> => i instanceof WeakMap, () => new WeakMap());
weakmap
	.register((i): i is Iterable<any> => typeof i === 'object' && i !== null && i[Symbol.iterator], (i: Iterable<any>) => {
		const result = new WeakMap();
		for (const item of i) {
			if (item && item[Symbol.iterator]) {
				const [key, value] = item;
				if (typeof key === 'object') {
					result.set(key, value);
				}
			}
		}
		return result;
	})
;

export const set = new Convertor<Set<any>>((i): i is Set<any> => i instanceof Set, () => new Set());
set
	.undefined(set.fallback)
	.string((i) => {
		const result = new Set();
		result.add(i);
		return result;
	})
	.register((i): i is Iterable<any> => typeof i === 'object' && i !== null && i[Symbol.iterator], (i: Iterable<any>) => new Set(i))
	.register((i): i is NonNullable<any> => i !== null, (i) => {
		const result = new Set();
		result.add(i);
		return result;
	})
;

export const weakset = new Convertor<WeakSet<any>>((i): i is WeakSet<any> => i instanceof WeakSet, () => new WeakSet());
weakset
	.register((i): i is Iterable<any> => typeof i === 'object' && i !== null && i[Symbol.iterator], (i: Iterable<any>) => {
		const result = new WeakSet();
		for (const item of i) {
			if (typeof item === 'object') {
				result.add(item);
			}
		}
		return result;
	})
;

export const promise = new Convertor<Promise<any>>((i: any): i is Promise<any> => i instanceof Promise, () => Promise.resolve())
	.register((i): i is any => true, (i: any) => Promise.resolve(i))
;

