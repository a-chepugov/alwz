import assert from 'assert';
import * as utils from './utils';
import * as a from './index';

describe('utils', () => {

	describe('array', () => {

		const array = utils.array;

		test('throw on invalid conversion', () => {
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
			// eslint-disable-next-line no-sparse-arrays
			{ input: [, 1, undefined, 2, null, 3], output: [, 1, NaN, 2, 0, 3] },
			// eslint-disable-next-line no-sparse-arrays
			{ input: [1, , 3], output: [1, , 3] },
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

		test('throw on invalid conversions', () => {
			assert.throws(() => tuple(null));
		});

		test('throw on invalid conversion', () => {
			assert.throws(() => tuple([null]));
		});

		test('throw on invalid initiator', () => {
			assert.throws(() => tuple([Number, String], null));
		});

		const tupleNumStrBool = tuple([Number, String, Boolean]);

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
				assert.deepStrictEqual(tupleNumStrBool(input), output);
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

		const rangeDefault = range();
		const range37 = range(3, 7);
		const range37WithCustomFallback = range(3, 7, () => -1);
		const rangeString = range('k', 'w', undefined, String);

		const sets = [
			{ work: rangeDefault, input: 3, output: 3 },
			{ work: rangeDefault, input: -Infinity, output: -Number.MAX_VALUE },
			{ work: rangeDefault, input: Infinity, output: Number.MAX_VALUE },

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
		const var123WithCustomFallback = variant([1, 2, 3], () => -1);
		const varABC = variant(['a', 'b'], (i) => ['a', 'b'][i], String);

		const sets = [
			{ work: var123, input: 1, output: 1 },
			{ work: var123, input: '2', output: 2 },
			{ work: var123, input: [3], output: 3 },
			{ work: var123, input: 4, output: 1 },
			{ work: var123, input: -5, output: 1 },
			{ work: var123, input: undefined, output: 1 },
			{ work: var123, input: null, output: 1 },
			{ work: var123, input: NaN, output: 1 },
			{ work: var123, input: -Infinity, output: 1 },
			{ work: var123, input: Infinity, output: 1 },

			{ work: var123WithCustomFallback, input: 4, output: -1 },

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

		const var123WithStrictFallback = variant([1, 2, 3], () => {
			throw new Error('invalid input');
		});

		test('variant with throw on fallback', () => {
			assert.throws(() => var123WithStrictFallback(4));
		});

	});

	describe('object', () => {

		test('throw on invalid schema', () => {
			assert.throws(() => utils.object(null));
		});

		test('throw on invalid conversion', () => {
			assert.throws(() => utils.object({}, null));
		});

		const objShallow = utils.object({
			a: a.boolean,
			b: a.int,
			c: a.string,
		});

		const objNested = utils.object({
			a: a.ubyte,
			b: utils.array(utils.object({
				c: a.int,
				d: a.string,
			})),
		});

		// @ts-ignore
		const objCircular = utils.object({
			a: a.uint,
			children: objChildrenArr,
		});

		function objChildrenArr(input) {
			return utils.array(objCircular)(input);
		}

		const sets = [
			{ work: objShallow, input: undefined, output: { a: false, b: 0, c: '' } },
			{ work: objShallow, input: null, output: { a: false, b: 0, c: '' } },
			{ work: objShallow, input: {}, output: { a: false, b: 0, c: '' } },
			{ work: objShallow, input: { a: 1, b: ['2', '3'], c: 4 }, output: { a: true, b: 2, c: '4' } },

			{ work: objNested ,
				input: undefined,
				output: { a: 0, b: [] },
			},
			{ work: objNested ,
				input: { a: 999, b: [{ c: 2.5, d: 3 }, null] },
				output: { a: 255, b: [{ c: 2, d: '3' }, { c: 0, d: '' }] },
			},

			{ work: objCircular, input: {}, output: { a: 0, children: [] } },
			{ work: objCircular,
				input: {
					a: 1, children: [{ a: 2 }, { a: 3, children: [{ a: 4 }] }],
				},
				output: {
					a: 1, children: [
						{ a: 2, children: [] },
						{ a: 3, children: [{ a: 4, children: [] }] },
					],
				},
			},
		];

		for(let i = 0; i < sets.length; i++) {
			const { work, input, output } = sets[i];
			const name = `${i}: < ${JSON.stringify(input)} > gives ${JSON.stringify(output)}`;
			test(name, () => {
				assert.deepStrictEqual(work(input), output);
			});
		}

	});

	describe('dictionary', () => {

		test('throw on invalid converter', () => {
			assert.throws(() => utils.dictionary(null));
		});

		test('throw on invalid conversion', () => {
			assert.throws(() => utils.dictionary(() => true, null));
		});

		const dictShallow = utils.dictionary(a.int);

		const dictNested = utils.dictionary(
			utils.array(utils.dictionary(a.string))
		);

		const dictKeys = utils.dictionary((v, k) => `${k}:${v}`);

		const sets = [
			{ work: dictShallow, input: undefined, output: {} },
			{ work: dictShallow, input: null, output: {} },
			{ work: dictShallow, input: {}, output: {} },
			{ work: dictShallow, input: { a: null, b: true, c: '2', d: [3, 4] }, output: { a: 0, b: 1, c: 2, d: 3 } },

			{ work: dictNested,
				input: { a: { b: 1} },
				output: { a: [{ b: '1' }] },
			},
			{ work: dictNested,
				input: { a: 999, b: [{ c: 2.5, d: 3 }, null] },
				output: { a: [{}], b: [{ c: "2.5", d: '3'}, {}] },
			},

			{ work: dictKeys, input: { a: 1, b: 2}, output: { a: 'a:1', b: 'b:2' } },
		];

		for(let i = 0; i < sets.length; i++) {
			const { work, input, output } = sets[i];
			const name = `${i}: < ${JSON.stringify(input)} > gives ${JSON.stringify(output)}`;
			test(name, () => {
				assert.deepStrictEqual(work(input), output);
			});
		}

	});


	describe('mixed', () => {
		const conversion = utils.object({
			id: a.ulong,
			rates: a.utils.tuple([a.uint, a.uint, a.uint]),
			name: a.string,
			nicks: utils.dictionary(a.utils.array(a.string)),
			emails: a.utils.array(a.string),
		});

		const sets = [
			{ work: conversion, input: undefined, output: { id: 0, rates: [0, 0, 0], name: "", nicks: {}, emails: [] } },
			{ work: conversion, input: null, output: { id: 0, rates: [0, 0, 0], name: "", nicks: {}, emails: [] } },
			{ work: conversion, input: {}, output: { id: 0, rates: [0, 0, 0], name: "", nicks: {}, emails: [] } },
			{ work: conversion,
				input: {
					id: '1',
					name: 42,
					rates: ['4', 5, true],
					nicks: {
						work: ['42', 'omni'],
						home: 'any',
					},
					emails: [ '42@example.com' ],
				},
				output: {
					id: 1,
					rates: [4, 5, 1],
					name: '42',
					nicks: {
						work: ['42', 'omni'],
						home: ['any'],
					},
					emails: [ '42@example.com' ],
				},
			},
		];

		for(let i = 0; i < sets.length; i++) {
			const { work, input, output } = sets[i];
			const name = `${i}: < ${JSON.stringify(input)} > gives ${JSON.stringify(output)}`;
			test(name, () => {
				assert.deepStrictEqual(work(input), output);
			});
		}
	});

});
