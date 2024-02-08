import EV from './Error';
import Converter, { Fallback, assertFallback, Conversion, isConversion, assertConversion } from './Converter';
import * as presets from './presets';

const InvalidArgument = class extends EV {};
const InvalidResult = class extends EV {};

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
 * @param {Conversion<any, T>} fn
 * @param {Conversion<any, Array<any>>} initiator
 * @return {(input?: any) => Array<T>}
 * @returns {Conversion<any, Array<T>>}
 */
export const array = <T>(fn: Conversion<any, T>, initiator: Conversion<any, Array<any>> = presets.array.convert): Conversion<any, Array<T>> => {
	assertConversion(fn);

	if (!isConversion(initiator)) {
		throw new Converter.InvalidConversionFunction('initiator must be a function', initiator);
	}

	return (input: any) => {
		return initiator(input).map(fn);
	};
};

/**
 * @memberof utils
 * @description constrain data to a tuple with given types
 * @example
 * const tplNSB = tuple(Number, String, Boolean);
 * tplNSB(); // [NaN, 'undefined', false]
 * tplNSB(null); // [NaN, 'undefined', false]
 * tplNSB([]); // [NaN, '', false]
 * tplNSB('5'); // [5, 'undefined', false]
 * tplNSB(['1', '2', '3']); // [1, '2', true]
 *
 * @param {Array<Conversion<any, any>>} fns
 * @param {Conversion<any, Array<any>>} initiator
 * @returns {Conversion<any, Array<any>>}
 */
export const tuple = (fns: Array<Conversion<any, any>>, initiator: Conversion<any, Array<any>> = presets.array.convert): Conversion<any, Array<any>> => {
	if (!Array.isArray(fns)) {
		throw new Converter.InvalidConversionFunction('first argument must be an array', fns);
	}

	fns.forEach((fn, index) => {
		if (!isConversion(fn)) {
			throw new Converter.InvalidConversionFunction('conversion ' + index + ' must be a function', [index, fn]);
		}
	});

	if (!isConversion(initiator)) {
		throw new Converter.InvalidConversionFunction('initiator must be a function', initiator);
	}

	return (input: any) => {
		const array = initiator(input);
		return fns.map((fn, index) => fn(array[index]));
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
 * @param {Fallback<T>} fallback - fallback generator
 * @param {Conversion<any, T>} conversion - input data conversion
 * @returns {Conversion<any, T>}
 */
export const range = <T = number>(
	lower: T = -Number.MAX_VALUE as any,
	upper: T = Number.MAX_VALUE as any,
	fallback?: Fallback<T>,
	conversion: Conversion<any, T> = presets.double.convert as any
): Conversion<any, T> => {
	assertConversion(conversion);

	lower = conversion(lower);
	upper = conversion(upper);

	const fallbackActual = fallback === undefined
		? (input?: any) => {
			const converted = conversion(input);
			return upper <= converted ? upper : lower;
		}
		: fallback;

	assertFallback(fallbackActual);

	return (input?: any) => {
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
 * const var123 = variants([1, 2, 3]);
 * var123(1); // 1
 * var123(2); // 2
 * var123(3); // 3
 * var123(4); // 1
 *
 * const var123WithCustomFallback = variant([1, 2, 3], () => 3);
 * var123WithCustomFallback(4); // 3
 *
 * var123WithPoorFallback([1, 2, 3], () => 99);
 * var123WithPoorFallback(4); // throws an Error
 *
 * const varABC = variant(['a', 'b'], (i) => ['a', 'b'][i], String);
 * varABC('a'); // 'a'
 * varABC('b'); // 'b'
 * varABC(0); // 'a'
 * varABC(1); // 'b'
 *
 * @param {Array<T>} values - valid values дшые
 * @param {Fallback<T>} fallback - fallback value generator
 * @param {Conversion<any, T>} conversion - input data conversion
 * @returns {Conversion<any, T>}
 */
export const variant = <T = number>(
	values: Array<T> = [],
	fallback: Fallback<T> = () => values[0] as any,
	conversion: Conversion<any, T> = presets.double.convert as any
): Conversion<any, T> => {
	assertConversion(conversion);
	assertFallback(fallback);

	if (!Array.isArray(values)) {
		throw new InvalidArgument('variant values must be an array of allowed values', values);
	}
	values = values.map((value) => conversion(value));

	return (input?: any) => {
		const converted = conversion(input);
		if (values.includes(converted)) {
			return converted;
		}

		return fallback(input);
	};
};

