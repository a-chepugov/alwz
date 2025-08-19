/**
 * @description Error with value property (informative errors)
 * @property {any} [value] - additional cause info
 * @example <caption>generate errors with additional info</caption>
 * throw new ErrorValue('invalid list', { data: 'some additional data' });
 *
 * @example <caption>intercept and wrap thrown error</caption>
 * try {
 *  throw new Error('oops, something went wrong');
 * } catch (error) {
 *  throw new ErrorValue('urgent message', { data: 'some additional data' }, { cause: error });
 * }
 */
export class ErrorValue extends Error {
	value?: unknown;

	/**
	 * @param {string} [message]
	 * @param {any} [value]
	 * @param {any} [options]
	 */
	constructor(message?: string, value?: unknown, options?: unknown) {
		// @ts-ignore
		super(message, options);
		this.value = value;
	}

	/**
	 * @description throw this error instance (ternary-friendly)
	 * @example
	 * const inc = (input) => typeof input === 'number'
	 *   ? input + 1
	 *   : new ErrorValue('invalid list', { input, date: Date.now() }).throw();
	 *
	 * inc('1'); // throws ErrorValue
	 */
	throw() {
		throw this;
	}
}

export default ErrorValue;
