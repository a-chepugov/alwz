import assert from 'assert';

import * as utils from './utils.js';
import cast from './cast.js';

const { boolean, ubyte, int, uint, ulong, string } = cast;

describe('utils', () => {

	describe('array', () => {

		const array = utils.array;

		test('throw on invalid conversion', () => {
			assert.throws(() => array(null));
		});

		test('throw on invalid initiator', () => {
			assert.throws(() => array(Number, null));
		});

		const ArrayOfNumbers = array(Number);

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
				assert.deepStrictEqual(ArrayOfNumbers (input), output);
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

		const range37Strict = range(3, 7, () => {
			throw new Error('out of range input');
		});

		test('range with throw on fallback', () => {
			assert.throws(() => range37Strict(9));
		});

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

		const oneOf123 = variant([1, 2, 3]);
		const oneOf123WithCustomFallback = variant([1, 2, 3], () => -1);
		const AlphaBetaGamma = variant(['Alpha', 'Beta'], () => 'Gamma', String);

		const sets = [
			{ work: oneOf123, input: 1, output: 1 },
			{ work: oneOf123, input: '2', output: 2 },
			{ work: oneOf123, input: [3], output: 3 },
			{ work: oneOf123, input: 4, output: 1 },
			{ work: oneOf123, input: -5, output: 1 },
			{ work: oneOf123, input: undefined, output: 1 },
			{ work: oneOf123, input: null, output: 1 },
			{ work: oneOf123, input: NaN, output: 1 },
			{ work: oneOf123, input: -Infinity, output: 1 },
			{ work: oneOf123, input: Infinity, output: 1 },

			{ work: oneOf123WithCustomFallback, input: 4, output: -1 },

			{ work: AlphaBetaGamma, input: 'Alpha', output: 'Alpha' },
			{ work: AlphaBetaGamma, input: 'Beta', output: 'Beta' },
			{ work: AlphaBetaGamma, input: 'Gamma', output: 'Gamma' },
			{ work: AlphaBetaGamma, input: 'Delta', output: 'Gamma' },
		];

		for(let i = 0; i < sets.length; i++) {
			const { work, input, output } = sets[i];
			const name = `${i}: < ${String(input)} > gives ${String(output)}`;
			test(name, () => {
				assert.deepStrictEqual(work(input), output);
			});
		}

		const var123Strict = variant([1, 2, 3], () => {
			throw new Error('invalid input');
		});

		test('variant with throw on fallback', () => {
			assert.throws(() => var123Strict(4));
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
			a: boolean,
			b: int,
			c: string,
		});

		const objNested = utils.object({
			a: ubyte,
			b: utils.array(utils.object({
				c: int,
				d: string,
			})),
		});

		// @ts-ignore
		const objCircular = utils.object({
			a: uint,
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

		const dictShallow = utils.dictionary(int);

		const dictNested = utils.dictionary(
			utils.array(utils.dictionary(string))
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
			id: ulong,
			rates: utils.tuple([uint, uint, uint]),
			name: string,
			nicks: utils.dictionary(utils.array(string)),
			emails: utils.array(string),
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

	describe('projection', () => {
		const projection = utils.projection;

		test('creates function on initialization with object of functions or objects', () => {
			const schema = { a: () => 'a', b: { c: () => 'c' } };
			assert.strictEqual(typeof projection(schema), 'function');
		});

		test('throw on initilization with invalid schema', () => {
			const schema = { a: 'a'};
			assert.throws(() => projection(schema));
		});

		const source = { a: 1, b: 2, c: 3 };

		test('produce shallow objects with shallow schema', () => {
			const schema = {
				a: (s) => s.a + s.b + s.c,
				b: (s) => s.a * s.b * s.c,
				c: (s) => s.a ** s.b ** s.c,
			};

			const project = projection(schema);
			assert.deepStrictEqual(project(source), { a: 6, b: 6, c: 1 });
		});

		test('produce nested objects with nested schema', () => {
			const schema = {
				a: (s) => s.a + s.b + s.c,
				b: {
					c: (s) => s.a ** s.b ** s.c,
				},
			};

			const project = projection(schema);
			assert.deepStrictEqual(project(source), { a: 6, b: { c: 1 } });
		});

		test('target can be accessed and modified in contructors', () => {
			const schema = {
				a: (s, o, t) => {
					t.a_ = 24;
					return 1;
				},
				b: {
					c: (s, o, t) => {
						t.c_ = 42;
						return 3;
					},
				},
			};
			const project = projection(schema);
			assert.deepStrictEqual(
				project(source),
				{ a: 1, a_: 24, b: { c: 3, c_: 42 } }
			);
		});

		test('pass additional options to constructors', () => {
			const options = {a: 1};

			const schema = {
				a: function(s, o) {
					assert.deepStrictEqual(o, options);
				},
				b: {
					c: function(s, o) {
						assert.deepStrictEqual(o, options);
					},
				},
			};

			const project = projection(schema);
			project(source, options);
		});

		test('pass `this` to a constructors', () => {
			const context = {a: 1};

			const schema = {
				a: function() {
					assert.deepStrictEqual(this, context);
				},
				b: {
					c: function() {
						assert.deepStrictEqual(this, context);
					},
				},
			};

			const project = projection(schema);
			project.call(context, source);
		});

		test('example', () => {
			const schema = {
				a: (source) => source.x + 1,
				b: {
					c: (source) => source.x + 2,
				},
				d: (source, options) => options,
				e: (source, options, target) => { target._e = source.x + 6; },
				f: function() { return this; },
			};
			const project = projection(schema);

			const source = { x: 1 };
			const options = { z: 5 };
			const context = { y: 11 };

			assert.deepStrictEqual(
				project.call(context, source, options),
				{ a: 2, b: { c: 3 }, d: { z: 5 }, _e: 7, e: undefined, f: { y: 11 } }
			);
		});
	});

});
