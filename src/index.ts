import Aggregator from './Aggregator';
import * as presets from './presets';

/**
 * @name Import
 * @example
 * import * as a from 'alwz';
 * // or
 * const a = require('alwz');
 */

/**
 * @name Predefined
 * @see {@link presets presets}
 * @description convert data with presetted converters
 * @example
 * a.boolean([false, true]); // false
 * a.byte('3'); // 3
 * a.short(false); // 0
 * a.int(true); // 1
 * a.long(NaN); // 0
 * a.uint(Infinity); // 4294967295
 * a.array('abc'); // ['abc']
 * a.array(['abc', 'def', 'ghi']); // ['abc', 'def', 'ghi']
 */

/**
 * @name Utils
 * @see {@link utils utils}
 * @description construct complex data
 * @example <caption>ensure an array output</caption>
 * const array = a.utils.array;
 * const ArrayOfUByte = array(a.ubyte);
 * ArrayOfUByte([undefined, true, 2.3, '4', Infinity]); // [0, 1, 2, 4, 255]
 *
 * @example <caption>simplify multidimensional arrays processing</caption>
 * const array = a.utils.array;
 *
 * const Bytes3dArray = array(array(array(a.byte)));
 *
 * Bytes3dArray(1); // [[[1]]];
 * Bytes3dArray([[[null, NaN, 'a'], [true, '2', 3]], [[-Infinity]]]); // [[[0, 0, 0], [1, 2, 3]], [[-128]]];
 *
 * @example <caption>create tuples</caption>
 * const tuple = a.utils.tuple;
 * const Pair = tuple([a.uint, a.uint]);
 * Pair(['abc', 35, 100]); // [0, 35]
 *
 * const NativePair = tuple([Number, Number]);
 * NativePair(['abc', 35, 100]); // [NaN, 35]
 *
 * @example <caption>parse colon-separated number/string mixed records</caption>
 * const PathArray = a.default.get('array')
 *   .clone()
 *   .string((i) => [...i.matchAll(/\/(\w+)/g)].map((i) => i[1]))
 *   .convert;
 *
 * const DSV2Tuple = a.utils.tuple(
 *   [String, String, Number, Number, String, PathArray, PathArray],
 *   a.default.get('array')
 *     .clone()
 *     .string((i) => i.split(':'))
 *     .convert
 * );
 *
 * const input = 'user:12345:1000:1000:ordinar user:/home/user:/bin/sh';
 * DSV2Tuple(input); // ['user', '12345', 1000, 1000, 'ordinar user', ['home', 'user'], ['bin', 'sh']];
 */

/**
 * @name Transform
 * @see {@link Converter Converter}
 * @description create custom converters
 *
 * @example <caption>extend an existing converter</caption>
 * // make boolean smarter
 * const bool = a.default.get('boolean')
 *   .clone()
 *   .string(function(v) {
 *     if (v === 'true' || v === 'yes') {
 *       return true;
 *     } else if (v === 'false' || v === 'no') {
 *       return false;
 *     } else {
 *       return this.types.number(Number(v));
 *     }
 *   })
 *   .convert;
 *
 * bool('yes'); // true
 * bool('no'); // false
 * bool('false'); // false
 *
 * @example <caption>create specific converters</caption>
 * const even = new a.Converter(
 *   (input) => typeof input === 'number' && input % 2 === 0,
 *   (input) => Number(input) % 2 === 0 ? Number(input) : 0
 * );
 *
 * even
 *   .undefined(() => -2)
 *   .boolean((input) => input ? -4 : -6)
 *   .number(function(input) {
 *     const result = Math.trunc(Math.abs(input || 0) / 2) * 2;
 *     return this.is(result) ? result : this.fallback(input);
 *   })
 *   .string((input) => even.convert(Number(input)))
 *   .register(Array.isArray, (input) => even.convert(input[0])); // take first and try again
 *
 * even.convert(8); // 8
 * even.convert(undefined); // -2
 * even.convert(true); // -4
 * even.convert(false); // -6
 * even.convert(NaN); // 0
 * even.convert(11); // 10
 * even.convert('15'); // 14
 * even.convert([17, 18, 19]); // 16
 */

export const converters = new Aggregator()
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
 * @name Selector
 * @description dynamically select convert function (based on predefined converters)
 * @example
 * a.to('int')('24.5'); // 24
 * a.to('byte')(Infinity); // 127
 * a.to('bigint')('42.5'); // 42n
 */
export const to = converters.to;

/**
 * @name Converters
 * @description registry of predefined converters
 * @example
 * // retrieving with existence check
 * const Num = a.default.converter('number'); // Converter<number>
 * const Str = a.default.converter('string'); // Converter<string>
 * a.default.converter('123'); // Error
 *
 * // direct retrieving
 * const Arr = a.default.get('array'); // Converter<Array>
 * const Unknown = a.default.get('123'); // undefined
 */
export default converters;

export const boolean = presets.boolean.convert;
export const number = presets.number.convert;
export const byte = presets.byte.convert;
export const short = presets.short.convert;
export const int = presets.int.convert;
export const long = presets.long.convert;
export const ubyte = presets.ubyte.convert;
export const ushort = presets.ushort.convert;
export const uint = presets.uint.convert;
export const ulong = presets.ulong.convert;
export const double = presets.double.convert;
export const bigint = presets.bigint.convert;
export const string = presets.string.convert;
export const symbol = presets.symbol.convert;
export const fn = presets.fn.convert;
export const date = presets.date.convert;
export const array = presets.array.convert;
export const map = presets.map.convert;
export const weakmap = presets.weakmap.convert;
export const set = presets.set.convert;
export const weakset = presets.weakset.convert;
export const promise = presets.promise.convert;


export { default as Converter } from './Converter';
export { default as Aggregator } from './Aggregator';
export * as utils from './utils';
