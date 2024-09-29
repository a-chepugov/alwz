const assert = require('node:assert');

describe('build:cjs', () => {
	test('import', () => {
		assert.doesNotThrow(() => {
			require('../build/cjs/index.cjs');
		});
	});
});

