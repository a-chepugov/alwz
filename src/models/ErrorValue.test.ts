import assert from 'node:assert';
import ErrorValue from './ErrorValue.js';

describe('ErrorValue', () => {

	describe('examples', () => {
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

		test('throw this error instance', () => {
			const inc = (input) => typeof input === 'number'
				? input + 1
				: new ErrorValue('invalid list', { input, date: Date.now() }).throw();

			assert.throws(() => inc('1'), (error) => {
				assert.strictEqual(error?.value?.input, '1');
				assert.strictEqual(typeof error?.value?.date, 'number');
				return true;
			});
		});

	});

	it('error has `message` and `value` props', () => {
		const error = new ErrorValue('123', 42);
		assert.strictEqual(error.message, '123');
		assert.strictEqual(error.value, 42);
	});

	it('options can be passed', () => {
		const cause = new Error('cause');
		const error = new ErrorValue('123', 42, { cause: cause });
		assert.strictEqual(error.cause, cause);
	});

	it('throw ad error with static `throw`', () => {
		assert.throws(() => new ErrorValue().throw());
	});



});
