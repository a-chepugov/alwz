import EV from './Error';
import Converter, { Fallback, assertFallback, isConversion, assertConversion } from './Converter';
import * as presets from './presets';

type Conversion<INPUT, OUTPUT> = (input: INPUT) => OUTPUT;

const InvalidArgument = class extends EV {};

/**
 * @namespace utils
 * @description extra utils functions
 * @example
 * const { array, tuple } = a.utils;
 */

/**
 * @memberof utils
 * @description constrain data to an array elements of a given type
 * @example
 * const numArray = array(Number);
 * numArray(); // []
 * numArray([]); // []
 * numArray([true, 2, "3", {}]); // [1, 2, 3, NaN]
 *
 * @example <caption>sparse arrays behavior</caption>
 * // Be aware of sparse arrays behavior - conversion is not performed for empty items
 * numArray[1, , 3] // [1, , 3]
 * @param {Conversion<*, T>} conversion - item conversion
 * @param {Conversion<*, Array<*>>} initiator - input data initial conversion
 * @returns {Conversion<*, Array<T>>}
 */
export const array = <T>(
	conversion: Conversion<unknown, T>,
	initiator: Conversion<unknown, Array<unknown>> = presets.array.convert
): Conversion<unknown, Array<T>> => {
	assertConversion(conversion);

	if (!isConversion(initiator)) {
		throw new Converter.InvalidConversionFunction('initiator must be a function', initiator);
	}

	return (input?: unknown) => {
		return initiator(input).map(conversion);
	};
};

/**
 * @memberof utils
 * @description constrain data to a tuple with given types
 * @example
 * const tupleNumStrBool = tuple([Number, String, Boolean]);
 * tupleNumStrBool(); // [NaN, 'undefined', false]
 * tupleNumStrBool(null); // [NaN, 'undefined', false]
 * tupleNumStrBool([]); // [NaN, '', false]
 * tupleNumStrBool('5'); // [5, 'undefined', false]
 * tupleNumStrBool(['1', '2', '3']); // [1, '2', true]
 *
 * @param {Array<Conversion<*, *>>} conversions - tuple elemets conversions
 * @param {Conversion<*, Array<*>>} initiator - input data initial conversion
 * @returns {Conversion<*, Array<*>>}
 */
export const tuple = (
	conversions: Array<Conversion<unknown, unknown>>,
	initiator: Conversion<unknown, Array<unknown>> = presets.array.convert
): Conversion<unknown, Array<unknown>> => {
	if (!Array.isArray(conversions)) {
		throw new Converter.InvalidConversionFunction('first argument must be an array', conversions);
	}

	conversions.forEach((conversion, index) => {
		if (!isConversion(conversion)) {
			throw new Converter.InvalidConversionFunction('conversion ' + index + ' must be a function', [index, conversion]);
		}
	});

	if (!isConversion(initiator)) {
		throw new Converter.InvalidConversionFunction('initiator must be a function', initiator);
	}

	return (input?: unknown) => {
		const array = initiator(input);
		return conversions.map((fn, index) => fn(array[index]));
	};
};

/**
 * @memberof utils
 * @description constrain variable value within a given range
 * @example
 * const range37 = range(3, 7);
 * range37(1); // 3
 * range37(5); // 5
 * range37(9); // 7
 *
 * const range37WithCustomFallback = range(3, 7, () => -1);
 * range37WithCustomFallback(1); // -1
 * range37WithCustomFallback(5); // 5
 * range37WithCustomFallback(9); // -1
 *
 * const rangeString = range('k', 'w', undefined, String);
 * rangeString('a'); // k
 * rangeString('n'); // n
 * rangeString('z'); // w
 *
 * @param {T} lower - lower range border
 * @param {T} upper - upper range border
 * @param {Fallback<T>} fallback - fallback value generator
 * @param {Conversion<*, T>} conversion - input data conversion
 * @returns {Conversion<*, T>}
 */
