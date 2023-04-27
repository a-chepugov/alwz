import Aggregator from './Aggregator';
import * as presets from './presets';

export { default as Converter } from './Converter';
export { default as Aggregator } from './Aggregator';
/**
 * @name import
 * @example
 * import * as a from 'alwz';
 * // or
 * const a = require('alwz');
 */

/**
 * @description cast to boolean
 * @example
 * a.boolean('abc'); // true
 * a.boolean([false, true]); // false
 * a.boolean(Symbol.for('')); // false
 * a.boolean([]); // false
 * a.boolean([0]); // false
 * a.boolean([123]); // true
 */
export const boolean = presets.boolean.convert;

/**
 * @description cast to number
 * @example
 * a.number(Infinity); // Infinity
 * a.number('42'); // 42
 * a.number('abc'); // NaN
 * a.number(Symbol.for('42')); // 42
 * a.number(new Date('1970-01-01T00:00:00.042Z')); // 42
 * a.number(['42']); // 42
 * a.number([ [ [ 42 ] ] ]); // 42
 * a.number(new Date('1970-01-01T00:00:00.999Z')); // 999
 */
export const number = presets.number.convert;

/**
 * @name integers
 * @description cast to byte, short (2 bytes), int (4 bytes) or long (8 bytes)
 * @example
 * a.byte(Infinity); // 127
 * a.byte(-Infinity); // -128
 * a.short(Infinity); // 327677
 * a.int(Infinity); // 2147483647
 * a.int(-Infinity); // -2147483648
 * a.long(Infinity); // MAX_SAFE_INTEGER
 * a.int(42.5); // 42
 * a.int('42.5'); // 42
 * a.int(['42.5']); // 42
 * a.int(Symbol.for('42.5')); // 42
 * a.int(new Date('1970-01-01T00:00:00.042Z')); // 42
 * a.int('abc'); // 0
 * a.int(NaN); // 0
 * a.int(new Date(NaN)); // 0
 */
export const byte = presets.byte.convert;
export const short = presets.short.convert;
export const int = presets.int.convert;
export const long = presets.long.convert;

/**
 * @description cast to unsigned integer
 * @example
 * a.ubyte(Infinity); // 255
 * a.ushort(Infinity); // 65535
 * a.uint(Infinity); // 4294967295
 * a.ulong(Infinity); // MAX_SAFE_INTEGER
 * a.ubite(-1); // 0
 * a.ushort(-1); // 0
 * a.uint(-1); // 0
 * a.ulong(-1); // 0
 */
export const ubyte = presets.ubyte.convert;
export const ushort = presets.ushort.convert;
export const uint = presets.uint.convert;
export const ulong = presets.ulong.convert;

/**
 * @description cast to double
 * @example
 * a.double('42.5'); // 42.5
 * a.double(Infinity); // Number.MAX_VALUE
 * a.double(NaN); // 0
 */
export const double = presets.double.convert;

/**
 * @description cast to bigint
 * @example
 * a.bigint(42.5); // 42n
 * a.bigint('42'); // 42n
 * a.bigint('42.5'); // 0n
 * a.bigint(Symbol.for('42')); // 42n
 * a.bigint(new Date('1970-01-01T00:00:00.999Z')); // 999n
 */
export const bigint = presets.bigint.convert;

/**
 * @description cast to string
 * @example
 * a.string(); // ''
 * a.string(null); // ''
 * a.string(false); // ''
 * a.string(true); // ' '
 * a.string(42.5); // '42.5'
 * a.string([1, 2, 3]); // '1'
 * a.string(Symbol.for('42')); // '42'
 * a.string(new Date('1970-01-01T00:00:00.999Z')); // '1970-01-01T00:00:00.999Z'
 */
export const string = presets.string.convert;

/**
 * @description cast to symbol
 * @example
 * a.symbol(false); // Symbol('')
 * a.symbol(42.5); // Symbol('42.5')
 * a.symbol('42.5'); // Symbol('42.5')
 * a.symbol([1.5, 2, 3]); Symbol('1.5')
 * a.symbol(new Date('1970-01-01T00:00:00.999Z')); // Symbol('1970-01-01T00:00:00.999Z')
 */
export const symbol = presets.symbol.convert;

/**
 * @description cast to function
 * @example
 * a.fn((a, b) => a + b); // (a, b) => a + b
 * a.fn(123); // () => 123
 */
export const fn = presets.fn.convert;

/**
 * @description cast to date
 * @example
 * a.date(111); // Date('1970-01-01T00:00:00.111Z')
 * a.date([222, 333]); // Date('1970-01-01T00:00:00.222Z')
 * a.date('abc'); // Date(NaN)
 */
export const date = presets.date.convert;

/**
 * @description cast to array
 * @example
 * a.array(); // []
 * a.array(null); // []
 * a.array(false); // [false]
 * a.array(123); // [123]
 * a.array('1,2,3'); // ['1,2,3']
 * a.array(new Set([1, 2, 3])); // [1, 2, 3]
 * a.array(new Map([[1, 2], [3, 4], [5, 6]])); // [[1, 2], [3, 4], [5, 6]]
 */
export const array = presets.array.convert;

/**
 * @description cast to map
 */
export const map = presets.map.convert;

/**
 * @description cast to weakmap
 */
export const weakmap = presets.weakmap.convert;

/**
 * @description cast to set
 * @example
 * a.set([1, '2', 3]); // Set {1, "2", 3}
 */
export const set = presets.set.convert;

/**
 * @description cast to weakset
 */
export const weakset = presets.weakset.convert;

/**
 * @description cast to promise
 * @example
 * a.promise(Promise.resolve(1)); // Promise { 1 }
 * a.promise(42); // Promise { 42 }
 */
export const promise = presets.promise.convert;

/**
 * @description aggregates converters
 * @example
 * const converter = new a.Converter((input) => typeof input === 'number' && input > 0, () => 1);
 * converter
 * 	.undefined(() => 1)
 * 	.number((i) => {
 * 		const result = Math.abs(i);
 * 		return result > 0 ? result : converter.fallback();
 * 	})
 * 	.bigint((i) => converter.convert(Number(i)))
 * 	.string((i) => converter.convert(Number(i)))
 * 	.symbol((i) => converter.convert(Symbol.keyFor(i)))
 * 	.register((i) => i instanceof Number, (i: any) => converter.convert(+i));
 *
 * a.aggregator.register('positive', converter);
 *
 * a.to('positive')('-7'); // 7
 * a.to('positive')('abc'); // 1
 */
export const aggregator = new Aggregator()
	.register('boolean', presets.boolean)
	.register('number', presets.number)
	.register('byte', presets.byte)
	.register('short', presets.short)
	.register('int', presets.int)
	.register('long', presets.long)
	.register('ubyte', presets.ubyte)
	.register('ushort', presets.ushort)
	.register('uint', presets.uint)
	.register('ulong', presets.ulong)
	.register('bigint', presets.bigint)
	.register('double', presets.double)
	.register('string', presets.string)
	.register('symbol', presets.symbol)
	.register('fn', presets.fn)
	.register('date', presets.date)
	.register('array', presets.array)
	.register('map', presets.map)
	.register('weakmap', presets.weakmap)
	.register('set', presets.set)
	.register('weakset', presets.weakset)
	.register('promise', presets.promise);

/**
 * @example
 * a.to('int')('24.5'); // 24
 * a.to('bigint')('42.5'); // 42n
 */
export const to = aggregator.to;

export default aggregator;
