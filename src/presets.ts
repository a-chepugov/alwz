import Converter from './Converter';

const isNull = (i: any): i is null => i === null;
const isDate = (i: any): i is Date => i instanceof Date;
const isIterable = (i: any): i is Iterable<any> => typeof i === 'object' && i !== null && i[Symbol.iterator];

/**
 * @namespace presets
 */

/**
 * @memberof presets
 * @example
 * boolean.convert('abc'); // true
 * boolean.convert(Symbol.for('')); // false
 * boolean.convert([]); // false
 * boolean.convert([0]); // false
 * boolean.convert([false, true]); // false
 * boolean.convert([123]); // true
 */
export const boolean = new Converter<boolean>((i): i is boolean => typeof i === 'boolean', Boolean);
boolean
	.undefined(boolean.fallback)
	.number(Boolean)
	.bigint(Boolean)
	.string(Boolean)
	.symbol((i) => boolean.convert(string.convert(i)))
	.register(isNull, boolean.fallback)
	.register(isDate, (i) => Boolean(i.getTime()))
	.register(Array.isArray, (i) => boolean.convert(i[0]))
;

/**
 * @memberof presets
 * @example
 * number.convert(Infinity); // Infinity
 * number.convert('42'); // 42
 * number.convert('abc'); // NaN
 * number.convert(Symbol.for('42')); // 42
 * number.convert(new Date('1970-01-01T00:00:00.042Z')); // 42
 * number.convert(['42']); // 42
 * number.convert([ [ [ 42 ] ] ]); // 42
 * number.convert(new Date('1970-01-01T00:00:00.999Z')); // 999
 */
export const number = new Converter<number>((i): i is number => typeof i === 'number', Number);
number
	.undefined(Number)
	.boolean(Number)
	.bigint(Number)
	.string(Number)
	.symbol((i) => Number(string.convert(i)))
	.register(isDate, (i) => i.getTime())
	.register(Array.isArray, (i) => number.convert(i[0]))
;

/**
 * @memberof presets
 * @name integers
 * @description
 * ```
 * |--------|------------------|------------------|
 * | type   |              min |              max |
 * |--------|------------------|------------------|
 * | byte   |             -128 |              127 |
 * | short  |           -32768 |            32767 |
 * | int    |      -2147483648 |       2147483647 |
 * | long   | MIN_SAFE_INTEGER | MAX_SAFE_INTEGER |
 * |--------|------------------|------------------|
 * | ubyte  |                0 |              255 |
 * | ushort |                0 |            65535 |
 * | uint   |                0 |       4294967295 |
 * | ulong  |                0 | MAX_SAFE_INTEGER |
 * |--------|------------------|------------------|
 * ```
 * @example
 * int.convert(undefined); // 0
 * int.convert(null); // 0
 * int.convert(NaN); // 0
 * int.convert('abc'); // 0
 * int.convert(true); // 1
 * int.convert(42.5); // 42
 * int.convert('42.5'); // 42
 * int.convert(['42.5']); // 42
 * int.convert(Symbol.for('42.5')); // 42
 * int.convert(new Date('1970-01-01T00:00:00.042Z')); // 42
 * int.convert(new Date(NaN)); // 0
*/

/**
 * @memberof presets
 * @name signed
 * @description cast to byte, short (2 bytes), int (4 bytes) or long (8 bytes)
 * @example
 * byte.convert(128); // 127
 * byte.convert(Infinity); // 127
 * byte.convert(-Infinity); // -128
 * short.convert(Infinity); // 32767
 * short.convert(-Infinity); // -32768
 * int.convert(Infinity); // 2147483647
 * int.convert(-Infinity); // -2147483648
 * long.convert(Infinity); // MAX_SAFE_INTEGER
 * long.convert(-Infinity); // MIN_SAFE_INTEGER
 */

/**
 * @memberof presets
 * @name unsigned
 * @description cast to ubyte, ushort (2 bytes), uint (4 bytes) or ulong (8 bytes)
 * @example
 * ubyte.convert(-7); // 0
 * ubyte.convert('a'); // 0
 * ubyte.convert(Infinity); // 255
 * ubyte.convert(-Infinity); // 0
 * ushort.convert(Infinity); // 65535
 * ushort.convert(-Infinity); // 0
 * uint.convert(Infinity); // 4294967295
 * uint.convert(-Infinity); // 0
 * ulong.convert(Infinity); // MAX_SAFE_INTEGER
 * ulong.convert(-Infinity); // 0
 */
