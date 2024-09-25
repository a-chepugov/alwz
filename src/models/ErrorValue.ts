// eslint-disable-next-line require-jsdoc
export class ErrorValue extends Error {
	value?: unknown;
	constructor(message?: string, value?: unknown, options?: unknown) {
		// @ts-ignore
		super(message, options);
		this.value = value;
	}

	throw() {
		throw this;
	}
}

export default ErrorValue;
