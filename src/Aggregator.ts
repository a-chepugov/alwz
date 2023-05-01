import Converter from './Converter';
import EV from './Error';
import Registry from './Registry';

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
export class Aggregator extends Registry<string, Converter<any>> {

	static DuplicateConverter = class extends EV {};
	static InvalidConverter = class extends EV {};
	static AbsentConverter = class extends EV {};

	constructor() {
		super();
		Object.freeze(this);
	}

	get converters() {
		return Array.from(this._items);
	}

	register(name: string, converter: Converter<any>) {
		if (this._items.has(name)) {
			throw new Aggregator.DuplicateConverter('converter has already been registered', name);
		} else {
			if (converter instanceof Converter) {
				this._items.set(name, converter);
			} else {
				throw new Aggregator.InvalidConverter('must be an instance of Converter', converter);
			}
		}
		return this;
	}

	unregister(name: string) {
		this._items.delete(name);
		return this;
	}

	converter = (name: string): Converter<any> => {
		if (this._items.has(name)) {
			return this._items.get(name) as Converter<any>;
		} else {
			throw new Aggregator.AbsentConverter('converter has not been registered', name);
		}
	}

	to = (name: any) => this.converter(name).convert;

}

export default Aggregator;
