import EV from './ErrorValue';
import { Names as TypeNames, Type, TypesEnum } from '../constants/types';

export type Guard<T> = (input?: unknown) => input is T;

export default {
	/**
	 * @example
	 * const isString = type('string');
	 * isString(1); // false
	 * isString('1'); // true
	 */
	type: <Name extends TypeNames>(type: Name) => {
		if (type in TypesEnum) {
			return ((input?: unknown) => typeof input === type) as Guard<Type<Name>>;
		} else {
			throw new EV('unknown type', type);
		}
	},

	/**
	 * @example
	 * class Test {}
	 * const isTest = instance(Test);
	 * isTest({}); // false
	 * isTest(new Test()); // true
	 */
	instance: <T>(prototype: T) => {
		if ((typeof prototype === 'object' && prototype !== null) || typeof prototype === 'function') {
			/* @ts-ignore */
			return ((input?: unknown) => input instanceof prototype) as Guard<T>;
		} else {
			throw new EV('invalid prototype', prototype);
		}
	},

	/**
	 * @example
	 * const isVariant = variant([1, 2, 3]);
	 * isVariant(4); // false
	 * isVariant(3); // true
	 */
	variant: <T>(list: Array<T>) => {
		if (Array.isArray(list)) {
			return ((input?: unknown) => list.includes(input as T)) as Guard<T>;
		} else {
			throw new EV('invalid variants list', list);
		}
	},

	/**
	 * @example
	 * const isOdd = check((v) => v % 2 ? true : false);
	 * isOdd(0); // false
	 * isOdd(1); // true
	 */
	check: <T>(guard: Guard<T>) => {
		if (typeof guard === 'function') {
			return guard;
		} else {
			throw new EV('invalid guard', guard);
		}
	},
};
