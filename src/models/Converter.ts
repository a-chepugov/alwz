import EV from './Error';

export type IS<T> = (input?: unknown) => input is T;

export function isIS<T>(input?: unknown): input is IS<T> {
	return typeof input === 'function';
}

export function assertIS<T>(input?: unknown): true | never {
	if (isIS<T>(input)) return true;
	throw new Converter.InvalidTypeCheckFunction('type check must be a function', input);
}

export type Fallback<OUTPUT> = (input?: unknown) => OUTPUT | never;

export function isFallback<OUTPUT>(input?: unknown): input is Fallback<OUTPUT> {
	return typeof input === 'function';
}

export function assertFallback<OUTPUT>(input?: unknown): true | never {
	if (isFallback<OUTPUT>(input)) return true;
	throw new Converter.InvalidFallbackFunction('fallback must be a function', input);
}

export type Conversion<INPUT, OUTPUT> = (this: Converter<OUTPUT>, input: INPUT) => OUTPUT;

export function isConversion<INPUT, OUTPUT>(input: unknown): input is Conversion<INPUT, OUTPUT> {
	return typeof input === 'function';
}

export function assertConversion<INPUT, OUTPUT>(input: unknown): true | never {
	if (isConversion<INPUT, OUTPUT>(input)) return true;
	throw new Converter.InvalidConversionFunction('conversion must be a function', input);
}

type Types = {
	undefined: undefined,
	boolean: boolean,
	number: number,
	bigint: bigint,
	string: string,
	symbol: symbol,
}

type TypeName = keyof Types;

type TypeConverters<OUTPUT> = {
	[Key in keyof Types]?: Conversion<Types[Key], OUTPUT>;
};

/**
 * @description converts input data to specific type
 * - at first checks if conversion is necessary
 * - then attempts conversion based on the input data type
 * - searches among registered conversions if no matching type is found
 * - generates a fallback value if no suitable conversion can be found
 *
 * @example <caption>converter creation</caption>
 * const positive = new Converter(
 *   (input) => typeof input === 'number' && input > 0,
 *   (input) => input === 0 ? 0.1 : 0.2
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
 * @example <caption>conversion with prohibited input types</caption>
 * const converter = new Converter(
 *   (input) => typeof input === 'number',
 *   (input) => {
 *     throw new Error('unknown input data type:' + input);
 *   })
 *   .string((i) => {
 *     throw new Error('string input is forbidden:' + i);
 *   })
 *   .boolean(Number)
 *   .register(Array.isArray, (i) => converter.convert(i[0]));
 *
 * converter.convert(true); // 1
 * converter.convert(2); // 2
 * converter.convert('3'); // Error
 * converter.convert([4]); // 4
 * converter.convert(Promise.resolve(5)); // Error
 */
export class Converter<OUTPUT> {

	static InvalidTypeCheckFunction = class extends EV {};
	static InvalidFallbackFunction = class extends EV {};
	static InvalidConversionFunction = class extends EV {};
	static InvalidConverter = class extends EV {};

	// @ts-ignore
	_is: IS<OUTPUT>;
	// @ts-ignore
	_fallback: Fallback<OUTPUT>;

	protected _types: TypeConverters<OUTPUT>;
	protected _conversions: Map<IS<any>, Conversion<any, OUTPUT>>;

	/**
	 * @param {IS<OUTPUT>} is - initial input data type checker(predicate). determines if any conversion is necessary
	 * @param {Fallback<OUTPUT>} fallback - fallback value generator. runs if none of the available conversions are suitable
	 */
	constructor(is: IS<OUTPUT>, fallback: Fallback<OUTPUT>) {
		this.is = is;
		this.fallback = fallback;

		this._types = {};
		this._conversions = new Map();

		Object.seal(this);
	}

	get is() {
		return this._is;
	}

	set is(is: IS<OUTPUT>) {
		assertIS(is);
		this._is = is;
	}

	get fallback() {
		return this._fallback;
	}

	set fallback(fallback: Fallback<OUTPUT>) {
		assertFallback(fallback);
		this._fallback = fallback;
	}

