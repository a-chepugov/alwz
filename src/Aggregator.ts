import Convertor from './Converter';

/**
 * @description Aggregates converters
 */
export class Aggregator {
	converters: Map<any, Convertor<any>>;

	constructor() {
		this.converters = new Map();
		Object.freeze(this);
	}

	/**
	 * @description add converter
	 */
	register(name: any, converter: Convertor<any>) {
		this.converters.set(name, converter);
		return this;
	}

	/**
	 * @description del converter
	 */
	unregister(name: any) {
		this.converters.delete(name);
		return this;
	}

	/**
	 * @description seek converter by name
	 */
	converter = (name: any): Convertor<any> => {
		if (this.converters.has(name)) {
			const converter = this.converters.get(name);
			if (converter instanceof Convertor) {
				return converter;
			}
		}
		throw new Error(`Unknown converter name: ${name}`);
	}

	/**
	 * @description generate simple function to convert data
	 */
	to = (name: string) => {
		const converter = this.converter(name);
		return (i: any) => converter.convert(i);
	}
}

export default Aggregator;
