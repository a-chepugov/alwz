// eslint-disable-next-line require-jsdoc
export class ErrorValue extends Error {
	value: any;
	constructor(message: string, value: any) {
		super(message);
		this.value = value;
		Object.freeze(this);
	}
}

export default ErrorValue;
