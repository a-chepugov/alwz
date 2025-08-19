import Aggregator from './models/Aggregator.js';
import presets from './presets.js';

import cast from './cast.js';

/**
 * @name Types
 * @description Guarantee data type
 * @example
 * import { byte, short, int, uint, long, array } from 'alwz';
 *
 * byte('3'); // 3
 * short(false); // 0
 * int(true); // 1
 * uint(Infinity); // 4294967295
 * long(NaN); // 0
 * long(['1', '2', '3']); // 1 | ['1','2','3'] => '1' => 1
 * array('abc'); // ['abc']
 */
export const {
	boolean,
	number,
	byte,
	short,
	int,
	long,
	ubyte,
	ushort,
	uint,
	ulong,
	double,
	bigint,
	string,
	symbol,
	array,
	fn,
	date,
	object,
	map,
	weakmap,
	set,
	weakset,
	promise,
} = cast;

export { default as cast } from './cast.js';

/**
 * @name Structures
 * @see {@link utils utils}
 * @description ensure structure for complex data
 * @example <caption>normalize array elements</caption>
 * import { utils } from 'alwz';
 * const arrayOf = utils.array;
 *
 * const ArrayOfUByte = arrayOf(byte);
 *
 * ArrayOfUByte([undefined, true, 2.3, '4', Infinity]); // [0, 1, 2, 4, 127]
 *
 * @example <caption>simplify nested arrays processing</caption>
 * const arrayOf = utils.array;
 * const NestedBytesArray = arrayOf(arrayOf(byte));
 *
 * NestedBytesArray(1); // [[1]];
 * NestedBytesArray([[null, NaN, 'a'], [true, '2', 3], Infinity]); // [[[0, 0, 0], [1, 2, 3]], [[127]]];
 *
 * @example <caption>create tuples</caption>
 * const tuple = utils.tuple;
 * const PairOfUint = tuple([uint, uint]);
 * PairOfUint([3.5, '100']); // [3, 100]
 *
 * const PairOfNumbers = tuple([Number, Number]);
 * PairOfNumbers(['abc', 3.5, 100]); // [NaN, 3.5]
 */

/**
 * @name Transformations
 * @see {@link presets presets}
 * @description predefined converters
 *
 * @example <caption>build smart bool converter</caption>
 * import { presets } from 'alwz';
 *
 * const bool = presets.boolean
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
 * const PathArray = presets.array
 *   .clone()
 *   .string((i) => [...i.matchAll(/\/(\w+)/g)].map((i) => i[1]))
 *   .convert;
 *
 * const DSV2Tuple = utils.tuple(
 *   [String, String, Number, Number, String, PathArray, PathArray],
 *   presets.array
 *     .clone()
 *     .string((i) => i.split(':'))
 *     .convert
 * );
 *
 * const input = 'user:12345:1000:1000:ordinar user:/home/user:/bin/sh';
 * DSV2Tuple(input); // ['user', '12345', 1000, 1000, 'ordinar user', ['home', 'user'], ['bin', 'sh']];
 */
export { default as presets } from './presets.js';

/**
 * deprecated
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

export default converters;

/**
 * @name Selector
 * @description dynamically select conversion function at runtime (from predefined list)
 * @example
 * import { to } from 'alwz';
 *
 * to('int')('24.5'); // 24
 * to('byte')(Infinity); // 127
 * to('bigint')('42.5'); // 42n
 */
export { to as to } from './cast.js';

export * as utils from './utils.js';

/**
 * @name Predicates
 * @see {@link is is}
 * @description check data type
 * @example
 * import { is } from 'alwz';
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

/**
 * @name Checks
 * @see {@link Is}
 * @description create type guard functions
 * @example
 * import { Is } from 'alwz';
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

export { default as Converter } from './models/Converter.js';
export { default as Aggregator } from './models/Aggregator.js';

/**
 * @name Errors
 * @see {@link ErrorValue}
 * @description create informative errors (ternary-friendly)
 * @example
 * import { ErrorValue } from 'alwz';
 *
 * const rise = (condition) => condition
 *   ? new ErrorValue('oops', { condition, date: Date.now() }).throw()
 *   : condition;
 *
 * rise(true); // throws ErrorValue with extra message and data
 */
export { default as ErrorValue } from './models/ErrorValue.js';
