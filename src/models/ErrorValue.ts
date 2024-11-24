/**
 * @description Error with value property
 * @property {any} [value] - can be used to store additional cause info
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
	 * @description throw this instance of error
	 */
	throw() {
		throw this;
	}
}

export default ErrorValue;