export const [
	byte,
	short,
	int,
	long,
	ubyte,
	ushort,
	uint,
	ulong,
] = [
	[-128, 127],
	[-32768, 32767],
	[-2147483648, 2147483647],
	[
		Math.max(Number.MIN_SAFE_INTEGER, -(2 ** 63)),
		Math.min(Number.MAX_SAFE_INTEGER, (2 ** 63) - 1),
	],
	[0, 255],
	[0, 65535],
	[0, 4294967295],
	[
		0,
		Math.min(Number.MAX_SAFE_INTEGER, (2 ** 64) - 1),
	],
]
	.map(([min, max]) => {
		const converter = new Converter<number>(
			(i): i is number => typeof i === 'number' && Number.isInteger(i) && min <= i && i <= max,
			() => 0
		);
		converter
			.undefined(converter.fallback)
			.boolean(Number)
			.number((i) => {
				if (i <= min) {
					return min;
				} else if (i >= max) {
					return max;
				} else {
					if (Number.isFinite(i)) {
						return Math.trunc(i);
					} else {
						return converter.fallback();
					}
				}
			})
			.bigint((i) => converter.convert(Number(i)))
			.string((i) => converter.convert(Number(i)))
			.symbol((i) => converter.convert(string.convert(i)))
			.register(isNull, converter.fallback)
			.register(isDate, (i) => converter.convert(i.getTime()))
			.register(Array.isArray, (i) => converter.convert(i[0]));
		return converter;
	})
;

/**
 * @memberof presets
 * @example
 * double.convert('42.5'); // 42.5
 * double.convert(Infinity); // Number.MAX_VALUE
 * double.convert(NaN); // 0
 */
export const double = new Converter<number>(
	(i): i is number => typeof i === 'number' && Number.isFinite(i) && -Number.MAX_VALUE <= i && i <= Number.MAX_VALUE,
	() => 0
);
double
	.undefined(double.fallback)
	.boolean(Number)
	.number((i) => {
		if (i === Infinity) {
			return Number.MAX_VALUE;
		} else if (i === -Infinity) {
			return -Number.MAX_VALUE;
		} else {
			return 0;
		}
	})
	.bigint((i) => double.convert(Number(i)))
	.string((i) => double.convert(Number(i)))
	.symbol((i) => double.convert(string.convert(i)))
	.register(isNull, double.fallback)
	.register(isDate, (i) => double.convert(i.getTime()))
	.register(Array.isArray, (i) => double.convert(i[0]))
;

/**
 * @memberof presets
 * @example
 * bigint.convert(42.5); // 42n
 * bigint.convert('42'); // 42n
 * bigint.convert('42.5'); // 0n
 * bigint.convert(Symbol.for('42')); // 42n
 * bigint.convert(new Date('1970-01-01T00:00:00.999Z')); // 999n
 */
export const bigint = new Converter<bigint>((i): i is bigint => typeof i === 'bigint', () => BigInt(0));
bigint
	.undefined(bigint.fallback)
	.boolean((i) => BigInt(i))
	.number((i) => BigInt(Math.trunc(double.convert(i))))
	.string((i) => bigint.convert(Number(i)))
	.symbol((i) => bigint.convert(string.convert(i)))
	.register(isNull, bigint.fallback)
	.register(isDate, (i) => bigint.convert(i.getTime()))
	.register(Array.isArray, (i) => bigint.convert(i[0]))
;

/**
 * @memberof presets
 * @example
 * string.convert(); // ''
 * string.convert(null); // ''
 * string.convert(false); // ''
 * string.convert(true); // ' '
 * string.convert(42.5); // '42.5'
 * string.convert([1, 2, 3]); // '1'
 * string.convert(Symbol.for('42')); // '42'
 * string.convert(new Date('1970-01-01T00:00:00.999Z')); // '1970-01-01T00:00:00.999Z'
 */
export const string = new Converter<string>((i): i is string => typeof i === 'string', String);
string
	.undefined(() => '')
	.boolean((i) => i ? ' ' : '')
	.number((i) => i === i ? String(i) : '')
	.bigint(String)
	.symbol((i) => Symbol.keyFor(i) || '')
	.register(isNull, () => '')
	.register(isDate, (i) => {
		const ts = i.getTime();
		if (Number.isFinite(ts)) {
			return i.toISOString();
		} else {
			return string.fallback('');
		}
	})
	.register(Array.isArray, (i) => string.convert(i[0]))
;

/**
 * @memberof presets
 * @example
 * symbol.convert(false); // Symbol('')
 * symbol.convert(42.5); // Symbol('42.5')
 * symbol.convert('42.5'); // Symbol('42.5')
 * symbol.convert([1.5, 2, 3]); Symbol('1.5')
 * symbol.convert(new Date('1970-01-01T00:00:00.999Z')); // Symbol('1970-01-01T00:00:00.999Z')
 */
