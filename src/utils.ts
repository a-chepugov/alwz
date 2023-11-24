import Converter, { Convert, isConvert, assertConvert } from './Converter';
import * as presets from './presets';

/**
 * @namespace utils
 * @description extra utils functions
 */

/**
 * @name array
 * @memberof utils
 * @example
 * const numArray = array(Number);
 * numArray(); // []
 * numArray([]); // []
 * numArray([true, 2, "3", {}]); // [1, 2, 3, NaN]
 *
 * @param {Convert<any, T>} fn
 * @param {Convert<any, Array<any>>} initiator
 * @return {(input?: any) => Array<T>}
 * @returns {Convert<any, Array<T>>}
 */
export const array = <T>(fn: Convert<any, T>, initiator: Convert<any, Array<any>> = presets.array.convert): Convert<any, Array<T>> => {
	assertConvert(fn);

	if (!isConvert(initiator)) {
		throw new Converter.InvalidConvertFunction('initiator must be a function', initiator);
	}

	return (input: any) => {
		return initiator(input).map(fn);
	};
};

/**
 * @name tuple
 * @memberof utils
 * @example
 * const tplNSB = tuple(Number, String, Boolean);
 * tplNSB(); // [NaN, 'undefined', false]
 * tplNSB(null); // [NaN, 'undefined', false]
 * tplNSB([]); // [NaN, '', false]
 * tplNSB('5'); // [5, 'undefined', false]
 * tplNSB(['1', '2', '3']); // [1, '2', true]
 *
 * @param {Array<Convert<any, any>>} fns
 * @param {Convert<any, Array<any>>} initiator
 * @returns {Convert<any, Array<any>>}
 */
export const tuple = (fns: Array<Convert<any, any>>, initiator: Convert<any, Array<any>> = presets.array.convert): Convert<any, Array<any>> => {
	if (!Array.isArray(fns)) {
		throw new Converter.InvalidConvertFunction('first argument must be an array', fns);
	}

	fns.forEach((fn, index) => {
		if (!isConvert(fn)) {
			throw new Converter.InvalidConvertFunction('convert ' + index + ' must be a function', [index, fn]);
		}
	});

	if (!isConvert(initiator)) {
		throw new Converter.InvalidConvertFunction('initiator must be a function', initiator);
	}

	return (input: any) => {
		const array = initiator(input);
		return fns.map((fn, index) => fn(array[index]));
	};
};

