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

});
