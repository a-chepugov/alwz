import assert from 'node:assert';
import Is from './Is';

describe('Is', () => {

	describe('type', () => {
		it('build check function', () => {
			assert.strictEqual(typeof Is.type('string'), 'function');
		});

		it('throws on invalid build input', () => {
			assert.throws(() => Is.type('numero'));
		});

		it('false on invalid input', () => {
			assert.strictEqual(Is.type('string')(1), false);
		});

		it('true on valid input', () => {
			assert.strictEqual(Is.type('string')('1'), true);
		});
	});

	describe('instance', () => {
		it('build check for class', () => {
			/** @ignore */
			class Test { }
			assert.strictEqual(typeof Is.instance(Test), 'function');
		});

		it('build check for function', () => {
			/** @ignore */
			const test = () => [];
			assert.strictEqual(typeof Is.instance(test), 'function');
		});

		it('throws on invalid build input', () => {
			assert.throws(() => Is.instance('number'));
		});

		it('throws on invalid build input (null)', () => {
			assert.throws(() => Is.instance(null));
		});

		it('false on invalid input', () => {
			assert.strictEqual(Is.instance(Number)(1), false);
		});

		it('true on valid input', () => {
			assert.strictEqual(Is.instance(Number)(new Number(1)), true);
		});
	});

	describe('variant', () => {
		it('build check function', () => {
			assert.strictEqual(typeof Is.variant([1, 2, 3]), 'function');
		});

		it('throws on invalid build input', () => {
			assert.throws(() => Is.variant(1, ''));
		});

		it('false on invalid input', () => {
			assert.strictEqual(Is.variant([1, 2, 3])(4), false);
		});

		it('true on valid input', () => {
			assert.strictEqual(Is.variant([1, 2, 3])(1), true);
		});
	});

	describe('check', () => {
		it('build check function', () => {
			assert.strictEqual(typeof Is.check(() => true), 'function');
		});

		it('throws on invalid build input', () => {
			assert.throws(() => Is.check(1));
		});

		it('false on invalid input', () => {
			assert.strictEqual(Is.check((i) => i % 2 ? true : false)(0), false);
		});

		it('true on valid input', () => {
			assert.strictEqual(Is.check((i) => i % 2 ? true : false)(1), true);
		});
	});

});
