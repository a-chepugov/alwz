type Convert<I, O> = (input: I) => O;
type IS = (input: any) => boolean;

/**
 * @description Converts input data to specific type
 */
export class Convertor<T> {
	private primitives: Map<string, Convert<any, T>>;
	private converters: Map<IS, Convert<any, T>>;
	private readonly is: IS;
	readonly fallback: () => T;

	/**
	 * @param {IS} is - input data type checker
	 * @param {() => T} fallback- default value generator
	 */
	constructor(is: IS, fallback: () => T) {
		this.is = is;
		this.primitives = new Map();
		this.converters = new Map();
		this.fallback = fallback;
		Object.freeze(this);
	}

	/**
	 * @description converts data according to saved rules
	 * @param {any} i - input data
	 */
	convert = (i: any): T => {
		if (this.is(i)) {
			return i;
		}
		const type = typeof i;
		let converter: Convert<any, T> | undefined;
		if (this.primitives.has(type)) {
			converter = this.primitives.get(type);
		} else {
			for (const IS of this.converters.keys()) {
				if (IS(i)) {
					converter = this.converters.get(IS);
					break;
				}
			}
		}
		if (converter) {
			return converter(i);
		}
		return this.fallback();
	}

	/**
	 * @description add `type checker` & `conversion rule` pair into conversions set
	 * @param {IS} is - input data type checker
	 * @param {Convertor<any, T>} converter - conversion rule
	 */
	register(is: IS, converter: Convert<any, T>) {
		this.converters.set(is, converter);
		return this;
	}

	/**
	 * @description del `type checker` & `conversion rule` pair from conversions set
	 * @param {IS} is - input data type checker
	 */
	unregister(IS: IS) {
		this.converters.delete(IS);
		return this;
	}

	/**
	 * @description conversion rule for `undefined`
	 */
	undefined(convertor: Convert<undefined, T>) {
		this.primitives.set('undefined', convertor);
		return this;
	}

	/**
	 * @description conversion rule for `boolean`
	 */
	boolean(convertor: Convert<boolean, T>) {
		this.primitives.set('boolean', convertor);
		return this;
	}

	/**
	 * @description conversion rule for `number`
	 */
	number(convertor: Convert<number, T>) {
		this.primitives.set('number', convertor);
		return this;
	}

	/**
	 * @description conversion rule for `bigint`
	 */
	bigint(convertor: Convert<bigint, T>) {
		this.primitives.set('bigint', convertor);
		return this;
	}

	/**
	 * @description conversion rule for `string`
	 */
	string(convertor: Convert<string, T>) {
		this.primitives.set('string', convertor);
		return this;
	}

	/**
	 * @description conversion rule for `symbol`
	 */
	symbol(convertor: Convert<symbol, T>) {
		this.primitives.set('symbol', convertor);
		return this;
	}
}

export default Convertor;
