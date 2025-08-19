import presets from './presets.js';
import ErrorValue from './models/ErrorValue.js';

/**
 * @namespace cast
 * @description cast functions (based on presets list)
 * @see {@link presets presets}
 * @example
 * import cast from 'alwz/cast';
 * const { byte, ushort, int, long, array } = cast;
 *
 * byte(true); // 1
 * ushort(Infinity); // 65535
 * int('3'); // 3
 * long(NaN); // 0
 * long(['1', '2', '3']); // 1 | ['1','2','3'] => '1' => 1
 * array('abc'); // ['abc']
*/
export default {
	boolean: presets.boolean.convert,

	number: presets.number.convert,

	byte: presets.byte.convert,
	short: presets.short.convert,
	int: presets.int.convert,
	long: presets.long.convert,

	ubyte: presets.ubyte.convert,
	ushort: presets.ushort.convert,
	uint: presets.uint.convert,
	ulong: presets.ulong.convert,

	double: presets.double.convert,

	bigint: presets.bigint.convert,

	string: presets.string.convert,
	symbol: presets.symbol.convert,

	array: presets.array.convert,
	fn: presets.fn.convert,
	date: presets.date.convert,
	object: presets.object.convert,

	map: presets.map.convert,
	weakmap: presets.weakmap.convert,
	set: presets.set.convert,
	weakset: presets.weakset.convert,

	promise: presets.promise.convert,
};

/**
 * @memberof cast
 * @param	{string} name - name of the preset to use for conversion
 * @return {Function} - conversion function
 * @throws {ErrorValue} - if the preset name is unknown
 * @example
 * to('int')('11.1'); // 11
 * to('abc'); // Error
*/
export const to = (name: keyof typeof presets) => (name in presets)
	? presets[name].convert
	: (new ErrorValue('unknown converter', name)).throw();

