// @ts-nocheck
import assert from 'assert';
import is from './is.js';

describe('is', () => {
	const sets = [
		{ name: 'undefined', yes: [undefined], no: [false, -1, 2n, '3', {} ] },
		{ name: 'null', yes: [null], no: [undefined, false, -1, 2n, '3', {} ] },

		{ name: 'void', yes: [undefined, null], no: [false, -1, 2n, '3', {} ] },
		{ name: 'value', yes: [false, 0, 2n, '3', {}], no: [undefined, null] },

		{ name: 'boolean', yes: [false, true], no: [undefined, 1, -1, 2n, '3', {} ] },
		{ name: 'number', yes: [-1, NaN, Infinity], no: [undefined, false, 2n, '3', {} ] },
		{ name: 'bigint', yes: [2n], no: [undefined, false, -1, '3', {} ] },
		{ name: 'string', yes: ['3'], no: [undefined, false, -1, 2n, {} ] },
		{ name: 'symbol', yes: [Symbol('3')], no: [undefined, false, -1, 2n, {} ] },
		{ name: 'function', yes: [() => 1], no: [undefined, false, -1, 2n, '3', {} ] },
		{ name: 'object', yes: [{}], no: [undefined, false, -1, 2n, '3', null ] },

		{ name: 'byte', yes: [-128, 127], no: [undefined, false, 1.5, 2n, '3', null, Number.MAX_VALUE ] },
		{ name: 'short', yes: [-32768, 32767], no: [undefined, false, 1.5, 2n, '3', null, Number.MAX_VALUE ] },
		{ name: 'int', yes: [-2147483648, 2147483647], no: [undefined, false, 1.5, 2n, '3', null, Number.MAX_VALUE ] },
		{ name: 'long', yes: [ -9007199254740991, 9007199254740991 ], no: [undefined, false, 1.5, 2n, '3', null, Number.MAX_VALUE ] },

		{ name: 'ubyte', yes: [0, 127], no: [undefined, false, -1, 1.5, 2n, '3', null, Number.MAX_VALUE ] },
		{ name: 'ushort', yes: [0, 65535], no: [undefined, false, -1, 1.5, 2n, '3', null, Number.MAX_VALUE ] },
		{ name: 'uint', yes: [0, 4294967295], no: [undefined, false, -1, 1.5, 2n, '3', null, Number.MAX_VALUE ] },
		{ name: 'ulong', yes: [0, 9007199254740991 ], no: [undefined, false, -1, 1.5, 2n, '3', null, Number.MAX_VALUE ] },

		{ name: 'double', yes: [2.5], no: [undefined, false, 2n, '3', null ] },

		{ name: 'Array', yes: [[], [1]], no: [undefined, false, -1, 2n, '3', {} ] },
		{ name: 'Date', yes: [new Date()], no: [undefined, false, -1, 2n, '3', {} ] },
		{ name: 'Error', yes: [new Error], no: [undefined, false, -1, 2n, '3', {} ] },
		{ name: 'RegExp', yes: [/a/], no: [undefined, false, -1, 2n, '3', {} ] },
		{ name: 'Promise', yes: [Promise.resolve()], no: [undefined, false, -1, 2n, '3', {} ] },
		{ name: 'Set', yes: [new Set()], no: [undefined, false, -1, 2n, '3', {} ] },
		{ name: 'WeakSet', yes: [new WeakSet()], no: [undefined, false, -1, 2n, '3', {} ] },
		{ name: 'Map', yes: [new Map()], no: [undefined, false, -1, 2n, '3', {} ] },
		{ name: 'WeakMap', yes: [new WeakMap()], no: [undefined, false, -1, 2n, '3', {} ] },

		{ name: 'Iterable', yes: [[], new Set(), new Map(), { [Symbol.iterator]: function *() { yield 1; } }], no: [undefined, false, -1, 2n, '3', {} ] },
	];

	sets.forEach((item) => {
		const { name, yes, no } = item;
		const guard = is[name];

		describe(name, () => {
			yes.forEach((input, index) => {
				test(`true: ${index + 1}: ${String(input)}`, () => {
					assert.strictEqual(guard(input), true);
				});
			});

			no.forEach((input, index) => {
				test(`false: ${index + 1}: ${String(input)}`, () => {
					assert.strictEqual(guard(input), false);
				});
			});

		});
	});

});
// @ts-ignore-end
