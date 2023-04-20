import assert from 'assert';
import Aggregator from './Aggregator';
import Converter from './Converter';

describe('Registry', () => {
	const even = new Converter((input: any) => !Boolean(input % 2), () => 2);

	test(`register adds items`, () => {

		const a = new Aggregator();
		assert.strictEqual(a.converters.length, 0);
		a.register('even', even);

		assert.strictEqual(a.converters.length, 1);
	});

	test(`registering duplicates causes an error`, () => {
		const a = new Aggregator();
		a.register('even', even);
		assert.throws(() => a.register('even', even));
	});

	test(`registering not Converter instances causes an error`, () => {
		const a = new Aggregator();
		assert.throws(() => a.register('even', 123));
	});

	test(`attempt to get absent Converter causes an error`, () => {
		const a = new Aggregator();
		assert.throws(() => a.converter('even'));
	});

	test(`to method returns convertion function`, () => {
		const a = new Aggregator();
		a.register('even', even);
		assert.strictEqual(a.to('even')(1), 2);
		assert.strictEqual(a.to('even')(2), 2);
		assert.strictEqual(a.to('even')(4), 4);
	});

});
