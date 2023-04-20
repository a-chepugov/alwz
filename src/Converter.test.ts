import assert from 'assert';
import Converter from './Converter';

describe('Converter', () => {

	const converter = new Converter((input) => typeof input === 'number' && input > 0, () => 1);
	converter
		.undefined(() => 1)
		.number((i) => {
			const result = Math.abs(i);
			return result > 0 ? result : converter.fallback();
		})
		.bigint((i) => converter.convert(Number(i)))
		.string((i) => converter.convert(Number(i)))
		.symbol((i) => converter.convert(Symbol.keyFor(i)))
		.register((i) => i instanceof Number, (i: any) => converter.convert(+i));


	test(`'is' must be a function`, () => {
		assert.throws(() => new Converter());
	});

	test(`'fallback' must be a function`, () => {
		assert.throws(() => new Converter(() => false));
	});

	test(`'is' checks if a conversion is needed`, () => {
		let count = 0;
		const odd = new Converter((input) => Boolean(input % 2), () => {
			count++;
		});

		odd.convert(1);
		assert.deepEqual(count, 0);
		odd.convert(2);
		assert.deepEqual(count, 1);
	});

	test(`fallback is called when all attempts of conversions had failed`, () => {
		let count = 0;
		const odd = new Converter((input) => Boolean(input % 2), () => {
			count++;
			return 1;
		})
			.undefined(() => 0)
			.string(() => '3')
			.register(Array.isArray, () => 5)
		;

		assert.deepEqual(count, 0);
		odd.convert(1);
		odd.convert('2');
		odd.convert();
		odd.convert([]);
		odd.convert(2);
		assert.deepEqual(count, 1);
	});

});