export const symbol = new Converter<symbol>(
	(i): i is symbol => typeof i === 'symbol',
	(i) => Symbol.for(string.convert(i))
);

/**
 * @memberof presets
 * @example
 * array.convert(); // []
 * array.convert(null); // []
 * array.convert(false); // [false]
 * array.convert(123); // [123]
 * array.convert('1,2,3'); // ['1,2,3']
 * array.convert(new Set([1, 2, 3])); // [1, 2, 3]
 * array.convert(new Map([[1, 2], [3, 4], [5, 6]])); // [[1, 2], [3, 4], [5, 6]]
 */
export const array = new Converter<Array<any>>(Array.isArray, (i) => ([i]))
	.undefined(() => [])
	.boolean((i) => [i])
	.number((i) => [i])
	.bigint((i) => [i])
	.string((i) => [i])
	.symbol((i) => [i])
	.register(isNull, () => [])
	.register(isIterable, Array.from)
;

/**
 * @memberof presets
 * @example
 * fn.convert((a, b) => a + b); // (a, b) => a + b
 * fn.convert(123); // () => 123
 */

// eslint-disable-next-line no-unused-vars
export const fn = new Converter<(...args: any[]) => any>((i): i is (...args: any[]) => any => typeof i === 'function', (i) => () => i);

/**
 * @memberof presets
 * @example
 * date.convert(111); // Date('1970-01-01T00:00:00.111Z')
 * date.convert([222, 333]); // Date('1970-01-01T00:00:00.222Z')
 * date.convert('abc'); // Date(NaN)
 */
export const date = new Converter<Date>(isDate, () => new Date(NaN));
date
	.undefined(date.fallback)
	.boolean((i) => new Date(Number(i)))
	.number((i) => new Date(i))
	.bigint((i) => new Date(Number(i)))
	.string((i) => new Date(i))
	.symbol((i) => new Date(string.convert(i)))
	.register(Array.isArray, (i) => date.convert(i[0]))
;

/**
 * @memberof presets
 * @example
 * map.convert([ [true, 1], 2, '3']); // Map { [true, 1] }
 */
export const map = new Converter<Map<any, any>>((i): i is Map<any, any> => i instanceof Map, () => new Map())
	.register(isIterable, (i) => {
		const result = new Map();
		for (const item of i) {
			if (typeof item === 'object' && item !== null && item[Symbol.iterator]) {
				const [key, value] = item;
				result.set(key, value);
			}
		}
		return result;
	})
;

/**
 * @memberof presets
 * @example
 * weakmap.convert([ [Boolean, 'bool'], [Number, 'num'], [String, 'str'], [true, 1], 2, '3']); // WeakMap { [Boolean, 'bool'], [Number, 'num'], [String, 'str'] }
 */
export const weakmap = new Converter<WeakMap<any, any>>((i): i is WeakMap<any, any> => i instanceof WeakMap, () => new WeakMap())
	.register(isIterable, (i) => {
		const result = new WeakMap();
		for (const item of i) {
			if (typeof item === 'object' && item !== null && item[Symbol.iterator]) {
				const [key, value] = item;
				if ((typeof key === 'object' && key !== null) || typeof key === 'function') {
					result.set(key, value);
				}
			}
		}
		return result;
	})
;

/**
 * @memberof presets
 * @example
 * set.convert([1, '2', 3]); // Set {1, "2", 3}
 */
export const set = new Converter<Set<any>>((i): i is Set<any> => i instanceof Set, (i) => new Set().add(i))
	.undefined(() => new Set())
	.register(isNull, () => new Set())
	.register(isIterable, (i) => new Set(i))
;

/**
 * @memberof presets
 * @example
 * weakset.convert([Boolean, Number, String, true, 2, '3']); // WeakSet { Boolean, Number, String }
 */
export const weakset = new Converter<WeakSet<any>>((i): i is WeakSet<any> => i instanceof WeakSet, () => new WeakSet())
	.register(isIterable, (i) => {
		const result = new WeakSet();
		for (const item of i) {
			if ((typeof item === 'object' && item !== null) || typeof item === 'function') {
				result.add(item);
			}
		}
		return result;
	})
;

/**
 * @memberof presets
 * @example
 * promise.convert(Promise.resolve(1)); // Promise { 1 }
 * promise.convert(42); // Promise { 42 }
 */
export const promise = new Converter<Promise<any>>((i): i is Promise<any> => i instanceof Promise, (i) => Promise.resolve(i));

