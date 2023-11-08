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

	static InvalidCheckFunction = class extends EV {};
	static InvalidFallbackFunction = class extends EV {};
	static InvalidConvertFunction = class extends EV {};
	static InvalidConverter = class extends EV {};

	is: IS<T>;
	fallback: Fallback<T>;

	protected _types: Record<string, Convert<any, T>>;
	protected _converters: Map<IS<any>, Convert<any, T>>;

	/**
	 * @param {IS<T>} is - input data type checker
	 * @param {Fallback<T>} fallback - default value generator
	 */
	constructor(is: IS<T>, fallback: Fallback<T>) {
		assertIS(is);
		this.is = is;

		assertFallback(fallback);
		this.fallback = fallback;

		this._types = {};
		this._converters = new Map();

		Object.freeze(this);
	}

	get types() {
		return Object.entries(this._types) as Array<[Primitives, Convert<any, T>]>;
	}

	get converters() {
		return Array.from(this._converters);
	}

	/**
	 * @description converts data according to saved rules
	 * @example <caption>converter creation</caption>
	 * const abs = new Converter((input) => typeof input === 'number' && input > 0, () => 1);
	 * abs
	 * 	.undefined(() => 1)
	 * 	.number((i) => {
	 * 		const result = Math.abs(i);
	 * 		return result > 0 ? result : abs.fallback();
	 * 	})
	 * 	.bigint((i) => abs.convert(Number(i)))
	 * 	.string((i) => abs.convert(Number(i)))
	 * 	.symbol((i) => abs.convert(Symbol.keyFor(i)))
	 *
	 * abs.convert(1); // 1
	 * abs.convert(2n); // 2
	 * abs.convert('3'); // 3
	 * abs.convert(-4); // 1
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
		if (this.is(input)) return input;

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
		return this.fallback(input);
	}

	/**
	 * @description add `type checker` & `conversion rule` pair into conversions set
	 * @param {IS} is - input data type checker
	 * @param {Converter<any, T>} converter - conversion rule
	 */
	register<INPUT>(is: IS<INPUT>, convert: Convert<INPUT, T>) {
		assertIS(is);
		assertConvert(convert);

		this._converters.set(is, convert);
		return this;
	}

	/**
	 * @description del `type checker` & `conversion rule` pair from conversions set
	 * @param {IS} is - input data type checker
	 */
	unregister<INPUT>(is: IS<INPUT>) {
		this._converters.delete(is);
		return this;
	}

	/**
	 * @description conversion rule setter for `undefined`
	 */
	undefined(convert: Convert<undefined, T>) {
		this._types.undefined = convert;
		return this;
	}

	/**
	 * @description conversion rule setter for `boolean`
	 */
	boolean(convert: Convert<boolean, T>) {
		this._types.boolean = convert;
		return this;
	}

	/**
	 * @description conversion rule setter for `number`
	 */
	number(convert: Convert<number, T>) {
		this._types.number = convert;
		return this;
	}

	/**
	 * @description conversion rule setter for `bigint`
	 */
	bigint(convert: Convert<bigint, T>) {
		this._types.bigint = convert;
		return this;
	}

	/**
	 * @description conversion rule setter for `string`
	 */
	string(convert: Convert<string, T>) {
		this._types.string = convert;
		return this;
	}

	/**
	 * @description conversion rule setter for `symbol`
	 */
	symbol(convert: Convert<symbol, T>) {
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
		this.types.forEach(([name, convert]: [Primitives, Convert<any, T>]) => converter[name](convert));
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