	get types(): TypeConverters<OUTPUT> {
		return Object.assign({}, this._types);
	}

	get conversions(): Array<[IS<unknown>, Conversion<unknown, OUTPUT>]> {
		return Array.from(this._conversions);
	}

	/**
	 * @description converts data according to saved conversion rules
	 * @param {*} input - input data
	 */
	convert = (input?: unknown): OUTPUT => {
		if (this._is(input)) return input;

		const type = (typeof input) as TypeName;
		if (type in this._types) {
			const conversion = this._types[type] as Conversion<typeof input, OUTPUT>;
			return conversion.call(this, input);
		} else {
			for (const is of this._conversions.keys()) {
				if (is(input)) {
					const conversion = this._conversions.get(is) as Conversion<typeof input, OUTPUT>;
					return conversion.call(this, input);
				}
			}
		}
		return this._fallback(input);
	};

	/**
	 * @description adds conversion function for `INPUT` type
	 * @param {IS<INPUT>} is - input data type checker(predicate), determines if input can be processed by `conversion`
	 * @param {Conversion<INPUT, OUTPUT>} conversion - `INPUT` to `OUTPUT` conversion function
	 */
	register<INPUT>(is: IS<INPUT>, conversion: Conversion<INPUT, OUTPUT>) {
		assertIS(is);
		assertConversion(conversion);
		this._conversions.set(is, conversion);
		return this;
	}

	/**
	 * @description removes conversion for `INPUT` type
	 * @param {IS<INPUT>} is - input type checker(predicate)
	 */
	unregister<INPUT>(is: IS<INPUT>) {
		assertIS(is);
		this._conversions.delete(is);
		return this;
	}

	/**
	 * @description set conversion rule setter for `types`
	 */
	type(type: TypeName, conversion?: Conversion<unknown, OUTPUT>) {
		if (conversion === undefined) {
			delete this._types[type];
		} else {
			assertConversion(conversion);
			this._types[type] = conversion as Conversion<unknown, OUTPUT>;
		}
		return this;
	}

	/**
	 * @description conversion rule setter for `undefined` input
	 */
	undefined(conversion?: Conversion<undefined, OUTPUT>) {
		return this.type('undefined', conversion);
	}

	/**
	 * @description conversion rule setter for `boolean` input
	 */
	boolean(conversion?: Conversion<boolean, OUTPUT>) {
		return this.type('boolean', conversion);
	}

	/**
	 * @description conversion rule setter for `number` input
	 */
	number(conversion?: Conversion<number, OUTPUT>) {
		return this.type('number', conversion);
	}

	/**
	 * @description conversion rule setter for `bigint` input
	 */
	bigint(conversion?: Conversion<bigint, OUTPUT>) {
		return this.type('bigint', conversion);
	}

	/**
	 * @description conversion rule setter for `string` input
	 */
	string(conversion?: Conversion<string, OUTPUT>) {
		return this.type('string', conversion);
	}

	/**
	 * @description conversion rule setter for `symbol` input
	 */
	symbol(conversion?: Conversion<symbol, OUTPUT>) {
		return this.type('symbol', conversion);
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
		return Converter.build(this.is, this.fallback, this.types, this.conversions);
	}

	static build<OUTPUT>(
		is: IS<OUTPUT>,
		fallback: Fallback<OUTPUT>,
		types: Partial<Record<TypeName, Conversion<any, OUTPUT>>> = {},
		conversions: Array<[IS<any>, Conversion<any, OUTPUT>]> = []
	) {
		const converter = new Converter(is, fallback);
		const typesList = Object.entries(types) as Array<[TypeName, Conversion<any, OUTPUT>]>;
		typesList.forEach(([type, conversion]: [TypeName, Conversion<any, OUTPUT>]) => converter.type(type, conversion));
		conversions.forEach(([is, conversion]: [IS<OUTPUT>, Conversion<any, OUTPUT>]) => converter.register(is, conversion));
		return converter;
	}

	static is = (input?: unknown) => input instanceof Converter;

	static assert(input?: unknown) {
		if (Converter.is(input)) return true;
		throw new Converter.InvalidConverter('input is not a Converter', input);
	}
}

export default Converter;

