import { Convert } from './Converter';
import * as presets from './presets';
import EV from './Error';

/**
 * @namespace utils
 * @description extra utils functions
 */

// eslint-disable-next-line
export class InvalidConvert extends EV {
}

// eslint-disable-next-line
export class InvalidInitiator extends EV {
}

/**
 * @name array
 * @memberof utils
 * @example
 * const numArray = array(Number);
 * numArray(); // []
 * numArray([]); // []
 * numArray([true, 2, "3", {}]); // [1, 2, 3, NaN]
 */
export const array = <T>(fn: Convert<any, T>, initiator = presets.array.convert) => {
	if (typeof fn !== 'function') {
		throw new InvalidConvert('convert must be a function', fn);
	}

	if (typeof initiator !== 'function') {
		throw new InvalidInitiator('initiator must be a function', initiator);
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
 */
export const tuple = (fns: Array<Convert<any, any>>, initiator = presets.array.convert) => {
	if (!Array.isArray(fns)) {
		throw new InvalidConvert('first argument must be an array', fns);
	}

	fns.forEach((fn, index) => {
		if (typeof fn !== 'function') {
			throw new InvalidConvert('convert ' + index + ' must be a function', [index, fn]);
		}
	});

	if (typeof initiator !== 'function') {
		throw new InvalidInitiator('initiator must be a function', initiator);
	}

	return (input: any) => {
		const array = initiator(input);
		return fns.map((fn, index) => fn(array[index]));
	};
};

