import assert from 'assert';

import * as alwz from './index.js';

const { byte, short, int, uint, long, array } = alwz;

describe('index', () => {

	describe('Types', () => {

		test('examples', () => {

			assert.deepStrictEqual(byte('3'), 3);
			assert.deepStrictEqual(short(false), 0);
			assert.deepStrictEqual(int(true), 1);
			assert.deepStrictEqual(uint(Infinity), 4294967295);
			assert.deepStrictEqual(long(NaN), 0);
			assert.deepStrictEqual(long(['1', '2', '3']), 1);
			assert.deepStrictEqual(array('abc'), ['abc']);
		});

	});

	describe('Structures', () => {
		const { utils } = alwz;

		test('array-ify data', () => {
			const arrayOf = utils.array;
			const ArrayOfUByte = arrayOf(byte);

			const result = ArrayOfUByte([undefined, true, 2.3, '4', Infinity]);
			const expected = [0, 1, 2, 4, 127];
			assert.deepStrictEqual(result, expected);
		});

		test('simplify nested arrays processing', () => {
			const arrayOf = utils.array;
			const NestedBytesArray = arrayOf(arrayOf(byte));

			{
				const result = NestedBytesArray(1);
				const expected = [[1]];
				assert.deepStrictEqual(result, expected);
			}

			{
				const result = NestedBytesArray([[null, NaN, 'a'], [true, '2', 3], Infinity]);
				const expected = [[0, 0, 0], [1, 2, 3], [127]];
				assert.deepStrictEqual(result, expected);
			}
		});

		test('create tuples', () => {
			const tuple = utils.tuple;
			{
				const Pair = tuple([uint, uint]);
				const result = Pair([3.5, '100']);
				const expected = [3, 100];
				assert.deepStrictEqual(result, expected);
			}

			{
				const NumbersPair = tuple([Number, Number]);
				const result = NumbersPair(['abc', 3.5, 100]);
				const expected = [NaN, 3.5];
				assert.deepStrictEqual(result, expected);
			}
		});

	});

	describe('Transformations', () => {
		const { presets, utils } = alwz;

		const bool = presets.boolean
			.clone()
			.string(function(v) { // string input processing
				if (v === 'true' || v === 'yes') {
					return true;
				} else if (v === 'false' || v === 'no') {
					return false;
				} else {
					return this.types.number(Number(v));
				}
			})
			.convert;

		test('build smart bool converter', () => {
			assert.deepStrictEqual(bool('yes'), true);
			assert.deepStrictEqual(bool('no'), false);
			assert.deepStrictEqual(bool('false'), false);
			assert.deepStrictEqual(bool(0), false);
			assert.deepStrictEqual(bool(true), true);
			assert.deepStrictEqual(bool(false), false);
		});

		test('parse colon-separated number/string records', () => {
			const PathArray = presets.array
				.clone()
				.string((i) => [...i.matchAll(/\/(\w+)/g)].map((i) => i[1]))
				.convert;

			const DSV2Tuple = utils.tuple(
				[String, String, Number, Number, String, PathArray, PathArray],
				presets.array
					.clone()
					.string((i) => i.split(':'))
					.convert
			);

			const input = 'user:12345:1000:1000:ordinar user:/home/user:/bin/sh';
			const result = DSV2Tuple(input);
			const expected = ['user', '12345', 1000, 1000, 'ordinar user', ['home', 'user'], ['bin', 'sh']];
			assert.deepStrictEqual(result, expected);
		});

	});

	describe('Selector', () => {
		const { to } = alwz;

		test('select conversion function at runtime', () => {
			assert.deepStrictEqual(to('int')('24.5'), 24);
			assert.deepStrictEqual(to('byte')(Infinity), 127);
			assert.deepStrictEqual(to('bigint')('42.5'), 42n);
		});

	});

	describe('Converters', () => {
		const { Converter, converters } = alwz;

		test('get prodefined list', () => {
			const list = Array.from(converters.keys());
			const predifined = ['boolean', 'byte', 'int', 'long', 'double', 'string'];
			for (const item of predifined) {
				assert.strictEqual(list.includes(item), true, `absent item - ${item}`);
			}
		});

		test('retrieving with existence check', () => {
			const c1 = converters.converter('number');
			assert.strictEqual(c1 instanceof Converter, true);
			const c2 = converters.converter('date');
			assert.strictEqual(c2 instanceof Converter, true);
			assert.throws(() => {
				converters.converter('123');
			});
		});

		test('direct retrieving', () => {
			const c1 = converters.get('array');
			assert.strictEqual(c1 instanceof Converter, true);
			const c2 = converters.get('123');
			assert.strictEqual(c2 === undefined, true);
		});

	});

	describe('Predicates', () => {
		const { is } = alwz;

		test('examples', () => {
			assert.deepStrictEqual(is.void(null), true);
			assert.deepStrictEqual(is.void(0), false);
			assert.deepStrictEqual(is.value(null), false);
			assert.deepStrictEqual(is.value(0), true);
			assert.deepStrictEqual(is.ubyte(255), true);
			assert.deepStrictEqual(is.int(Infinity), false);
			assert.deepStrictEqual(is.object(null), false);
			assert.deepStrictEqual(is.Iterable(new Set()), true);
		});
	});

	describe('Guards', () => {
		const { Is } = alwz;

		const isAlphaOrBeta = Is.variant(['Alpha', 'Beta']);

		/** */
		class X {}
		/** */
		class Y extends X {}

		const isX = Is.instance(X);

		const set = [
			[isAlphaOrBeta('Alpha'), true],
			[isAlphaOrBeta('Gamma'), false],
			[isX(new X), true],
			[isX(new Y), true],
			[isX({}), false],
		];

		for (const index in set) {
			const [received, expected] = set[index];
			test(index, () => assert.strictEqual(received, expected));
		}
	});

	describe('ErrorValue', () => {
		const { ErrorValue } = alwz;

		test('throw an error with extra data', () => {
			const rise = (condition) => condition
				? new ErrorValue('oops', { condition, date: Date.now() }).throw()
				: condition;

			assert.throws(() => {
				rise(true);
			}, (error) => {
				assert.strictEqual(error?.message, 'oops');
				assert.strictEqual(error?.value?.condition, true);
				assert.strictEqual(typeof error?.value?.date, 'number');
				return true;
			});
		});

	});

});

