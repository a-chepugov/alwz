import EV from './ErrorValue.js';

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

type TypesMap = {
	undefined: undefined,
	boolean: boolean,
	number: number,
	bigint: bigint,
	string: string,
	symbol: symbol,
}

type TypeConversions<OUTPUT> = {
	[Name in keyof TypesMap]: Conversion<TypesMap[Name], OUTPUT>;
};

type TypeConversion<Name, OUTPUT> = Name extends keyof TypeConversions<OUTPUT> ? TypeConversions<OUTPUT>[Name] : never;

/**
 * @description converts input data to specific type
 * - at first checks if conversion is necessary
 * - attempts conversion based on the input data type
 * - searches for suitable conversions among registered
 * - calls a fallback function
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
	protected _is: IS<OUTPUT>;
	// @ts-ignore
	protected _fallback: Fallback<OUTPUT>;

	protected _types: Partial<TypeConversions<OUTPUT>>;
	protected _conversions: Map<IS<any>, Conversion<any, OUTPUT>>;

	/**
	 * @param {IS<OUTPUT>} is - initial input data type check (predicate). determines if any conversion is necessary
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

	get types(): Partial<TypeConversions<OUTPUT>> {
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

		const type = (typeof input) as keyof TypesMap;
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
	 * @param {IS<INPUT>} is - input data type check (predicate), determines if input can be processed by `conversion`
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
	 * @param {IS<INPUT>} is - input type check (predicate)
	 */
	unregister<INPUT>(is: IS<INPUT>) {
		assertIS(is);
		this._conversions.delete(is);
		return this;
	}

	/**
	 * @description set conversion rule for type `name` if `conversion` is defined or unset if undefined
	 * @param {string} name - one of types (`typeof` result)
	 * @param {Conversion} [conversion]
	 */
	type<Name extends keyof TypesMap>(name: Name, conversion?: TypeConversion<Name, OUTPUT>) {
		if (conversion === undefined) {
			delete this._types[name];
		} else {
			assertConversion(conversion);
			this._types[name] = conversion;
		}
		return this;
	}

	/**
	 * @description conversion rule setter for `undefined` input
	 * @param {Conversion} [conversion]
	 */
	undefined(conversion?: Conversion<undefined, OUTPUT>) {
		return this.type('undefined', conversion);
	}

	/**
	 * @description conversion rule setter for `boolean` input
	 * @param {Conversion} [conversion]
	 */
	boolean(conversion?: Conversion<boolean, OUTPUT>) {
		return this.type('boolean', conversion);
	}

	/**
	 * @description conversion rule setter for `number` input
	 * @param {Conversion} [conversion]
	 */
	number(conversion?: Conversion<number, OUTPUT>) {
		return this.type('number', conversion);
	}

	/**
	 * @description conversion rule setter for `bigint` input
	 * @param {Conversion} [conversion]
	 */
	bigint(conversion?: Conversion<bigint, OUTPUT>) {
		return this.type('bigint', conversion);
	}

	/**
	 * @description conversion rule setter for `string` input
	 * @param {Conversion} [conversion]
	 */
	string(conversion?: Conversion<string, OUTPUT>) {
		return this.type('string', conversion);
	}

	/**
	 * @description conversion rule setter for `symbol` input
	 * @param {Conversion} [conversion]
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
		return Converter.build(this._is, this._fallback, this._types, this._conversions);
	}

	static build<OUTPUT>(
		is: IS<OUTPUT>,
		fallback: Fallback<OUTPUT>,
		types: Partial<TypeConversions<OUTPUT>> = {},
		conversions: Iterable<[IS<any>, Conversion<any, OUTPUT>]> = []
	) {
		const converter = new Converter(is, fallback);

		for (const type in types) {
			converter.type(
				type as keyof TypesMap,
				types[type as keyof TypesMap]
			);
		}

		for (const [is, conversion] of conversions) {
			converter.register(is, conversion);
		}

		return converter;
	}

	static is = (input?: unknown) => input instanceof Converter;

	static assert(input?: unknown) {
		if (Converter.is(input)) return true;
		throw new Converter.InvalidConverter('input is not a Converter', input);
	}
}

export default Converter;

