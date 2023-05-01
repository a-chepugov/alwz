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
 * data conversion by presetted converters
 * @name Predefined
 * @see {@link presets presets}
 * @example
 * a.boolean([false, true]); // false
 * a.ubyte(Infinity); // 255
 * a.long(NaN); // 0
 * a.array('123'); // ['123']
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
 * a.default.converter('number'); // Converter<number>
 * a.default.converter('date'); // Converter<Date>
 * a.default.converter('123'); // Error
 *
 * // direct retrieving
 * const array = a.default.get('array'); // Converter<Array>
 * const unknown = a.default.get('123'); // undefined
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

/**
 * ### Tips
 * @example <caption>Parse colon-separated string</caption>
 * const DSV2Nums = a.utils.array(
 *   a.number,
 *   a.default.get('array')
 *     .clone()
 *     .string((i) => i.split(':'))
 *     .convert
 * );
 * DSV2Nums('1:2:3:abc'); // [1, 2, 3, NaN];
 */
