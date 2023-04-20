import EV from './Error';

// eslint-disable-next-line
export class InvalidCheckFunction extends EV {};
// eslint-disable-next-line
export class InvalidFallbackFunction extends EV {};
// eslint-disable-next-line
export class InvalidConvertFunction extends EV {};
// eslint-disable-next-line
export class InvalidConverter extends EV {};

type Convert<INPUT, OUTPUT> = (input: INPUT) => OUTPUT;
type IS<T> = (input: any) => input is T;

/**
 * @description Converts input data to specific type
 */
export class Converter<T> {
	is: IS<T>;
	fallback: () => T;

	protected _types: Record<string, Convert<any, T>>;
	protected _converters: Map<IS<any>, Convert<any, T>>;

	/**
	 * @param {IS} is - input data type checker
	 * @param {() => T} fallback- default value generator
	 */
	constructor(is: IS<T>, fallback: () => T) {
		if (typeof is === 'function') {
			this.is = is;
		} else {
			throw new InvalidCheckFunction('first argument must be a function', is);
		}

		if (typeof fallback  === 'function') {
			this.fallback = fallback;
		} else {
			throw new InvalidFallbackFunction('second argument must be a function', fallback);
		}

		this._types = {};
		this._converters = new Map();

		Object.freeze(this);
	}

	get types() {
		return Object.entries(this._types);
	}

	get converters() {
		return Array.from(this._converters);
	}

	/**
	 * @description converts data according to saved rules
	 * @param {any} i - input data
	 */
	convert = (i: any): T => {
		if (this.is(i)) return i;

		const type = typeof i;
		if (type in this._types) {
			const convert = this._types[type] as Convert<any, T>;
			return convert(i);
		} else {
			for (const is of this._converters.keys()) {
				if (is(i)) {
					const convert = this._converters.get(is) as Convert<any, T>;
					return convert(i);
				}
			}
		}
		return this.fallback();
	}

	/**
	 * @description add `type checker` & `conversion rule` pair into conversions set
	 * @param {IS} is - input data type checker
	 * @param {Converter<any, T>} converter - conversion rule
	 */
	register<INPUT>(is: IS<INPUT>, convert: Convert<INPUT, T>) {
		if (typeof is !== 'function') {
			throw new InvalidCheckFunction('first argument must be a function', is);
		}
		if (typeof convert !== 'function') {
			throw new InvalidConvertFunction('second argument must be a function', convert);
		}

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
	 * @description conversion rule for `undefined`
	 */
	undefined(convert: Convert<undefined, T>) {
		this._types.undefined = convert;
		return this;
	}

	/**
	 * @description conversion rule for `boolean`
	 */
	boolean(convert: Convert<boolean, T>) {
		this._types.boolean = convert;
		return this;
	}

	/**
	 * @description conversion rule for `number`
	 */
	number(convert: Convert<number, T>) {
		this._types.number = convert;
		return this;
	}

	/**
	 * @description conversion rule for `bigint`
	 */
	bigint(convert: Convert<bigint, T>) {
		this._types.bigint = convert;
		return this;
	}

	/**
	 * @description conversion rule for `string`
	 */
	string(convert: Convert<string, T>) {
		this._types.string = convert;
		return this;
	}

	/**
	 * @description conversion rule for `symbol`
	 */
	symbol(convert: Convert<symbol, T>) {
		this._types.symbol = convert;
		return this;
	}

	static assert(instance: any) {
		if (instance instanceof Converter) {
			return true;
		} else {
			throw new InvalidConverter('Is not an instance of Converter', instance);
		}
	}
}

export default Converter;
