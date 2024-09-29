import assert from 'assert';
import * as a from './index.js';

describe('index', () => {

	describe('Predefined', () => {

		test('check', () => {
			assert.deepStrictEqual(a.byte('3'), 3);
			assert.deepStrictEqual(a.short(false), 0);
			assert.deepStrictEqual(a.uint(Infinity), 4294967295);
			assert.deepStrictEqual(a.long(NaN), 0);
			assert.deepStrictEqual(a.long(['1', '2', '3']), 1);
			assert.deepStrictEqual(a.array('abc'), ['abc']);
			assert.deepStrictEqual(a.array([123, 'abc', {}, Math.max]), [123, 'abc', {}, Math.max]);
		});

	});

	describe('Utils', () => {

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

	describe('Transform', () => {

		const bool = a.default.get('boolean')
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

		const even = new a.Converter(
			(input) => typeof input === 'number' && input % 2 === 0, // initial input check
			(input) => Number(input) % 2 === 0 ? Number(input) : 0 // fallback value generator
		);

		even
			.undefined(() => -2)
			.boolean((input) => input ? -4 : -6)
			.number(function(input) {
				const result = Math.trunc(Math.abs(input || 0) / 2) * 2;
				return this.is(result) ? result : this.fallback(input);
			})
			.string((input) => even.convert(Number(input)))
			.register(Array.isArray, (input) => even.convert(input[0]));

		test('create specific converters', () => {
			assert.deepStrictEqual(even.convert(8), 8);
			assert.deepStrictEqual(even.convert(undefined), -2);
			assert.deepStrictEqual(even.convert(true), -4);
			assert.deepStrictEqual(even.convert(false), -6);
			assert.deepStrictEqual(even.convert(NaN), 0);
			assert.deepStrictEqual(even.convert(11), 10);
			assert.deepStrictEqual(even.convert('15'), 14);
			assert.deepStrictEqual(even.convert([17, 18, 19]), 16);
		});

		test('parse colon-separated number/string records', () => {
			const PathArray = a.default.get('array')
				.clone()
				.string((i) => [...i.matchAll(/\/(\w+)/g)].map((i) => i[1]))
				.convert;

			const DSV2Tuple = a.utils.tuple(
				[String, String, Number, Number, String, PathArray, PathArray],
				a.default.get('array')
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
			const list = Array.from(a.default.keys());
			const predifined = ['boolean', 'byte', 'int', 'long', 'double', 'string'];
			for (const item of predifined) {
				assert.strictEqual(list.includes(item), true, `absent item - ${item}`);
			}
		});

		test('retrieving with existence check', () => {
			const c1 = a.default.converter('number');
			assert.strictEqual(c1 instanceof a.Converter, true);
			const c2 = a.default.converter('date');
			assert.strictEqual(c2 instanceof a.Converter, true);
			assert.throws(() => {
				a.default.converter('123');
			});
		});

		test('direct retrieving', () => {
			const c1 = a.default.get('array');
			assert.strictEqual(c1 instanceof a.Converter, true);
			const c2 = a.default.get('123');
			assert.strictEqual(c2 === undefined, true);
		});

	});

	describe('Predicates', () => {
		const is = a.is;
		const set = [
			[is.void(0), false],
			[is.void(null), true],
			[is.value(null), false],
			[is.value(0), true],
			[is.ubyte(255), true],
			[is.int(Infinity), false],
			[is.object(null), false],
			[is.Iterable(new Set()), true],
		];

		for (const index in set) {
			const [received, expected] = set[index];
			test(index, () => assert.strictEqual(received, expected));
		}
	});

});

