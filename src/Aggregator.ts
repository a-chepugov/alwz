import Converter from './Converter';
import EV from './Error';

// eslint-disable-next-line
export class DuplicateConvertor extends EV {};
// eslint-disable-next-line
export class InvalidConverter extends EV {};
// eslint-disable-next-line
export class AbsentConverter extends EV {};

/**
 * @description Aggregates converters
 */
export class Aggregator {
	protected _converters: Map<string, Converter<any>>;

	constructor() {
		this._converters = new Map();
		Object.freeze(this);
	}

	get converters() {
		return Array.from(this._converters);
	}

	/**
	 * @description add converter
	 */
	register(name: string, converter: Converter<any>) {
		if (this._converters.has(name)) {
			throw new DuplicateConvertor('converter has already been registered', name);
		} else {
			if (converter instanceof Converter) {
				this._converters.set(name, converter);
			} else {
				throw new InvalidConverter('must be an instance of Converter', converter);
			}
		}
		return this;
	}

	/**
	 * @description del converter
	 */
	unregister(name: string) {
		this._converters.delete(name);
		return this;
	}

	/**
	 * @description seek converter by name
	 */
	converter = (name: string): Converter<any> => {
		if (this._converters.has(name)) {
			return this._converters.get(name) as Converter<any>;
		} else {
			throw new AbsentConverter('converter has not been registered', name);
		}
	}

	/**
	 * @description generate simple function to convert data
	 */
	to = (name: any) => this.converter(name).convert

	get size() {
		return this._converters.size;
	}
}

export default Aggregator;
