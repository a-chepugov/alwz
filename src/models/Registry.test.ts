import assert from 'assert';
import Registry from './Registry';

describe('Registry', () => {

	test('`set` inserts an item', () => {
		const r = new Registry();
		assert.strictEqual(r.size, 0);
		r.set(1, 'a');
		assert.strictEqual(r.size, 1);
	});

	test('`del` removes an item', () => {
		const r = new Registry();
		r.set(1, 'a');
		assert.strictEqual(r.size, 1);

		r.del(1);
		assert.strictEqual(r.size, 0);
	});

	test('`has` returns `false` for an absent item', () => {
		const r = new Registry();
		r.set(1, 'a');
		assert.strictEqual(r.has(2), false);
	});

	test('`has` returns `true` for an existing item', () => {
		const r = new Registry();
		r.set(1, 'a');
		assert.strictEqual(r.has(1), true);
	});

	test('`keys` returns inserted items names list', () => {
		const r = new Registry();
		r.set(1, 'a');
		r.set(2, 'b');
		const list = Array.from(r.keys());
		assert.strictEqual(list.length, 2);
		assert.strictEqual(list[0], 1);
	});

	test('`values` returns inserted items list', () => {
		const r = new Registry();
		r.set(1, 'a');
		r.set(2, 'b');
		const list = Array.from(r.values());
		assert.strictEqual(list.length, 2);
		assert.strictEqual(list[0], 'a');
	});

	test('`entries` returns inserted items `name/value` list', () => {
		const r = new Registry();
		r.set(1, 'a');
		r.set(2, 'b');
		const list = Array.from(r.entries());
		assert.strictEqual(list.length, 2);
		assert.strictEqual(list[0][0], 1);
		assert.strictEqual(list[0][1], 'a');
	});

});
