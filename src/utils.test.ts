import assert from 'assert';
import * as utils from './utils';

describe('utils', () => {

	describe('array', () => {

		const array = utils.array;

		test('throw on invalid convert', () => {
			assert.throws(() => array(null));
		});

		test('throw on invalid initiator', () => {
			assert.throws(() => array(Number, null));
		});

		const numArray = array(Number);

		const sets = [
			{ input: undefined, output: [] },
			{ input: null, output: [] },
			{ input: [], output: [] },
			{ input: [true, 2, '3', {}], output: [1, 2, 3, NaN] },
		];

		for(let i = 0; i < sets.length; i++) {
			const { input, output } = sets[i];
			const name = `${i}: < ${String(input)} > gives ${String(output)}`;
			test(name, () => {
				assert.deepStrictEqual(numArray(input), output);
			});
		}

	});

	describe('tuple', () => {

		const tuple = utils.tuple;

		test('throw on invalid converts', () => {
			assert.throws(() => tuple(null));
		});

		test('throw on invalid convert', () => {
			assert.throws(() => tuple([null]));
		});

		test('throw on invalid initiator', () => {
			assert.throws(() => tuple([Number, String], null));
		});

		const tplNSB = tuple([Number, String, Boolean]);

		const sets = [
			{ input: undefined, output: [NaN, 'undefined', false] },
			{ input: null, output: [NaN, 'undefined', false] },
			{ input: '5', output: [5, 'undefined', false] },
			{ input: [], output: [NaN, 'undefined', false] },
			{ input: ['1', '2', '3'], output: [1, '2', true] },
		];

		for(let i = 0; i < sets.length; i++) {
			const { input, output } = sets[i];
			const name = `${i}: < ${String(input)} > gives ${String(output)}`;
			test(name, () => {
				assert.deepStrictEqual(tplNSB(input), output);
			});
		}

	});

	describe('range', () => {

		const range = utils.range;

		test('throw on invalid fallback', () => {
			assert.throws(() => range(1, 2, null));
		});

		test('throw on invalid conversion', () => {
			assert.throws(() => range(1, 2, Number,  null));
		});

		const range37 = range(3, 7);
		const range37WithCustomFallback = range(3, 7, () => -1);
		const rangeString = range('k', 'w', undefined, String);

		const sets = [
			{ work: range37, input: 3, output: 3 },
			{ work: range37, input: 5, output: 5 },
			{ work: range37, input: '5', output: 5 },
			{ work: range37, input: 7, output: 7 },
			{ work: range37, input: -Infinity, output: 3 },
			{ work: range37, input: 1, output: 3 },
			{ work: range37, input: undefined, output: 3 },
			{ work: range37, input: null, output: 3 },
			{ work: range37, input: NaN, output: 3 },
			{ work: range37, input: 9, output: 7 },
			{ work: range37, input: Infinity, output: 7 },

			{ work: range37WithCustomFallback , input: 1, output: -1 },
			{ work: range37WithCustomFallback , input: 9, output: -1 },

			{ work: rangeString, input: 'a', output: 'k' },
			{ work: rangeString, input: 'k', output: 'k' },
			{ work: rangeString, input: 'n', output: 'n' },
			{ work: rangeString, input: 'w', output: 'w' },
			{ work: rangeString, input: 'z', output: 'w' },
		];

		for(let i = 0; i < sets.length; i++) {
			const { work, input, output } = sets[i];
			const name = `${i}: < ${String(input)} > gives ${String(output)}`;
			test(name, () => {
				assert.deepStrictEqual(work(input), output);
			});
		}

	});

	describe('variant', () => {

		const variant = utils.variant;

		test('throw on invalid values', () => {
			assert.throws(() => variant(null));
		});

		test('throw on invalid fallback', () => {
			assert.throws(() => variant([4], null));
		});

		test('throw on invalid convert', () => {
			assert.throws(() => variant([4], () => 4, null));
		});

		const var123 = variant([1, 2, 3]);
		const var123WithCustomFallback = variant([1, 2, 3], () => 3);
		const varABC = variant(['a', 'b'], (i) => ['a', 'b'][i], String);
		const var123WithPoorFallback = variant([1, 2, 3], () => 99);

		const sets = [
			{ work: var123, input: 1, output: 1 },
			{ work: var123, input: '2', output: 2 },
			{ work: var123, input: [3], output: 3 },
			{ work: var123, input: 4, output: 1 },
			{ work: var123, input: undefined, output: 1 },
			{ work: var123, input: null, output: 1 },
			{ work: var123, input: NaN, output: 1 },
			{ work: var123, input: -Infinity, output: 1 },
			{ work: var123, input: Infinity, output: 1 },

			{ work: var123WithCustomFallback, input: 4, output: 3 },

			{ work: varABC, input: 'a', output: 'a' },
			{ work: varABC, input: 'b', output: 'b' },
			{ work: varABC, input: 0, output: 'a' },
			{ work: varABC, input: 1, output: 'b' },
		];

		for(let i = 0; i < sets.length; i++) {
			const { work, input, output } = sets[i];
			const name = `${i}: < ${String(input)} > gives ${String(output)}`;
			test(name, () => {
				assert.deepStrictEqual(work(input), output);
			});
		}

		test('throw on invalid fallback', () => {
			assert.throws(() => var123WithPoorFallback(4));
		});

	});

});
