import assert from 'node:assert';

describe('build:main', () => {
	const root = '../build/main/';

	const set = [
		{ name: 'index', path: 'index.js' },
		{ name: 'presets', path: 'presets.js' },
		{ name: 'cast', path: 'cast.js' },
		{ name: 'utils', path: 'utils.js' },
		{ name: 'is', path: 'is.js' },
		{ name: 'Is', path: 'models/Is.js' },
	];

	for (const { name, path } of set) {
		test(name, async () => {
			await assert.doesNotReject(async () => {
				await import(root + path);
			});
		});
	}

});
