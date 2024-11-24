import assert from 'node:assert';
import EV from './ErrorValue';

describe('ErrorValue', () => {

	it('error has `message` and `value` props', () => {
		const error = new EV('123', 42);
		assert.strictEqual(error.message, '123');
		assert.strictEqual(error.value, 42);
	});

	it('options can be passed', () => {
		const cause = new Error('cause');
		const error = new EV('123', 42, { cause: cause });
		assert.strictEqual(error.cause, cause);
	});

	it('throw ad error with static `throw`', () => {
		assert.throws(() => new EV().throw());
	});

});
