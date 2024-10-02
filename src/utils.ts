import EV from './models/Error.js';
import Converter, { Fallback, assertFallback, isConversion, assertConversion } from './models/Converter.js';
import * as presets from './presets.js';

type Conversion<INPUT, OUTPUT> = (input: INPUT) => OUTPUT;

const InvalidArgument = class extends EV {};

/**
 * @namespace utils
 * @description extra utils functions
 * @example
 * const { array, tuple, range, variant, object, dictionary } = a.utils;
 */

/**
 * @memberof utils
 * @description constrain data to an array elements of a given type
 * @example
 * const Numbers = array(Number);
 *
 * Numbers(); // []
 * Numbers([]); // []
 * Numbers([true, 2, "3", {}]); // [1, 2, 3, NaN]
 *
 * @example <caption>sparse arrays behavior</caption>
 * // Be aware of sparse arrays behavior - conversion is not performed for empty items
 * numArray[1, , 3] // [1, , 3]
 * @param {Conversion<*, OUTPUT>} conversion - item conversion
 * @param {Conversion<*, Array<*>>} initiator - input data initial conversion
 * @returns {Conversion<*, Array<OUTPUT>>}
 */
export const array = <OUTPUT>(
	conversion: Conversion<unknown, OUTPUT>,
	initiator: Conversion<unknown, Array<unknown>> = presets.array.convert
): Conversion<unknown, Array<OUTPUT>> => {
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
 * const NumStrBool = tuple([Number, String, Boolean]);
 *
 * NumStrBool(); // [NaN, 'undefined', false]
 * NumStrBool(null); // [NaN, 'undefined', false]
 * NumStrBool([]); // [NaN, '', false]
 * NumStrBool('5'); // [5, 'undefined', false]
 * NumStrBool(['1', '2', '3']); // [1, '2', true]
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
 *
 * range37(1); // 3
 * range37(5); // 5
 * range37(9); // 7
 *
 *
 * const range37WithCustomFallback = range(3, 7, () => -1);
 *
 * range37WithCustomFallback(1); // -1
 * range37WithCustomFallback(5); // 5
 * range37WithCustomFallback(9); // -1
 *
 *
 * const rangeString = range('k', 'w', undefined, String);
 *
 * rangeString('a'); // k
 * rangeString('n'); // n
 * rangeString('z'); // w
 *
 * @param {OUTPUT} lower - lower range border
 * @param {OUTPUT} upper - upper range border
 * @param {Fallback<OUTPUT>} fallback - fallback value generator
 * @param {Conversion<*, OUTPUT>} conversion - input data conversion
 * @returns {Conversion<*, OUTPUT>}
 */
export const range = <OUTPUT = number>(
	lower: OUTPUT = -Number.MAX_VALUE as OUTPUT,
	upper: OUTPUT = Number.MAX_VALUE as OUTPUT,
	fallback?: Fallback<OUTPUT>,
	conversion: Conversion<unknown, OUTPUT> = presets.double.convert as Conversion<unknown, OUTPUT>
): Conversion<unknown, OUTPUT> => {
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
 * const oneOf123 = variant([1, 2, 3]);
 *
 * oneOf123(1); // 1
 * oneOf123(2); // 2
 * oneOf123(3); // 3
 * oneOf123(4); // 1
 * oneOf123(-5); // 1
 *
 *
 * const oneOf123WithCustomFallback = variant([1, 2, 3], () => -1);
 *
 * oneOf123WithCustomFallback(4); // -1
 *
 *
 * oneOf123Strict([1, 2, 3], () => {
 *   throw new Error('invalid input');
 * });
 * oneOf123Strict(4); // throws an Error
 *
 *
 * const oneOfAB = variant(['a', 'b'], (i) => ['a', 'b'][i], String);
 *
 * oneOfAB('a'); // 'a'
 * oneOfAB('b'); // 'b'
 * oneOfAB(0); // 'a'
 * oneOfAB(1); // 'b'
 *
 * @param {Array<OUTPUT>} values - valid values list
 * @param {Fallback<OUTPUT>} fallback - fallback value generator
 * @param {Conversion<*, OUTPUT>} conversion - input data conversion
 * @returns {Conversion<*, OUTPUT>}
 */
export const variant = <OUTPUT = number>(
	values: Array<OUTPUT>,
	fallback: Fallback<OUTPUT> = () => values[0] as OUTPUT,
	conversion: Conversion<unknown, OUTPUT> = presets.double.convert as Conversion<unknown, OUTPUT>
): Conversion<unknown, OUTPUT> => {
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
 * const obj = object({
 *   a: a.ubyte,
 *   b: array(object({
 *     c: a.int,
 *     d: a.string,
 *   })),
 * });
 *
 * obj(undefined); // { a: 0, b: [] }
 * obj({ a: 999, b: [{ c: 2.5, d: 3 }, null] }); // { a: 255, b: [{ c: 2, d: '3' }, { c: 0, d: '' }] }
 *
 * @param {Record<string, Conversion<any, OUTPUT>>} schema
 * @param {Conversion<any, OUTPUT>} conversion - input data conversion
 * @returns {Conversion<any, OUTPUT>}
 */
export const object = <OUTPUT extends object, Keys extends keyof OUTPUT>(
	schema: { [key in Keys]: Conversion<any, OUTPUT[key]> },
	conversion: Conversion<any, any> = presets.object.convert as any
): Conversion<any, OUTPUT> => {
	if (typeof schema !== 'object' || schema === null) {
		throw new InvalidArgument('schema must must be an object', schema);
	}

	for (const key in schema) {
		const conversion = schema[key] as Conversion<any, any>;
		assertConversion(conversion);
	}

	assertConversion(conversion);

	return (input: any) => {
		const result = {} as OUTPUT;
		const source = conversion(input);

		for (const key in schema) {
			const type = schema[key] as Conversion<any, any>;
			result[key] = type(source?.[key]);
		}
		return result;
	};
};

/**
 * @memberof utils
 * @description cast data into a dictionary
 * @example
 * const dictOfInt = utils.dictionary(a.int);
 *
 * dictOfInt(undefined); // { }
 * dictInt({ a: null, b: true, c: '2', d: [3, 4] }); // { a: 0, b: 1, c: 2, d: 3 }
 *
 * @param {(value: any, key: string | number) => VALUE} conversion - item conversion
 * @param {Conversion<any, any>} initiator - input data conversion
 * @returns {Conversion<any, Record<string | number, VALUE>>}
 */
export const dictionary = <KEY extends string | number, VALUE>(
	conversion: (value: unknown, key: KEY) => VALUE,
	initiator : Conversion<unknown, unknown> = presets.object.convert as any
): Conversion<unknown, Record<KEY, VALUE>> => {
	if (typeof conversion !== 'function') {
		throw new InvalidArgument('conversion must be a function', conversion);
	}

	assertConversion(initiator);

	return (input: any) => {
		const result = {} as Record<KEY, VALUE>;
		const source = initiator(input) as Record<KEY, unknown>;

		for (const key in source) {
			result[key] = conversion(source?.[key], key);
		}
		return result;
	};
};

type ProjectionBuild<C, S, O> = (this: C, source: S, options?: O, target?: Partial<ProjectionResult<C, S, O>>) => unknown;

type ProjectionSchema<C, S, O> = {
	[Key: string | number]: ProjectionSchemaItem<C, S, O>
};

type ProjectionSchemaItem<C, S, O> = ProjectionBuild<C, S, O> | ProjectionSchema<C, S, O>;

type ProjectionResult<C, S, O> = {
	[Key in keyof ProjectionSchema<C, S, O>]: unknown | ProjectionResult<C, S, O>
}

/**
 * @description project data into object according to schema
 * @param {Schema} schema
 * @returns {Function}
 * @example
 * const schema = {
 *   // shallow element
 *   a: (source) => source.x + 1,
 *   // nested schema
 *   b: {
 *     c: (source) => source.x + 2,
 *   },
 *   // options ( second argument )
 *   d: (source, options) => options,
 *   // mid-process result access
 *   e: (source, options, target) => { target._e = source.x + 3; },
 *   // call context
 *   f: function() { return this; },
 * };
 *
 * const project = projection(schema);
 * const reshape = project(schema);
 * const source = { x: 1 };
 * const options = { z: 5 };
 * const context = { y: 11 };
 *
 * project.call(context, source, options);
 * {
 *   a: 2,
 *   b: { c: 3 },
 *   d: { z: 5 },
 *   _e: 7, e: undefined,
 *   f: { y: 11 },
 * }
 */
export const projection = <C, S, O>(
	schema: ProjectionSchema<C, S, O>
): ProjectionBuild<C, S, O> => {
	const builders: Array<[string, ProjectionBuild<C, S, O>]> = Object
		.entries(schema)
		.map(([key, value]) => {
			if (typeof value === 'function') {
				return [key, value];
			} else if (value && typeof value === 'object') {
				return [key, projection(value)];
			} else {
				throw new EV('invalid schema item', { key, value });
			}
		});

	return function(this: C, source: S, options?: O) {
		return builders
			.reduce(
				(target: Record<string, unknown>, [key, build]) => {
					target[key] = build.call(this, source, options, target);
					return target;
				},
				{}
			);
	};
};
