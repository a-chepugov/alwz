import assert from 'assert';
import * as a from './index.js';

describe('index', () => {

	describe('Types', () => {

		test('examples', () => {
			assert.deepStrictEqual(a.byte('3'), 3);
			assert.deepStrictEqual(a.short(false), 0);
			assert.deepStrictEqual(a.int(true), 1);
			assert.deepStrictEqual(a.uint(Infinity), 4294967295);
			assert.deepStrictEqual(a.long(NaN), 0);
			assert.deepStrictEqual(a.long(['1', '2', '3']), 1);
			assert.deepStrictEqual(a.array('abc'), ['abc']);
			assert.deepStrictEqual(a.array([123, 'abc', {}, Math.max]), [123, 'abc', {}, Math.max]);
		});

	});

	describe('Structures', () => {

		test('ensure an array output', () => {
			const array = a.utils.array;
			const ArrayOfUByte = array(a.ubyte);

			const result = ArrayOfUByte([undefined, true, 2.3, '4', Infinity]);
			const expected = [0, 1, 2, 4, 255];
			assert.deepStrictEqual(result, expected);
		});

		test('simplify multidimensional arrays processing', () => {
			const array = a.utils.array;

			const Bytes3dArray = array(array(array(a.byte)));

			{
				const result = Bytes3dArray(1);
				const expected = [[[1]]];
				assert.deepStrictEqual(result, expected);
			}

			{
				const result = Bytes3dArray([[[null, NaN, 'a'], [true, '2', 3]], [[Infinity]]]);
				const expected = [[[0, 0, 0], [1, 2, 3]], [[127]]];
				assert.deepStrictEqual(result, expected);
			}
		});

		test('create tuples', () => {
			const tuple = a.utils.tuple;
			{
				const Pair = tuple([a.uint, a.uint]);
				const result = Pair(['abc', 3.5, 100]);
				const expected = [0, 3];
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

		const bool = a.converters.get('boolean')
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

		test('extend an existing converter', () => {
			assert.deepStrictEqual(bool('yes'), true);
			assert.deepStrictEqual(bool('no'), false);
			assert.deepStrictEqual(bool('false'), false);
			assert.deepStrictEqual(bool(0), false);
			assert.deepStrictEqual(bool(true), true);
			assert.deepStrictEqual(bool(false), false);
		});

		test('parse colon-separated number/string records', () => {
			const PathArray = a.converters.get('array')
				.clone()
				.string((i) => [...i.matchAll(/\/(\w+)/g)].map((i) => i[1]))
				.convert;

			const DSV2Tuple = a.utils.tuple(
				[String, String, Number, Number, String, PathArray, PathArray],
				a.converters.get('array')
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

		test('dynamically select convert function', () => {
			assert.deepStrictEqual(a.to('int')('24.5'), 24);
			assert.deepStrictEqual(a.to('byte')(Infinity), 127);
			assert.deepStrictEqual(a.to('bigint')('42.5'), 42n);
		});

	});

	describe('Converters', () => {

		test('get prodefined list', () => {
			const list = Array.from(a.converters.keys());
			const predifined = ['boolean', 'byte', 'int', 'long', 'double', 'string'];
			for (const item of predifined) {
				assert.strictEqual(list.includes(item), true, `absent item - ${item}`);
			}
		});

		test('retrieving with existence check', () => {
			const c1 = a.converters.converter('number');
			assert.strictEqual(c1 instanceof a.Converter, true);
			const c2 = a.converters.converter('date');
			assert.strictEqual(c2 instanceof a.Converter, true);
			assert.throws(() => {
				a.converters.converter('123');
			});
		});

		test('direct retrieving', () => {
			const c1 = a.converters.get('array');
			assert.strictEqual(c1 instanceof a.Converter, true);
			const c2 = a.converters.get('123');
			assert.strictEqual(c2 === undefined, true);
		});

	});

	describe('Predicates', () => {
		const { is } = a;

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
		const Is = a.Is;

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
		const { ErrorValue } = a;

		test('throw an error with extra data', () => {
			const inc = (input) => typeof input === 'number'
				? input + 1
				: new ErrorValue('invalid list', { input, date: Date.now() }).throw();

			assert.throws(() => inc('1'), (error) => {
				assert.strictEqual(error?.value?.input, '1');
				assert.strictEqual(typeof error?.value?.date, 'number');
				return true;
			});
		});

		test('intercept and wrap error', () => {
			const cause = new Error('oops, something went wrong');
			const fn = () => {
				try {
					throw cause;
				} catch (error) {
					throw new ErrorValue('urgent message', { data: 'some additional data' }, { cause: error }).throw();
				}
			};
			assert.throws(() => fn(), (error) => {
				assert.strictEqual(error?.value?.data, 'some additional data');
				assert.strictEqual(error?.cause, cause);
				return true;
			});
		});
	});

});

