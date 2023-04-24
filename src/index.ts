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
 * a.boolean([false]); // false
 */
export const boolean = presets.boolean.convert;

/**
 * @description cast to number
 * @example
 * a.number('42'); // 42
 * a.number('abc'); // NaN
 * a.number(Symbol.for('42')); // 42
 * a.number(new Date('1970-01-01T00:00:00.042Z')); // 42
 * a.number(['42']); // 42
 */
export const number = presets.number.convert;

/**
 * @description cast to integer
 * @example
 * a.byte(Infinity); // 127
 * a.short(Infinity); // 327677
 * a.int(Infinity); // 2147483647
 * a.long(Infinity); // MAX_SAFE_INTEGER
 * a.int(42.5); // 42
 * a.int('42.5'); // 42
 * a.int('abc'); // 0
 * a.int(NaN); // 0
 * a.int(Symbol.for('42.5')); // 42
 * a.byte(new Date('1970-01-01T00:00:00.999Z')); // 127
 * a.int(new Date(NaN)); // 0
 */
export const byte = presets.byte.convert;
export const short = presets.short.convert;
export const int = presets.int.convert;
export const long = presets.long.convert;

/**
 * @description cast to string
 * @example
 * a.string(42.5); // '42.5'
 * a.string(Symbol.for('42')); // '42'
 * a.string(new Date('1970-01-01T00:00:00.999Z')); // '1970-01-01T00:00:00.999Z'
 * a.string([1, 2, 3]); '1'
 * a.string(false); ''
 * a.string(true); ' '
 */
export const string = presets.string.convert;

/**
 * @description cast to symbol
 * @example
 * a.symbol(42.5); // Symbol('42.5')
 * a.symbol(Symbol.for('42')); // Symbol('42')
 * a.symbol(new Date('1970-01-01T00:00:00.999Z')); // Symbol('1970-01-01T00:00:00.999Z')
 * a.symbol([1, 2, 3]); Symbol('1,2,3')
 * a.symbol(false); Symbol('')
 */
export const symbol = presets.symbol.convert;

/**
 * @description cast to function
 * @example
 * a.fn((a, b) => a + b); // (a, b) => a + b
 * a.fn(123); () => 123
 */
export const fn = presets.fn.convert;

/**
 * @description cast to date
 * @example
 * a.date('111'); // Date('1970-01-01T00:00:00.111Z')
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
 * a.set([1, '2', 3]); // Set {1, "2", "c"}
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
