import assert from 'node:assert';

describe('build:esm', () => {
	const root = '../build/esm/';

	const set = [
		{ name: 'index', path: 'index.mjs' },
		{ name: 'presets', path: 'presets.mjs' },
		{ name: 'cast', path: 'cast.mjs' },
		{ name: 'utils', path: 'utils.mjs' },
		{ name: 'is', path: 'is.mjs' },
		{ name: 'Is', path: 'models/Is.mjs' },
	];

	for (const { name, path } of set) {
		test(name, async () => {
			await assert.doesNotReject(async () => {
				await import(root + path);
			});
		});
	}

});
