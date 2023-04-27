import Converter from './Converter';
import EV from './Error';

/**
 * @ignore
 * @example
 * const odd = new Converter((input) => typeof input === 'number' && Boolean(input % 2), () => 1);
 * const even = new Converter((input) => typeof input === 'number' && !(input % 2), () => 2);
 * const Aggregator = new Aggregator();
 * aggregator.register('odd', odd);
 * aggregator.register('even', even);

 * aggregator.to('odd')(3); // 3
 * aggregator.to('odd')(4); // 1
 * aggregator.to('even')(4); // 4
 * aggregator.to('even')(5); // 2
 */
export class Aggregator {

	static DuplicateConvertor = class extends EV {};
	static InvalidConverter = class extends EV {};
	static AbsentConverter = class extends EV {};

	protected _converters: Map<string, Converter<any>>;

	constructor() {
		this._converters = new Map();
		Object.freeze(this);
	}

	get converters() {
		return Array.from(this._converters);
	}

	register(name: string, converter: Converter<any>) {
		if (this._converters.has(name)) {
			throw new Aggregator.DuplicateConvertor('converter has already been registered', name);
		} else {
			if (converter instanceof Converter) {
				this._converters.set(name, converter);
			} else {
				throw new Aggregator.InvalidConverter('must be an instance of Converter', converter);
			}
		}
		return this;
	}

	unregister(name: string) {
		this._converters.delete(name);
		return this;
	}

	get = (name: string): Converter<any> => {
		if (this._converters.has(name)) {
			return this._converters.get(name) as Converter<any>;
		} else {
			throw new Aggregator.AbsentConverter('converter has not been registered', name);
		}
	}

	to = (name: any) => this.get(name).convert;

	get size() {
		return this._converters.size;
	}
}

export default Aggregator;
