import EV from './Error';

export type IS<T> = (input: any) => input is T;

export function isIS<T>(input: any): input is IS<T> {
	return typeof input === 'function';
}

export function assertIS<T>(input: any): boolean | never {
	if (isIS<T>(input)) return true;
	throw new Converter.InvalidTypeCheckFunction('type checker must be a function', input);
}

// eslint-disable-next-line no-unused-vars
export type Fallback<OUTPUT> = (input?: any) => OUTPUT | never;

export function isFallback<OUTPUT>(input: any): input is Fallback<OUTPUT> {
	return typeof input === 'function';
}

export function assertFallback<OUTPUT>(input: any): boolean | never {
	if (isFallback<OUTPUT>(input)) return true;
	throw new Converter.InvalidFallbackFunction('fallback must be a function', input);
}

// eslint-disable-next-line no-unused-vars
export type Convert<INPUT, OUTPUT> = (input: INPUT) => OUTPUT;

export function isConvert<INPUT, OUTPUT>(input: any): input is Convert<INPUT, OUTPUT> {
	return typeof input === 'function';
}

export function assertConvert<INPUT, OUTPUT>(input: any): boolean | never {
	if (isConvert<INPUT, OUTPUT>(input)) return true;
	throw new Converter.InvalidConvertFunction('convert must be a function', input);
}

type Primitives = 'undefined' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol';

/**
 * @description converts input data to specific type
 */
export class Converter<T> {

	static InvalidTypeCheckFunction = class extends EV {};
	static InvalidFallbackFunction = class extends EV {};
	static InvalidConvertFunction = class extends EV {};
	static InvalidConverter = class extends EV {};

	// @ts-ignore
	_is: IS<T>;
	// @ts-ignore
	_fallback: Fallback<T>;

	protected _types: Record<string, Convert<any, T>>;
	protected _converters: Map<IS<any>, Convert<any, T>>;

	/**
	 * @param {IS<T>} is - default input type checker. checks if conversion is necessary
	 * @param {Fallback<T>} fallback - default value generator. runs if none of the available converters are suitable
	 */
	constructor(is: IS<T>, fallback: Fallback<T>) {
		this.is = is;
		this.fallback = fallback;

		this._types = {};
		this._converters = new Map();

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

	get types() {
		return Object.assign({}, this._types);
	}

	get converters() {
		return Array.from(this._converters);
	}

	/**
	 * @description converts data according to saved rules
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
	 * const converter = new Converter((input) => typeof input === 'number', (i) => {
	 *   throw new Error('Invalid source data: ' + i);
	 * })
	 *  .string((i) => converter.convert(Number(i)))
	 * ;
	 *
	 * converter.convert(1); // 1
	 * converter.convert('2'); // 2
	 * converter.convert(3n); // Error
	 *
	 * @param {*} input - input data
	 */
	convert = (input: any): T => {
		if (this._is(input)) return input;

		const type = typeof input;
		if (type in this._types) {
			const convert = this._types[type] as Convert<any, T>;
			return convert.call(this, input);
		} else {
			for (const is of this._converters.keys()) {
				if (is(input)) {
					const convert = this._converters.get(is) as Convert<any, T>;
					return convert.call(this, input);
				}
			}
		}
		return this._fallback(input);
	}

	/**
	 * @description add transform function for `INPUT` type
	 * @param {IS<INPUT>} is - input type checker, determines if input can be processed by `convert`
	 * @param {Convert<INPUT, T>} convert - `INPUT` to `T` convert function
	 */
	register<INPUT>(is: IS<INPUT>, convert: Convert<INPUT, T>) {
		assertIS(is);
		assertConvert(convert);

		this._converters.set(is, convert);
		return this;
	}

	/**
	 * @description remove transform function for `INPUT` type from conversions list
	 * @param {IS<INPUT>} is - input type checker
	 */
	unregister<INPUT>(is: IS<INPUT>) {
		this._converters.delete(is);
		return this;
	}

	/**
	 * @description conversion rule setter for `undefined` input
	 */
	undefined(convert: Convert<undefined, T>) {
		assertConvert(convert);
		this._types.undefined = convert;
		return this;
	}

	/**
	 * @description conversion rule setter for `boolean` input
	 */
	boolean(convert: Convert<boolean, T>) {
		assertConvert(convert);
		this._types.boolean = convert;
		return this;
	}

	/**
	 * @description conversion rule setter for `number` input
	 */
	number(convert: Convert<number, T>) {
		assertConvert(convert);
		this._types.number = convert;
		return this;
	}

	/**
	 * @description conversion rule setter for `bigint` input
	 */
	bigint(convert: Convert<bigint, T>) {
		assertConvert(convert);
		this._types.bigint = convert;
		return this;
	}

	/**
	 * @description conversion rule setter for `string` input
	 */
	string(convert: Convert<string, T>) {
		assertConvert(convert);
		this._types.string = convert;
		return this;
	}

	/**
	 * @description conversion rule setter for `symbol` input
	 */
	symbol(convert: Convert<symbol, T>) {
		assertConvert(convert);
		this._types.symbol = convert;
		return this;
	}

	/**
	 * @example
	 * const converter = new Converter((i) => typeof i === 'number', () => 0).undefined(() => 1);
	 * const clone = converter.clone().undefined(() => 2)
	 * converter.convert(); // 1
	 * clone.convert(); // 2
	*/
	clone() {
		const converter = new Converter(this.is, this.fallback);
		const types = Object.entries(this._types) as Array<[Primitives, Convert<any, T>]>;
		types.forEach(([name, convert]: [Primitives, Convert<any, T>]) => converter[name](convert));
		this.converters.forEach(([is, convert]: [IS<T>, Convert<any, T>]) => converter.register(is, convert));
		return converter;
	}

	static is = (input: any) => input instanceof Converter;

	static assert(input: any) {
		if (Converter.is(input)) return true;
		throw new Converter.InvalidConverter('input is not an instance of Converter', input);
	}
}

export default Converter;

