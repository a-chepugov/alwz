import assert from 'assert';
import * as a from './index';

describe('index', () => {

	describe('default', () => {

		test('retrieving with existence check', () => {
			const c1 = a.default.converter('number');
			assert.strictEqual(c1 instanceof a.Converter, true);
			const c2 = a.default.converter('date');
			assert.strictEqual(c2 instanceof a.Converter, true);
			assert.throws(() => {
				a.default.converter('123');
			});
		});

		test('direct retrieving', () => {
			const array = a.default.get('array');
			const arrayFromDSV = array.clone().string((i) => i.split(':')).convert;
			const result = arrayFromDSV('1:2:3').map(Number);
			assert.deepStrictEqual(result, [1, 2, 3]);
		});

	});

	describe('predefined `to` selector', () => {

		test('check', () => {
			assert.deepStrictEqual(a.to('int')('24.5'), 24);
			assert.deepStrictEqual(a.to('byte')(Infinity), 127);
			assert.deepStrictEqual(a.to('bigint')('42.5'), 42n);
		});

	});

	describe('presets', () => {

		test('check', () => {
			assert.deepStrictEqual(a.boolean([false, true]), false);
			assert.deepStrictEqual(a.ubyte(Infinity), 255);
			assert.deepStrictEqual(a.long(NaN), 0);
			assert.deepStrictEqual(a.array('123'), ['123']);
		});

	});

});

