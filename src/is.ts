import * as numbers from './constants/numbers';

type Guard<T> = (input?: unknown) => input is T;

export const integers = Object.fromEntries(
	Object.entries(numbers.integers)
		.map(([name, [min, max]]) => {
			return [
				name,
				(i?: unknown): i is number => typeof i === 'number' && min <= i && i <= max && Number.isInteger(i),
			];
		})
) as Record<keyof typeof numbers.integers, Guard<number>>;

export const floats = Object.fromEntries(
	Object.entries(numbers.floats)
		.map(([name, [min, max]]) => {
			return [
				name,
				(i?: unknown): i is number => typeof i === 'number' && min <= i && i <= max,
			];
		})
) as Record<keyof typeof numbers.floats, Guard<number>>;

/** @module is
 * @description guard functions (pattern matching check)
 */
export default {

	/** @function undefined
	 * @memberof is */
	undefined: (i?: unknown): i is undefined => i === undefined,

	/** @function null
	 * @memberof is */
	null: (i?: unknown): i is null => i === null,

	/** @function void
	 * @description undefined or null
	 * @example
	 * is.void(null) // true
	 * is.void(0) // false
	 * @memberof is */
	void: (i?: unknown): i is undefined | null => i === undefined || i === null,

	/** @function value
	 * @description any value except undefined or null
	 * @example
	 * is.value(null) // false
	 * is.value(0) // true
	 * @memberof is */
	value: (i?: unknown): i is Exclude<unknown, undefined | null> => i !== undefined && i !== null,

	/** @function boolean
	 * @example
	 * is.boolean(1) // false
	 * is.boolean(true) // true
	 * @memberof is */
	boolean: (i?: unknown): i is boolean => typeof i === 'boolean',

	/**
	 * @function number
	 * @example
	 * is.number(NaN) // true
	 * is.number(Infinity) // true
	 * is.number(1) // true
	 * is.number('1') // false
	 * @memberof is */
	number: (i?: unknown): i is number => typeof i === 'number',

	...integers,
	...floats,

	/** @name integers
	 * @description byte, short, int, long
	 * @example
	 * is.int(NaN) // false
	 * is.long(Infinity) // false
	 * is.uint(-1) // false
	 * is.uint(1) // true
	 * is.uint(1.5) // false
	 * @memberof is.number */

	/** @name floats
	 * @description double
	 * @example
	 * is.double(NaN) // false
	 * is.double(Infinity) // false
	 * is.double(1.5) // true
	 * @memberof is.number */

	/** @function bigint
	 * @memberof is */
	bigint: (i?: unknown): i is bigint => typeof i === 'bigint',

	/** @function string
	 * @memberof is */
	string: (i?: unknown): i is string => typeof i === 'string',

	/** @function symbol
	 * @memberof is */
	symbol: (i?: unknown): i is symbol => typeof i === 'symbol',

	/** @function function
	 * @memberof is */
	function: (i?: unknown): i is Function => typeof i === 'function',

	/** @function object
	 * @description any object (null excluded)
	 * @example
	 * is.object(null) // false
	 * is.object({}) // true
	 * @memberof is */
	object: (i?: unknown): i is object => typeof i === 'object' && i !== null,

	/** @function Error
	 * @memberof is */
	Error: (i?: unknown): i is Error => i instanceof Error,

	/** @function Array
	 * is.Array({}) // false
	 * is.Array([]) // true
	 * @memberof is */
	Array: Array.isArray,

	/** @function Date
	 * @memberof is */
	Date: (i?: unknown): i is Date => i instanceof Date,

	/** @function RegExp
	 * @memberof is */
	RegExp: (i?: unknown): i is RegExp => i instanceof RegExp,

	/** @function Promise
	 * @memberof is */
	Promise: (i?: unknown): i is Promise<unknown> => i instanceof Promise,

	/** @function Set
	 * @memberof is */
	Set: (i?: unknown): i is Set<unknown> => i instanceof Set,

	/** @function WeakSet
	 * @memberof is */
	WeakSet: (i?: unknown): i is WeakSet<any> => i instanceof WeakSet,

	/** @function Map
	 * @memberof is */
	Map: (i?: unknown): i is Map<unknown, unknown> => i instanceof Map,

	/** @function WeakMap
	 * @memberof is */
	WeakMap: (i?: unknown): i is WeakMap<any, unknown> => i instanceof WeakMap,

	/** @function Iterable
	 * @description can be iterated
	 * @example
	 * is.Iterable(new Map()); // true
	 * is.Iterable([]); // true
	 * is.Iterable({}); // false
	 * @memberof is */
	Iterable: (i?: unknown): i is Iterable<unknown> =>
		typeof i === 'object'
		&& i !== null
		&& Symbol.iterator in i
		&& typeof i[Symbol.iterator] === 'function',

};
