// @ts-nocheck
import assert from 'assert';
import presets from './presets.js';
import cast, { to } from './cast.js';

describe('cast', () => {

	test('examples', () => {
		const { byte, ushort, int, long, array } = cast;

		assert.deepStrictEqual(byte(true), 1);
		assert.deepStrictEqual(ushort(Infinity), 65535);
		assert.deepStrictEqual(int('3'), 3);
		assert.deepStrictEqual(long(NaN), 0);
		assert.deepStrictEqual(long(['1', '2', '3']), 1);
		assert.deepStrictEqual(array('abc'), ['abc']);
	});

	describe('convert functions', () => {
		test('all presets used', () => {
			assert.deepEqual(Object.keys(cast).length, Object.keys(presets).length);
		});

		const fn = () => 'fn';

		const sets = [
			{ name: 'boolean', cast: cast.boolean, set: [[1, true]] },

			{ name: 'number ', cast: cast.number, set: [['1', 1]] },

			{ name: 'byte   ', cast: cast.byte, set: [['Infinity', 127]] },
			{ name: 'short  ', cast: cast.short, set: [['Infinity', 32767]] },
			{ name: 'int    ', cast: cast.int, set: [['Infinity', 2147483647]] },
			{ name: 'long   ', cast: cast.long, set: [['Infinity', 9007199254740991]] },

			{ name: 'ubyte  ', cast: cast.ubyte, set: [['Infinity', 255]] },
			{ name: 'ushort ', cast: cast.ushort, set: [['Infinity', 65535]] },
			{ name: 'uint   ', cast: cast.uint, set: [['Infinity', 4294967295]] },
			{ name: 'ulong  ', cast: cast.ulong, set: [['Infinity', 9007199254740991]] },

			{ name: 'double ', cast: cast.double, set: [['double', 0]] },

			{ name: 'bigint ', cast: cast.bigint, set: [[1, 1n]] },

			{ name: 'string ', cast: cast.string, set: [[1, '1']] },
			{ name: 'symbol ', cast: cast.symbol, set: [['symbol', Symbol.for('symbol')]] },

			{ name: 'array  ', cast: cast.array, set: [['array', ['array']]] },
			{ name: 'fn     ', cast: cast.fn, set: [[fn, fn]] },
			{ name: 'date   ', cast: cast.date, set: [[1, new Date('1970-01-01T00:00:00.001Z')]] },
			{ name: 'object ', cast: cast.object, set: [[Number, Number]] },

			{ name: 'map    ', cast: cast.map, set: [[[['map', 'map']], new Map([['map', 'map']])]] },
			{ name: 'weakmap', cast: cast.weakmap, set: [[[[Number, 'weakmap']], new WeakMap([[Number, 'weakmap']])]] },
			{ name: 'set    ', cast: cast.set, set: [[['set'], new Set(['set'])]] },
			{ name: 'weakset', cast: cast.weakset, set: [[[Number], new WeakSet([Number])]] },

			{ name: 'promise', cast: cast.promise, set: [['promise', Promise.resolve('promise')]] },
		];

		for (const { name, cast: c, set } of sets) {
			for (const [input, expected] of set) {
				test(`${name} | ${String(input)} => ${String(expected)}`, () => {
					assert.deepEqual(c(input), expected);
				});
			}
		}
	});

	describe('to', () => {
		test('examples', () => {
			assert.deepStrictEqual(to('int')('11.1'), 11);
			assert.throws(() => to('abc'));
		});

		test('get present converter', () => {
			assert.deepEqual(typeof to('int'), 'function');
		});

		test('get absent converter', () => {
			const name = 'abc';
			assert.throws(() => to(name), { message: 'unknown converter', value: name } );
		});

	});
});
// @ts-ignore-end
