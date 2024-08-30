/**
 * @ignore
 */
export const integers = {
	byte: [-128, 127],
	short: [-32768, 32767],
	int: [-2147483648, 2147483647],
	long: [
		Math.max(-(2 ** 63), Number.MIN_SAFE_INTEGER),
		Math.min((2 ** 63) - 1, Number.MAX_SAFE_INTEGER),
	],
	ubyte: [0, 255],
	ushort: [0, 65535],
	uint: [0, 4294967295],
	ulong: [
		0,
		Math.min((2 ** 64) - 1, Number.MAX_SAFE_INTEGER),
	],
};

/**
 * @ignore
 */
export const floats = {
	double: [-Number.MAX_VALUE, Number.MAX_VALUE],
};
