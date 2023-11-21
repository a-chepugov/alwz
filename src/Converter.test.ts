import assert from 'assert';
import Converter from './Converter';

describe('Converter', () => {

	describe('example', () => {

		const positive = new Converter(
			(input): input is unknown => typeof input === 'number' && input > 0,
			(i) => i === 0 ? 0.1 : 0.2
		);

		positive
			.undefined(() => 0.3)
			.boolean((i) => i ? 1 : 0.4)
			.number(function(i) {
				const result = Math.abs(i);
				return this.is(result) ? result : this.fallback(i);
			})
			.bigint((i) => positive.convert(Number(i)))
			.string((i) => positive.convert(Number(i)))
			.symbol((i) => positive.convert(Symbol.keyFor(i)))
			.register(Array.isArray, (i) => positive.convert(i[0]))
			.register((i): i is null => i === null, () => 0.5);

		test(`1 gives 1`, () => {
			assert.strictEqual(positive.convert(1), 1);
		});

		test(`0 gives 0.1 (fallback)`, () => {
			assert.strictEqual(positive.convert(0), 0.1);
		});

		test(`NaN gives 0.1 (fallback)`, () => {
			assert.strictEqual(positive.convert(NaN), 0.2);
		});

		test(`undefined gives 0.2 (has own handler)`, () => {
			assert.strictEqual(positive.convert(undefined), 0.3);
		});

		test(`false gives 0.3 (has own handler)`, () => {
			assert.strictEqual(positive.convert(false), 0.4);
		});

		test(`null gives 0.4 (has own handler)`, () => {
			assert.strictEqual(positive.convert(null), 0.5);
		});

		test(`'2' gives 2`, () => {
			assert.strictEqual(positive.convert(2), 2);
		});

		test(`-3 gives 3`, () => {
			assert.strictEqual(positive.convert(-3), 3);
		});

		test(`'4' gives 4`, () => {
			assert.strictEqual(positive.convert(4), 4);
		});

		test(`[5, 6] gives 5`, () => {
			assert.strictEqual(positive.convert([5, 6]), 5);
		});

	});

	test(`static method 'assert' throws on invalid instance`, () => {
		assert.throws(() => Converter.assert(null));
	});

	test(`static method 'assert' passes on normal instance`, () => {
		assert.doesNotThrow(() => Converter.assert(new Converter((i: any): i is number => typeof i === 'number', () => 1)));
	});


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

	test(`'is' property can be changed`, () => {
		const conv = new Converter((i) => typeof i === 'number', () => 1);

		assert.strictEqual(conv.convert('a'), 1);

		conv.is = () => true;
		assert.strictEqual(conv.convert('a'), 'a');
	});

	test(`'fallback' property can be changed`, () => {
		const conv = new Converter((i) => typeof i === 'number', () => 1);

		assert.strictEqual(conv.convert('a'), 1);

		conv.fallback = () => 2;
		assert.strictEqual(conv.convert('a'), 2);
	});

	test('register method first argument must be a function', () => {
		const converter = new Converter(Number.isFinite, () => 0);
		assert.throws(() => converter.register(null, () => 1));
	});

	test('register method second argument must be a function', () => {
		const converter = new Converter(Number.isFinite, () => 0);
		assert.throws(() => converter.register(Array.isArray, null));
	});

	test('register method add converter into internal register', () => {
		const converter = new Converter(Number.isFinite, () => 0);
		assert.strictEqual(converter.convert([1]), 0);

		converter.register(Array.isArray, (i) => converter.convert(i[0]));
		assert.strictEqual(converter.convert([1]), 1);
	});


	test('unregister method removes converter from internal register', () => {
		const converter = new Converter(Number.isFinite, () => 0);

		converter.register(Array.isArray, (i) => converter.convert(i[0]));
		assert.strictEqual(converter.convert([1]), 1);

		converter.unregister(Array.isArray);
		assert.strictEqual(converter.convert([1]), 0);
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
