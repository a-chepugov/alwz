import Aggregator from './models/Aggregator.js';
import * as presets from './presets.js';

/**
 * @name Import
 * @example
 * import * as a from 'alwz';
 * // or
 * const a = require('alwz');
 */

/**
 * @name Types
 * @see {@link presets presets}
 * @description convert data with presetted converters
 * @example
 * a.byte('3'); // 3
 * a.short(false); // 0
 * a.int(true); // 1
 * a.uint(Infinity); // 4294967295
 * a.long(NaN); // 0
 * a.long(['1', '2', '3']); // 1 | ['1','2','3'] => '1' => 1
 * a.array('abc'); // ['abc']
 * a.array([123, 'abc', {}, Math.max]); // [123, 'abc', {}, Math.max]
 */

/**
 * @name Structures
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
 * Bytes3dArray([[[null, NaN, 'a'], [true, '2', 3]], [[Infinity]]]); // [[[0, 0, 0], [1, 2, 3]], [[127]]];
 *
 * @example <caption>create tuples</caption>
 * const tuple = a.utils.tuple;
 * const PairOfUint = tuple([a.uint, a.uint]);
 * PairOfUint(['abc', 3.5, 100]); // [0, 3]
 *
 * const PairOfNumbers = tuple([Number, Number]);
 * PairOfNumbers(['abc', 3.5, 100]); // [NaN, 3.5]
 */

/**
 * @name Transformations
 * @see {@link Converter Converter}
 * @description create custom converters
 *
 * @example <caption>extend an existing converter</caption>
 * // make boolean smarter
 * const bool = a.converters.get('boolean')
 *   .clone()
 *   .string(function(v) { // string input processing
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
 * @example <caption>parse colon-separated number/string records</caption>
 * const PathArray = a.converters.get('array')
 *   .clone()
 *   .string((i) => [...i.matchAll(/\/(\w+)/g)].map((i) => i[1]))
 *   .convert;
 *
 * const DSV2Tuple = a.utils.tuple(
 *   [String, String, Number, Number, String, PathArray, PathArray],
 *   a.converters.get('array')
 *     .clone()
 *     .string((i) => i.split(':'))
 *     .convert
 * );
 *
 * const input = 'user:12345:1000:1000:ordinar user:/home/user:/bin/sh';
 * DSV2Tuple(input); // ['user', '12345', 1000, 1000, 'ordinar user', ['home', 'user'], ['bin', 'sh']];
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
	.register('object', presets.object)
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
 * // get list of predefined converters
 * Array.from(a.converters.keys()); // ['boolean', 'byte', 'int', 'long', 'double', 'string', ...];
 *
 * // retrieving with existence check
 * const Num = a.converters.converter('number'); // Converter<number>
 * const Str = a.converters.converter('string'); // Converter<string>
 * a.converters.converter('123'); // Error
 *
 * // direct retrieving
 * const Arr = a.converters.get('array'); // Converter<Array>
 * const Unknown = a.converters.get('123'); // undefined
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
export const object = presets.object.convert;
export const array = presets.array.convert;
export const map = presets.map.convert;
export const weakmap = presets.weakmap.convert;
export const set = presets.set.convert;
export const weakset = presets.weakset.convert;
export const promise = presets.promise.convert;

export * as utils from './utils.js';

/**
 * @name Predicates
 * @see {@link is is}
 * @description data type checks
 * @example
 * const { is } = a;
 *
 * is.void(0); // false
 * is.void(null); // true
 * is.value(null); // false
 * is.value(0); // true
 * is.ubyte(255); // true
 * is.int(Infinity); // false
 * is.object(null); // false
 * is.Iterable(new Set()); // true
 */
export { default as is } from './is.js';
export { default as Converter } from './models/Converter.js';
export { default as Aggregator } from './models/Aggregator.js';

/**
 * @name Checks
 * @see {@link Is}
 * @description create readable check functions
 * @example
 * const { Is } = a;
 *
 * const isAlphaOrBeta = Is.variant(['Alpha', 'Beta']);
 * isAlphaOrBeta('Alpha'); // true;
 * isAlphaOrBeta('Gamma'); // false;
 *
 * class X {}
 * class Y extends X {}
 *
 * const isX = Is.instance(X);
 * isX(new X); // true
 * isX(new Y); // true
 * isX({}); // false
 */
export { default as Is } from './models/Is.js';

/**
 * @name Errors
 * @see {@link ErrorValue}
 * @description create informative errors
 * @example <caption>add additional value to an error</caption>
 * const { ErrorValue } = a;
 * const inc = (input) => typeof input === 'number'
 *   ? input + 1
 *   : new ErrorValue('invalid list', { input, date: Date.now() }).throw();
 *
 * inc('1'); // Error { message: 'invalid number', value: { input: '1', date: 946684800000 } }
 *
 * @example <caption>intercept and wrap thrown ones</caption>
 * try {
 *  throw new Error('oops, something went wrong');
 * } catch (error) {
 *  throw new ErrorValue('urgent message', { data: 'some additional data' }, { cause: error });
 * }
 */
export { default as ErrorValue } from './models/ErrorValue.js';
