import Converter from './models/Converter';
import * as numbers from './constants/numbers';
import is, { integers as intIs, floats as floatIs } from './is';

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
export const boolean = new Converter<boolean>(
	is.boolean,
	Boolean
)
	.undefined(Boolean)
	.number(Boolean)
	.bigint(Boolean)
	.string(Boolean)
	.symbol(function(i) { return this.convert(string.convert(i)); })
	.register(is.null, Boolean)
	.register(is.Array, function(i) { return this.convert(i[0]); })
	.register(is.Date, (i) => Boolean(i.getTime()))
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
export const number = new Converter<number>(
	is.number,
	Number
)
	.undefined(Number)
	.boolean(Number)
	.bigint(Number)
	.string(Number)
	.symbol((i) => Number(string.convert(i)))
	.register(is.null, () => 0)
	.register(is.Array, function(i) { return this.convert(i[0]); })
	.register(is.Date, (i) => i.getTime())
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

const numeric = number.clone()
	.undefined(() => 0)
	.bigint(function(i) { return this.convert(Number(i)); })
	.string(function(i) { return this.convert(Number(i)); })
	.symbol(function(i) { return this.convert(string.convert(i)); })
	.register(is.Date, function(i) { return this.convert(i.getTime()); })
	;

numeric.fallback = () => 0;

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
export const {
	byte,
	short,
	int,
	long,
	ubyte,
	ushort,
	uint,
	ulong,
} = Object.fromEntries(
	Object.entries(numbers.integers)
		.map(([name, [min, max]]) => {

			const converter = numeric.clone()
				.number(function(i) {
					if (i <= min) {
						return min;
					} else if (i >= max) {
						return max;
					} else if (Number.isNaN(i)) {
						return 0;
					} else {
						return Math.trunc(i);
					}
				});
			converter.is = intIs[name as keyof typeof numbers.integers];

			return [name, converter];
		}))
;

/**
 * @memberof presets
 * @example
 * double.convert('42.5'); // 42.5
 * double.convert(Infinity); // Number.MAX_VALUE
 * double.convert(NaN); // 0
 */
export const {
	double,
} = Object.fromEntries(
	Object.entries(numbers.floats)
		.map(([name, [min, max]]) => {
			const converter = numeric.clone()
				.number(function(i) {
					if (i >= max) {
						return max;
					} else if (i <= min) {
						return min;
					} else {
						return 0;
					}
				});
			converter.is = floatIs[name as keyof typeof numbers.floats];

			return [name, converter];
		}))
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
export const bigint = new Converter<bigint>(
	is.bigint,
	() => BigInt(0)
)
	.undefined(() => BigInt(0))
	.boolean((i) => BigInt(i))
	.number((i) => BigInt(Math.trunc(double.convert(i))))
	.string(function(i) { return this.convert(Number(i)); })
	.symbol(function(i) { return this.convert(string.convert(i)); })
	.register(is.null, () => BigInt(0))
	.register(is.Array, function(i) { return this.convert(i[0]); })
	.register(is.Date, function(i) { return this.convert(i.getTime()); })
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
export const string = new Converter<string>(
	is.string,
	String
)
	.undefined(() => '')
	.boolean((i) => i ? ' ' : '')
	.number((i) => i === i ? String(i) : '')
	.bigint(String)
	.symbol((i) => Symbol.keyFor(i) || '')
	.register(is.null, () => '')
	.register(is.Array, function(i) { return this.convert(i[0]); })
	.register(is.Date, function(i) {
		const ts = i.getTime();
		if (Number.isFinite(ts)) {
			return i.toISOString();
		} else {
			return new Date(0).toISOString();
		}
	})
;

/**
 * @memberof presets
 * @example
 * symbol.convert(false); // Symbol('')
 * symbol.convert(42.5); // Symbol('42.5')
 * symbol.convert('42.5'); // Symbol('42.5')
 * symbol.convert([1.5, 2, 3]); // Symbol('1.5')
 * symbol.convert(new Date('1970-01-01T00:00:00.999Z')); // Symbol('1970-01-01T00:00:00.999Z')
 */
export const symbol = new Converter<symbol>(
	is.symbol,
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
export const array = new Converter<Array<any>>(
	is.Array,
	(i) => ([i])
)
	.undefined(() => [])
	.boolean((i) => [i])
	.number((i) => [i])
	.bigint((i) => [i])
	.string((i) => [i])
	.symbol((i) => [i])
	.register(is.null, () => [])
	.register(is.Iterable, Array.from)
;

/**
 * @memberof presets
 * @example
 * fn.convert((a, b) => a + b); // (a, b) => a + b
 * fn.convert(123); // () => 123
 */

// eslint-disable-next-line no-unused-vars
export const fn = new Converter<Function>(
	is.function,
	(i) => () => i
);

/**
 * @memberof presets
 * @example
 * date.convert(111); // Date('1970-01-01T00:00:00.111Z')
 * date.convert([222, 333]); // Date('1970-01-01T00:00:00.222Z')
 * date.convert('abc'); // Date(NaN)
 */
export const date = new Converter<Date>(
	is.Date,
	() => new Date(NaN)
)
	.undefined(() => new Date(NaN))
	.boolean((i) => new Date(Number(i)))
	.number((i) => new Date(i))
	.bigint((i) => new Date(Number(i)))
	.string((i) => new Date(i))
	.symbol((i) => new Date(string.convert(i)))
	.register(is.Array, function(i) { return this.convert(i[0]); })
;

/**
 * @memberof presets
 * @example
 * object.convert(undefined); // {}
 * object.convert(null); // {}
 * object.convert(false); // Boolean { false }
 * object.convert(1); // Number { 1 }
 * object.convert('2'); // String { 2 }
 * object.convert([1, '2', 3n]); // [1, '2', 3n]
 */
export const object = new Converter<object>(
	is.object,
	Object
);

/**
 * @memberof presets
 * @example
 * map.convert([ [true, 1], 2, '3']); // Map { [true, 1] }
 */
export const map = new Converter<Map<unknown, unknown>>(
	is.Map,
	() => new Map()
)
	.register(is.Iterable, (input) => {
		const result = new Map();
		for (const item of input) {
			if (is.Iterable(item)) {
				const [key, value] = item as [unknown, unknown];
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
export const weakmap = new Converter<WeakMap<any, unknown>>(
	is.WeakMap,
	() => new WeakMap()
)
	.register(is.Iterable, (input) => {
		const result = new WeakMap();
		for (const item of input) {
			if (is.Iterable(item)) {
				const [key, value] = item as [any, unknown];
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
 * set.convert([1, '2', 3]); // Set {1, '2', 3}
 */
export const set = new Converter<Set<unknown>>(
	is.Set,
	(i) => new Set().add(i)
)
	.undefined(() => new Set())
	.register(is.null, () => new Set())
	.register(is.Iterable, (i) => new Set(i))
;

/**
 * @memberof presets
 * @example
 * weakset.convert([Boolean, Number, String, true, 2, '3']); // WeakSet { Boolean, Number, String }
 */
export const weakset = new Converter<WeakSet<any>>(
	is.WeakSet,
	() => new WeakSet()
)
	.register(is.Iterable, (i) => {
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
export const promise = new Converter<Promise<any>>(
	is.Promise,
	(i) => Promise.resolve(i)
);

