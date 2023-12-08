import EV from './Error';

export type IS<T> = (input: any) => input is T;

export function isIS<T>(instance: any): instance is IS<T> {
	return typeof instance === 'function';
}

export function assertIS<T>(instance: any): boolean | never {
	if (isIS<T>(instance)) return true;
	throw new Converter.InvalidTypeCheckFunction('type check must be a function', instance);
}

export type Fallback<OUTPUT> = (input?: any) => OUTPUT | never;

export function isFallback<OUTPUT>(instance: any): instance is Fallback<OUTPUT> {
	return typeof instance === 'function';
}

export function assertFallback<OUTPUT>(instance: any): boolean | never {
	if (isFallback<OUTPUT>(instance)) return true;
	throw new Converter.InvalidFallbackFunction('fallback must be a function', instance);
}

export type Conversion<INPUT, OUTPUT> = (input: INPUT) => OUTPUT;

export function isConversion<INPUT, OUTPUT>(instance: any): instance is Conversion<INPUT, OUTPUT> {
	return typeof instance === 'function';
}

export function assertConversion<INPUT, OUTPUT>(instance: any): boolean | never {
	if (isConversion<INPUT, OUTPUT>(instance)) return true;
	throw new Converter.InvalidConversionFunction('conversion must be a function', instance);
}

type Types = 'undefined' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol';

/**
 * @description converts input data to specific type
 * - at first checks if conversion is necessary
 * - then attempts conversion based on the input data type
 * - searches among registered conversions if no matching type is found
 * - generates a fallback value if no suitable conversion can be found
 */
export class Converter<T> {

	static InvalidTypeCheckFunction = class extends EV {};
	static InvalidFallbackFunction = class extends EV {};
	static InvalidConversionFunction = class extends EV {};
	static InvalidConverter = class extends EV {};

	// @ts-ignore
	_is: IS<T>;
	// @ts-ignore
	_fallback: Fallback<T>;

	protected _types: Partial<Record<Types, Conversion<any, T>>>;
	protected _conversions: Map<IS<any>, Conversion<any, T>>;

	/**
	 * @param {IS<T>} is - initial input type checker. determines if any conversion is necessary
	 * @param {Fallback<T>} fallback - default value generator. runs if none of the available conversions are suitable
	 */
	constructor(is: IS<T>, fallback: Fallback<T>) {
		this.is = is;
		this.fallback = fallback;

		this._types = {} as Partial<Record<Types, Conversion<any, T>>>;
		this._conversions = new Map();

		Object.seal(this);
	}

	get is() {
		return this._is;
	}

	set is(is: IS<T>) {
		assertIS(is);
		this._is = is;
	}

	get fallback() {
		return this._fallback;
	}

	set fallback(fallback: Fallback<T>) {
		assertFallback(fallback);
		this._fallback = fallback;
	}

	get types(): Partial<Record<Types, Conversion<any, T>>> {
		return Object.assign({}, this._types);
	}

	get conversions(): Array<[IS<any>, Conversion<any, T>]> {
		return Array.from(this._conversions);
	}

