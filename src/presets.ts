import Convertor from './Converter';

export const boolean = new Convertor<boolean>((i) => typeof i === 'boolean', () => false);
boolean
	.undefined(boolean.fallback)
	.number(Boolean)
	.bigint(Boolean)
	.string(Boolean)
	.symbol(Boolean)
	.register(Array.isArray, (i) => boolean.convert(i[0]))
	.register((i) => i instanceof Date, (i) => Boolean(i.getTime()))
	.register(() => true, Boolean);


export const number = new Convertor<number>((i) => typeof i === 'number', () => NaN);
number
	.undefined(number.fallback)
	.boolean(Number)
	.bigint(Number)
	.string(Number)
	.symbol((i) => Number(string.convert(i)))
	.register(Array.isArray, (i) => number.convert(i[0]))
	.register((i) => i instanceof Date, (i) => i.getTime());


export const int = new Convertor<number>((i) => typeof i === 'number' && i % 1 === 0, () => 0);
int
	.undefined(int.fallback)
	.boolean(Number)
	.number((i) => {
		const value = Math.floor(i);
		return Number.isFinite(value) ? value : int.fallback();
	})
	.bigint(Number)
	.string((i) => {
		const value = Number.parseInt(i);
		return Number.isFinite(value) ? value : int.fallback();
	})
	.symbol((i) => {
		const value = Number.parseInt(string.convert(i));
		return Number.isFinite(value) ? value : int.fallback();
	})
	.register((i) => i instanceof Date, (i) => {
		const value = i.getTime();
		return Number.isFinite(value) ? value : int.fallback();
	})
	.register(Array.isArray, (i) => int.convert(i[0]));


export const bigint = new Convertor<bigint>((i) => typeof i === 'bigint', () => BigInt(0));
bigint
	.undefined(bigint.fallback)
	.boolean((i) => BigInt(i))
	.number((i) => BigInt(int.convert(i)))
	.string((i) => {
		try {
			return BigInt(i);
		} catch (error) {
			return bigint.fallback();
		}
	})
	.symbol((i) => bigint.convert(string.convert(i)))
	.register((i) => i instanceof Date, (i) => BigInt(int.convert(i)))
	.register(Array.isArray, (i) => bigint.convert(i[0]));


export const string = new Convertor<string>((i) => typeof i === 'string', () => '');
string
	.undefined(string.fallback)
	.boolean((i) => i ? ' ' : string.fallback())
	.number((i) => i === i ? String(i) : string.fallback())
	.bigint(String)
	.symbol((i) => Symbol.keyFor(i) || string.fallback())
	.register((i) => i instanceof Date, (i) => {
		const value = i.getTime();
		return value === value ? i.toISOString() : string.fallback();
	})
	.register(Array.isArray, (i) => string.convert(i[0]))
	.register((i) => i !== null, String);


export const symbol = new Convertor<symbol>((i) => typeof i === 'symbol', () => Symbol.for(''));
symbol
	.register(() => true, (i) => Symbol.for(string.convert(i)));


export const array = new Convertor<Array<any>>(Array.isArray, () => []);
array
	.undefined(array.fallback)
	.string((i) => [i])
	.register((i) => i && i[Symbol.iterator], Array.from)
	.register(() => true, (i) => [i]);


// eslint-disable-next-line @typescript-eslint/ban-types
export const fn = new Convertor<Function>((i) => typeof i === 'function', () => new Function);
fn
	.register(() => true, (i) => () => i);


export const date = new Convertor<Date>((i) => i instanceof Date, () => new Date(NaN));
date
	.undefined(date.fallback)
	.boolean((i) => new Date(Number(i)))
	.number((i) => new Date(i))
	.bigint((i) => new Date(Number(i)))
	.string((i) => new Date(i))
	.symbol((i) => new Date(string.convert(i)));


export const map = new Convertor<Map<any, any>>((i) => i instanceof Map, () => new Map());
map
	.register((i) => i && i[Symbol.iterator], (i) => {
		const result = new Map();
		for (const item of i) {
			if (item && item[Symbol.iterator]) {
				const [key, value] = item;
				result.set(key, value);
			}
		}
		return result;
	});


export const weakmap = new Convertor<WeakMap<any, any>>((i) => i instanceof WeakMap, () => new WeakMap());
weakmap
	.register((i) => i && i[Symbol.iterator], (i) => {
		const result = new WeakMap();
		for (const item of i) {
			if (item && item[Symbol.iterator]) {
				const [key, value] = item;
				if (typeof key === 'object') {
					result.set(key, value);
				}
			}
		}
		return result;
	});


export const set = new Convertor<Set<any>>((i) => i instanceof Set, () => new Set());
set
	.undefined(set.fallback)
	.string((i) => {
		const result = new Set();
		result.add(i);
		return result;
	})
	.register((i) => i && i[Symbol.iterator], (i) => new Set(i))
	.register((i) => i !== null, (i) => {
		const result = new Set();
		result.add(i);
		return result;
	});


export const weakset = new Convertor<WeakSet<any>>((i) => i instanceof WeakSet, () => new WeakSet());
weakset
	.register((i) => i && i[Symbol.iterator], (i) => {
		const result = new WeakSet();
		for (const item of i) {
			if (typeof item === 'object') {
				result.add(item);
			}
		}
		return result;
	});

export const promise = new Convertor<Promise<any>>((i) => i instanceof Promise, () => Promise.resolve())
	.register(() => true, (i) => Promise.resolve(i));
