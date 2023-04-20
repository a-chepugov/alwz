import Convertor from './Converter';

export const boolean = new Convertor<boolean>((i: any) => typeof i === 'boolean', () => false);
boolean
	.undefined(boolean.fallback)
	.number(Boolean)
	.bigint(Boolean)
	.string(Boolean)
	.symbol(Boolean)
	.register((i) => i === null, boolean.fallback)
	.register((i: any) => i instanceof Date, (i: Date) => Boolean(i.getTime()))
	.register(Array.isArray, (i: Array<any>) => boolean.convert(i[0]))
	.register(() => true, Boolean)


export const number = new Convertor<number>((i: any) => typeof i === 'number', () => NaN);
number
	.undefined(Number)
	.boolean(Number)
	.bigint(Number)
	.string(Number)
	.symbol((i) => Number(string.convert(i)))
	.register((i) => i === null, Number)
	.register((i: any) => i instanceof Date, (i: Date) => i.getTime())
	.register(Array.isArray, (i: Array<any>) => number.convert(i[0]))

export const string = new Convertor<string>((i: any) => typeof i === 'string', () => '');
string
	.undefined(string.fallback)
	.boolean((i) => i ? ' ' : string.fallback())
	.number((i) => i === i ? String(i) : string.fallback())
	.bigint(String)
	.symbol((i) => Symbol.keyFor(i) || string.fallback())
	.register((i) => i === null, string.fallback)
	.register((i: any) => i instanceof Date, (i: Date) => {
		const value = i.getTime();
		return Number.isFinite(value) ? i.toISOString() : string.fallback();
	})
	.register(Array.isArray, (i: Array<any>) => string.convert(i[0]))
	.register((i: any) => true, String)


export const symbol = new Convertor<symbol>((i: any) => typeof i === 'symbol', () => Symbol.for(''));
symbol
	.register(() => true, (i) => Symbol.for(string.convert(i)))


export const array = new Convertor<Array<any>>(Array.isArray, () => []);
array
	.undefined(array.fallback)
	.boolean((i) => [i])
	.number((i) => [i])
	.bigint((i) => [i])
	.string((i) => [i])
	.symbol((i) => [i])
	.register((i) => i === null, array.fallback)
	.register((i: any) => typeof i === 'object' && i !== null && i[Symbol.iterator], Array.from)
	.register(() => true, (i) => [i])
;


// eslint-disable-next-line @typescript-eslint/ban-types
export const fn = new Convertor<Function>((i: any) => typeof i === 'function', () => new Function);
fn
	.register(() => true, (i) => () => i)



export const date = new Convertor<Date>((i: any) => i instanceof Date, () => new Date(NaN));
date
	.undefined(date.fallback)
	.boolean((i) => new Date(Number(i)))
	.number((i) => new Date(i))
	.bigint((i) => new Date(Number(i)))
	.string((i) => new Date(i))
	.symbol((i) => new Date(string.convert(i)))
	.register(Array.isArray, (i: Array<any>) => date.convert(i[0]))


export const map = new Convertor<Map<any, any>>((i: any) => i instanceof Map, () => new Map());
map
	.register((i: any) => typeof i === 'object' && i !== null && i[Symbol.iterator], (i: Iterable<any>) => {
		const result = new Map();
		for (const item of i) {
			if (item && item[Symbol.iterator]) {
				const [key, value] = item;
				result.set(key, value);
			}
		}
		return result;
	})


export const weakmap = new Convertor<WeakMap<any, any>>((i: any) => i instanceof WeakMap, () => new WeakMap());
weakmap
	.register((i: any) => typeof i === 'object' && i !== null && i[Symbol.iterator], (i: Iterable<any>) => {
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
	})


export const set = new Convertor<Set<any>>((i: any) => i instanceof Set, () => new Set());
set
	.undefined(set.fallback)
	.string((i) => {
		const result = new Set();
		result.add(i);
		return result;
	})
	.register((i: any) => typeof i === 'object' && i !== null && i[Symbol.iterator], (i: Iterable<any>) => new Set(i))
	.register((i: any) => i !== null, (i) => {
		const result = new Set();
		result.add(i);
		return result;
	})


export const weakset = new Convertor<WeakSet<any>>((i: any) => i instanceof WeakSet, () => new WeakSet());
weakset
	.register((i: any) => typeof i === 'object' && i !== null && i[Symbol.iterator], (i: Iterable<any>) => {
		const result = new WeakSet();
		for (const item of i) {
			if (typeof item === 'object') {
				result.add(item);
			}
		}
		return result;
	})

export const promise = new Convertor<Promise<any>>((i: any) => i instanceof Promise, () => Promise.resolve())
	.register(() => true, (i: any) => Promise.resolve(i))

