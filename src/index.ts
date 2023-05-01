import Aggregator from './Aggregator';
import * as presets from './presets';

/**
 * @name import
 * @example
 * import * as a from 'alwz';
 * // or
 * const a = require('alwz');
 */


/**
 * Predefined conversion functions
 * @name predefined
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
 * @description converter selector (based on predefined converters)
 * @example
 * a.to('int')('24.5'); // 24
 * a.to('byte')(Infinity); // 127
 * a.to('bigint')('42.5'); // 42n
 */
export const to = converters.to;

/**
 * @name converters
 * @description predefined converters registry
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

// @ignore
export const boolean = presets.boolean.convert;
// @ignore
export const number = presets.number.convert;
// @ignore
export const byte = presets.byte.convert;
// @ignore
export const short = presets.short.convert;
// @ignore
export const int = presets.int.convert;
// @ignore
export const long = presets.long.convert;
// @ignore
export const ubyte = presets.ubyte.convert;
// @ignore
export const ushort = presets.ushort.convert;
// @ignore
export const uint = presets.uint.convert;
// @ignore
export const ulong = presets.ulong.convert;
// @ignore
export const double = presets.double.convert;
// @ignore
export const bigint = presets.bigint.convert;
// @ignore
export const string = presets.string.convert;
// @ignore
export const symbol = presets.symbol.convert;
// @ignore
export const fn = presets.fn.convert;
// @ignore
export const date = presets.date.convert;
// @ignore
export const array = presets.array.convert;
// @ignore
export const map = presets.map.convert;
// @ignore
export const weakmap = presets.weakmap.convert;
// @ignore
export const set = presets.set.convert;
// @ignore
export const weakset = presets.weakset.convert;
// @ignore
export const promise = presets.promise.convert;


// @ignore
export { default as Converter } from './Converter';

// @ignore
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