export const range = <T = number>(
	lower: T = -Number.MAX_VALUE as T,
	upper: T = Number.MAX_VALUE as T,
	fallback?: Fallback<T>,
	conversion: Conversion<unknown, T> = presets.double.convert as Conversion<unknown, T>
): Conversion<unknown, T> => {
	assertConversion(conversion);

	lower = conversion(lower);
	upper = conversion(upper);

	const fallbackActual = fallback === undefined
		? (input?: unknown) => {
			const converted = conversion(input);
			return upper <= converted ? upper : lower;
		}
		: fallback;

	assertFallback(fallbackActual);

	return (input?: unknown) => {
		const converted = conversion(input);
		if ((lower <= converted) && (converted <= upper)) {
			return converted;
		}

		return fallbackActual(input);
	};
};

/**
 * @memberof utils
 * @description constrain variable to given variants
 * @example
 * const var123 = variant([1, 2, 3]);
 * var123(1); // 1
 * var123(2); // 2
 * var123(3); // 3
 * var123(4); // 1
 * var123(-5); // 1
 *
 * const var123WithCustomFallback = variant([1, 2, 3], () => -1);
 * var123WithCustomFallback(4); // -1
 *
 * var123WithStrictFallback([1, 2, 3], () => {
 *   throw new Error('invalid input');
 * });
 * var123WithStrictFallback(4); // throws an Error
 *
 * const varABC = variant(['a', 'b'], (i) => ['a', 'b'][i], String);
 * varABC('a'); // 'a'
 * varABC('b'); // 'b'
 * varABC(0); // 'a'
 * varABC(1); // 'b'
 *
 * @param {Array<T>} values - valid values list
 * @param {Fallback<T>} fallback - fallback value generator
 * @param {Conversion<*, T>} conversion - input data conversion
 * @returns {Conversion<*, T>}
 */
export const variant = <T = number>(
	values: Array<T>,
	fallback: Fallback<T> = () => values[0] as T,
	conversion: Conversion<unknown, T> = presets.double.convert as Conversion<unknown, T>
): Conversion<unknown, T> => {
	assertConversion(conversion);
	assertFallback(fallback);

	if (!Array.isArray(values)) {
		throw new InvalidArgument('variant values must be an array of allowed values', values);
	}
	values = values.map((value) => conversion(value));

	return (input?: unknown) => {
		const converted = conversion(input);
		if (values.includes(converted)) {
			return converted;
		}

		return fallback(input);
	};
};

/**
 * @memberof utils
 * @description cast data into an object with a given schema
 * @example
 * const objABC = utils.object({
 *   a: a.ubyte,
 *   b: utils.array(utils.object({
 *     c: a.int,
 *     d: utils.array(a.string),
 *   })),
 * });
 * objABC(undefined); // { a: 0, b: [] }
 * objABC({ a: 999, b: [{ c: 2.5, d: 3 }, null] }); // { a: 255, b: [{ c: 2, d: ['3'] }, { c: 0, d: [] }] }
 *
 * @param {Record<string, Conversion<any, T>>} schema
 * @param {Conversion<any, T>} conversion - input data conversion
 * @returns {Conversion<any, T>}
 */
export const object = <T extends object, Keys extends keyof T>(
	schema: { [key in Keys]: Conversion<any, T[key]> },
	conversion: Conversion<any, any> = presets.object.convert as any
): Conversion<any, T> => {
	if (typeof schema !== 'object' || schema === null) {
		throw new InvalidArgument('schema must must be an object', schema);
	}

	for (const key in schema) {
		const conversion = schema[key] as Conversion<any, any>;
		assertConversion(conversion);
	}

	assertConversion(conversion);

	return (input: any) => {
		const result = {} as T;
		const source = conversion(input);

		for (const key in schema) {
			const type = schema[key] as Conversion<any, any>;
			result[key] = type(source?.[key]);
		}
		return result;
	};
};

