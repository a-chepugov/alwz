import assert from 'assert';
import Converter from './Converter';

describe.only('Converter', () => {

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
		assert.strictEqual(count, 0);
		odd.convert(2);
		assert.strictEqual(count, 1);
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

		assert.strictEqual(count, 0);
		odd.convert(1);
		assert.strictEqual(count, 0);
		odd.convert('2');
		assert.strictEqual(count, 0);
		odd.convert();
		assert.strictEqual(count, 0);
		odd.convert([]);
		assert.strictEqual(count, 0);
		odd.convert(2);
		assert.strictEqual(count, 1);
	});

	test(`implement conversion fail`, () => {
		const c = new Converter((i) => typeof i === 'number', () => {
			throw new TypeError();
		})
			.undefined(() => 0)
			.string(Number)
		;

		assert.strictEqual(c.convert(), 0);
		assert.strictEqual(c.convert('1'), 1);
		assert.throws(() => c.convert([2]));
	});


	test(`clone`, () => {
		const converter = new Converter((i) => typeof i === 'number', () => 0).undefined(() => 1);
		const clone = converter.clone().undefined(() => 2);

		assert.strictEqual(converter.convert(), 1);
		assert.strictEqual(clone.convert(), 2);
	});

});
