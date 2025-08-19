const assert = require('node:assert');

describe('build:cjs', () => {
	const root = '../build/cjs/';

	const set = [
		{ name: 'index', path: 'index.cjs' },
		{ name: 'presets', path: 'presets.cjs' },
		{ name: 'cast', path: 'cast.cjs' },
		{ name: 'utils', path: 'utils.cjs' },
		{ name: 'is', path: 'is.cjs' },
		{ name: 'Is', path: 'models/Is.cjs' },
	];

	for (const { name, path } of set) {
		test(name, () => {
			assert.doesNotThrow(() => {
				require(root + path);
			});
		});
	}

});
