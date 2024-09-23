// eslint-disable-next-line require-jsdoc
export class ErrorValue extends Error {
	value?: unknown;
	constructor(message: string, value?: unknown) {
		super(message);
		this.value = value;
		Object.freeze(this);
	}
}

export default ErrorValue;
