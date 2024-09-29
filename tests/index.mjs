import assert from 'node:assert';

describe('build:esm', () => {
	test('import', async () => {
		await assert.doesNotReject(async () => {
			await import('../build/esm/index.mjs');
		});
	});
});
