import Converter, { Conversion, isConversion, assertConversion } from './Converter';
import * as presets from './presets';

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