	/**
	 * @description converts data according to saved conversion rules
	 * @example <caption>converter creation</caption>
	 * const positive = new Converter(
	 *   (input) => typeof input === 'number' && input > 0,
	 *   (i) => i === 0 ? 0.1 : 0.2
	 * );
	 *
	 * positive
	 *   .undefined(() => 0.3)
	 *   .boolean((i) => i ? 1 : 0.4)
	 *   .number(function(i) {
	 *     const result = Math.abs(i)
	 *     return this.is(result) ? result : this.fallback(i);
	 *   })
	 *   .string((i) => positive.convert(Number(i)))
	 *   .symbol((i) => positive.convert(Symbol.keyFor(i)))
	 *   .bigint((i) => positive.convert(Number(i)))
	 *   .register(Array.isArray, (i) => positive.convert(i[0]))
	 *   .register((i) => i === null, (i) => 0.5);
	 *
	 * positive.convert(1); // 1
	 * positive.convert(0); // 0.1 (fallback)
	 * positive.convert(NaN); // 0.2 (fallback)
	 * positive.convert(undefined); // 0.3 (has own handler)
	 * positive.convert(false); // 0.4 (has own handler)
	 * positive.convert(null); // 0.5 (has own handler)
	 * positive.convert(2n); // 2
	 * positive.convert(-3); // 3
	 * positive.convert('4'); // 4
	 * positive.convert([5, 6]); // 5
	 *
	 * @example <caption>converter with conversion error</caption>
	 * const converter = new Converter(
	 *   (input) => typeof input === 'number',
	 *   (input) => {
	 *     throw new Error('Invalid source data: ' + input);
	 *   }
	 * )
	 *  .string((i) => converter.convert(Number(i)));
	 *
	 * converter.convert(1); // 1
	 * converter.convert('2'); // 2
	 * converter.convert(3n); // Error
	 *
	 * @param {*} input - input data
	 */
	convert = (input?: any): T => {
		if (this._is(input)) return input;

		const type = typeof input as Types;
		if (type in this._types) {
			const conversion = this._types[type] as Conversion<any, T>;
			return conversion.call(this, input);
		} else {
			for (const is of this._conversions.keys()) {
				if (is(input)) {
					const conversion = this._conversions.get(is) as Conversion<any, T>;
					return conversion.call(this, input);
				}
			}
		}
		return this._fallback(input);
	}

	/**
	 * @description add transform function for `INPUT` type
	 * @param {IS<INPUT>} is - input type checker, determines if input can be processed by `conversion`
	 * @param {Conversion<INPUT, T>} conversion - `INPUT` to `T` conversion function
	 */
	register<INPUT>(is: IS<INPUT>, conversion: Conversion<INPUT, T>) {
		assertIS(is);
		assertConversion(conversion);

		this._conversions.set(is, conversion);
		return this;
	}

	/**
	 * @description remove transform function for `INPUT` type from conversions list
	 * @param {IS<INPUT>} is - input type checker
	 */
	unregister<INPUT>(is: IS<INPUT>) {
		assertIS(is);

		this._conversions.delete(is);
		return this;
	}

	/**
	 * @description conversion rule setter for `undefined` input
	 */
	undefined(conversion: Conversion<undefined, T>) {
		assertConversion(conversion);
		this._types.undefined = conversion;
		return this;
	}

	/**
	 * @description conversion rule setter for `boolean` input
	 */
	boolean(conversion: Conversion<boolean, T>) {
		assertConversion(conversion);
		this._types.boolean = conversion;
		return this;
	}

	/**
	 * @description conversion rule setter for `number` input
	 */
	number(conversion: Conversion<number, T>) {
		assertConversion(conversion);
		this._types.number = conversion;
		return this;
	}

	/**
	 * @description conversion rule setter for `bigint` input
	 */
	bigint(conversion: Conversion<bigint, T>) {
		assertConversion(conversion);
		this._types.bigint = conversion;
		return this;
	}

	/**
	 * @description conversion rule setter for `string` input
	 */
	string(conversion: Conversion<string, T>) {
		assertConversion(conversion);
		this._types.string = conversion;
		return this;
	}

	/**
	 * @description conversion rule setter for `symbol` input
	 */
	symbol(conversion: Conversion<symbol, T>) {
		assertConversion(conversion);
		this._types.symbol = conversion;
		return this;
	}

	/**
	 * @example
	 * const converter = new Converter(
	 *   (i) => typeof i === 'number',
	 *   () => 0
	 * )
	 *   .undefined(() => 1);
	 *
	 * const clone = converter
	 *   .clone()
	 *   .undefined(() => 2);
	 *
	 * converter.convert(); // 1
	 * clone.convert(); // 2
	*/
	clone() {
		const converter = new Converter(this.is, this.fallback);
		const types = Object.entries(this._types) as Array<[Types, Conversion<any, T>]>;
		types.forEach(([type, conversion]: [Types, Conversion<any, T>]) => converter[type](conversion));
		this._conversions.forEach((conversion: Conversion<any, T>, is: IS<T>) => converter.register(is, conversion));
		return converter;
	}

	static is = (input: any) => input instanceof Converter;

	static assert(input: any) {
		if (Converter.is(input)) return true;
		throw new Converter.InvalidConverter('input is not an instance of Converter', input);
	}
}

export default Converter;

