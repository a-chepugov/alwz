const assert = require('node:assert');

describe('build:main', () => {
	test('import', () => {
		assert.doesNotThrow(() => {
			require('../build/main/index.js');
		});
	});
});

