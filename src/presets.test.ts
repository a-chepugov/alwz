import assert from 'assert';
import * as a from './index';

const isNaN = (o: any) => o !== o;

const MaxBigIntFromDbl = 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n;

describe('presets', () => {

	describe('trivial ', () => {

		const sets = [
			[ '-------'              , [ 'boolean', 'number'  , 'string'                  , 'symbol'                              , ] ],
			[ undefined              , [ false    , NaN       , ''                        , Symbol.for('')                        , ] ],
			[ false                  , [ false    , 0         , ''                        , Symbol.for('')                        , ] ],
			[ true                   , [ true     , 1         , ' '                       , Symbol.for(' ')                       , ] ],
			[ 0                      , [ false    , 0         , '0'                       , Symbol.for('0')                       , ] ],
			[ -2                     , [ true     , -2        , '-2'                      , Symbol.for('-2')                      , ] ],
			[ 2                      , [ true     , 2         , '2'                       , Symbol.for('2')                       , ] ],
			[ 2.5                    , [ true     , 2.5       , '2.5'                     , Symbol.for('2.5')                     , ] ],
			[ Infinity               , [ true     , Infinity  , 'Infinity'                , Symbol.for('Infinity')                , ] ],
			[ -Infinity              , [ true     , -Infinity , '-Infinity'               , Symbol.for('-Infinity')               , ] ],
			[ NaN                    , [ false    , NaN       , ''                        , Symbol.for('')                        , ] ],
			[ 0n                     , [ false    , 0         , '0'                       , Symbol.for('0')                       , ] ],
			[ 3n                     , [ true     , 3         , '3'                       , Symbol.for('3')                       , ] ],
			[ -3n                    , [ true     , -3        , '-3'                      , Symbol.for('-3')                      , ] ],
			[ ''                     , [ false    , 0         , ''                        , Symbol.for('')                        , ] ],
			[ ' '                    , [ true     , 0         , ' '                       , Symbol.for(' ')                       , ] ],
			[ 'undefined'            , [ true     , NaN       , 'undefined'               , Symbol.for('undefined')               , ] ],
			[ '0'                    , [ true     , 0         , '0'                       , Symbol.for('0')                       , ] ],
			[ '3'                    , [ true     , 3         , '3'                       , Symbol.for('3')                       , ] ],
			[ '3.5'                  , [ true     , 3.5       , '3.5'                     , Symbol.for('3.5')                     , ] ],
			[ '-Infinity'            , [ true     , -Infinity , '-Infinity'               , Symbol.for('-Infinity')               , ] ],
			[ 'NaN'                  , [ true     , NaN       , 'NaN'                     , Symbol.for('NaN')                     , ] ],
			[ 'abc'                  , [ true     , NaN       , 'abc'                     , Symbol.for('abc')                     , ] ],
			[ Symbol.for('-Infinity'), [ true     , -Infinity , '-Infinity'               , Symbol.for('-Infinity')               , ] ],
			[ Symbol.for('NaN')      , [ true     , NaN       , 'NaN'                     , Symbol.for('NaN')                     , ] ],
			[ Symbol.for('')         , [ true     , 0         , ''                        , Symbol.for('')                        , ] ],
			[ Symbol.for('123')      , [ true     , 123       , '123'                     , Symbol.for('123')                     , ] ],
			[ null                   , [ false    , 0         , ''                        , Symbol.for('')                        , ] ],
			[ { 6: 6 }               , [ true     , NaN       , '[object Object]'         , Symbol.for('[object Object]')         , ] ],
			[ ['5.5']                , [ true     , 5.5       , '5.5'                     , Symbol.for('5.5')                     , ] ],
			[ () => 7                , [ true     , NaN       , '() => 7'                 , Symbol.for('() => 7')                 , ] ],
			[ new Date(NaN)          , [ false    , NaN       , ''                        , Symbol.for('')                        , ] ],
			[ new Date(0)            , [ false    , 0         , '1970-01-01T00:00:00.000Z', Symbol.for('1970-01-01T00:00:00.000Z'), ] ],
			[ new Date(9999999999)   , [ true     , 9999999999, '1970-04-26T17:46:39.999Z', Symbol.for('1970-04-26T17:46:39.999Z'), ] ],
			[ new Map()              , [ true     , NaN       , '[object Map]'            , Symbol.for('[object Map]')            , ] ],
			[ new WeakMap()          , [ true     , NaN       , '[object WeakMap]'        , Symbol.for('[object WeakMap]')        , ] ],
			[ new Set()              , [ true     , NaN       , '[object Set]'            , Symbol.for('[object Set]')            , ] ],
			[ new WeakSet()          , [ true     , NaN       , '[object WeakSet]'        , Symbol.for('[object WeakSet]')        , ] ],
			[ Promise.resolve()      , [ true     , NaN       , '[object Promise]'        , Symbol.for('[object Promise]')        , ] ],
		];

		const [[ _, names ], ...datas ] = sets;

		for (let converterIndex = 0; converterIndex < names.length; converterIndex++) {
			const converterName = names[converterIndex];
			const converter = a.to(converterName);

			describe(converterName, () => {
				for (const data of datas) {
					const [ input, results ] = data;
					const result = results[converterIndex];
					let name = `${String(converterName)} (${String(input)}) -> ${String(result)}`;

					test(name, () => {
						assert.strictEqual(converter(input), result);
					});
				}
			});
		}

	});

	describe('complex', () => {

		const sets = [{
			name: 'fn', tests: [
				{ input: undefined, check: (o: any, i: any) => o() === i},
				{ input: null, check: (o: any, i: any) => o() === i},
				{ input: true, check: (o: any, i: any) => o() === i},
				{ input: 2, check: (o: any, i: any) => o() === i},
				{ input: 2.5, check: (o: any, i: any) => o() === i},
				{ input: '3', check: (o: any, i: any) => o() === i},
				{ input: '3.5', check: (o: any, i: any) => o() === i},
				{ input: 'abc', check: (o: any, i: any) => o() === i},
				{ input: 4n, check: (o: any, i: any) => o() === i},
				{ input: Symbol.for('123'), check: (o: any, i: any) => o() === i},
				{ input: [], check: (o: any, i: any) => o() === i},
				{ input: ['5.5'], check: (o: any, i: any) => o() === i},
				{ input: ['5.5', '6'], check: (o: any, i: any) => o() === i},
				{ input: {6: 6}, check: (o: any, i: any) => o() === i},
				{ input: () => 7, check: (o: any, i: any) => o === i},
				{ input: new Date(8), check: (o: any, i: any) => o() === i},
				{ input: new Map, check: (o: any, i: any) => o() === i},
				{ input: new WeakMap, check: (o: any, i: any) => o() === i},
				{ input: new Set, check: (o: any, i: any) => o() === i},
				{ input: new WeakSet, check: (o: any, i: any) => o() === i},
				{ input: Promise.resolve(), check: (o: any, i: any) => o() === i},
			].map(({ input, result, check }) => ({ work: a.fn, type: 'function', input, result, check	}))
		}, {
			name: 'date', tests: [
				{ input: undefined, check: (o: any) => isNaN(o.getTime())},
				{ input: null, check: (o: any) => isNaN(o.getTime())},
				{ input: true, check: (o: any) => o.getTime() === 1},
				{ input: 2, check: (o: any) => o.getTime() === 2},
				{ input: 2.5, check: (o: any) => o.getTime() === 2},
				{ input: '3', check: (o: any) => o.getTime() === 983397600000},
				{ input: '3.5', check: (o: any) => o.getTime() === 983743200000},
				{ input: 'abc', check: (o: any) => isNaN(o.getTime())},
				{ input: 4n, check: (o: any) => o.getTime() === 4},
				{ input: Symbol.for('abc'), check: (o: any) => isNaN(o.getTime())},
				{ input: [], check: (o: any) => isNaN(o.getTime())},
				{ input: ['abc'], check: (o: any) => isNaN(o.getTime())},
				{ input: ['abc', 'def'], check: (o: any) => isNaN(o.getTime())},
				{ input: {6: 6}, check: (o: any) => isNaN(o.getTime())},
				{ input: () => 7, check: (o: any) => isNaN(o.getTime())},
				{ input: new Date(8), check: (o: any, i: any) => o === i},
				{ input: new Map, check: (o: any) => isNaN(o.getTime())},
				{ input: new WeakMap, check: (o: any) => isNaN(o.getTime())},
				{ input: new Set, check: (o: any) => isNaN(o.getTime())},
				{ input: new WeakSet, check: (o: any) => isNaN(o.getTime())},
				{ input: Promise.resolve(), check: (o: any) => isNaN(o.getTime())},
			].map(({ input, result, check }) => ({ work: a.date, instance: Date, input, result, check	}))
		}, {
			name: 'array', tests: [
				{ input: undefined, check: (o: any) => o.length === 0},
				{ input: null, check: (o: any, i: any) => o.length === 0},
				{ input: true, check: (o: any, i: any) => o[0] === i},
				{ input: 2, check: (o: any, i: any) => o[0] === i},
				{ input: 2.5, check: (o: any, i: any) => o[0] === i},
				{ input: '3', check: (o: any, i: any) => o[0] === i},
				{ input: '3.5', check: (o: any, i: any) => o[0] === i},
				{ input: 'abc', check: (o: any, i: any) => o[0] === i},
				{ input: 4n, check: (o: any, i: any) => o[0] === i},
				{ input: Symbol.for('123'), check: (o: any, i: any) => o[0] === i},
				{ input: [], check: (o: any, i: any) => o === i},
				{ input: ['5.5'], check: (o: any, i: any) => o === i},
				{ input: ['5.5', '6'], check: (o: any, i: any) => o === i},
				{ input: {6: 6}, check: (o: any, i: any) => o[0] === i},
				{ input: () => 7, check: (o: any, i: any) => o[0] === i},
				{ input: new Date(8), check: (o: any, i: any) => o[0] === i},
				{ input: new Map([[1, 2]]), check: (o: any) => o[0][1] === 2},
				{ input: new WeakMap, check: (o: any, i: any) => o[0] === i},
				{ input: new Set([1, 2]), check: (o: any) => o.length === 2},
				{ input: new WeakSet, check: (o: any, i: any) => o[0] === i},
				{ input: Promise.resolve(), check: (o: any, i: any) => o[0] === i},
			].map(({ input, result, check }) => ({ work: a.array, instance: Array, input, result, check	}))
		}, {
			name: 'map', tests: [
				{ input: undefined, check: (o: any) => o.size === 0},
					{ input: null, check: (o: any) => o.size === 0},
					{ input: 2, check: (o: any) => o.size === 0},
					{ input: [3], check: (o: any) => o.size === 0},
					{ input: [[3, 3]], check: (o: any) => o.has(3)},
					{ input: new Map, check: (o: any, i: any) => (o === i)},
			].map(({ input, result, check }) => ({ work: a.map, instance: Map, input, result, check	}))
		}, {
			name: 'weakmap', tests: [
				{ input: undefined, check: (o: any, i: any) => o.has(i) === false},
				{ input: null, check: (o: any, i: any) => o.has(i) === false},
				{ input: 2, check: (o: any, i: any) => o.has(i) === false},
				{ input: [3], check: (o: any, i: any) => o.has(i[0]) === false},
				{ input: [[3, 3]], check: (o: any, i: any) => o.has(i[0][0]) === false},
				{ input: [[{}, 3]], check: (o: any, i: any) => o.has(i[0][0])},
				{ input: new WeakMap, check: (o: any, i: any) => o === i},
			].map(({ input, result, check }) => ({ work: a.weakmap, instance: WeakMap, input, result, check	}))
		}, {
			name: 'set', tests: [
				{ input: undefined, check: (o: any) => o.size === 0},
				{ input: null, check: (o: any) => o.size === 0},
				{ input: true, check: (o: any) => o.size === 1},
				{ input: 2, check: (o: any) => o.size === 1},
				{ input: 2.5, check: (o: any) => o.size === 1},
				{ input: '3', check: (o: any) => o.size === 1},
				{ input: '3.5', check: (o: any) => o.size === 1},
				{ input: 'abc', check: (o: any) => o.size === 1},
				{ input: 4n, check: (o: any) => o.size === 1},
				{ input: Symbol.for('123'), check: (o: any) => o.size === 1},
				{ input: [], check: (o: any) => o.size === 0},
				{ input: ['5.5'], check: (o: any) => o.has('5.5')},
				{ input: ['5.5', '6'], check: (o: any) => o.has('6')},
				{ input: {6: 6}, check: (o: any) => o.size === 1},
				{ input: () => 7, check: (o: any) => o.size === 1},
				{ input: new Date(8), check: (o: any) => o.size === 1},
				{ input: new Map([[1, 'a'], [2, 'b']]), check: (o: any) => o.size === 2},
				{ input: new WeakMap, check: (o: any) => o.size === 1},
				{ input: new Set([3, 4]), check: (o: any) => o.has(3)},
				{ input: new WeakSet([Object, Number, String]), check: (o: any) => o.size === 1},
				{ input: Promise.resolve(), check: (o: any) => o.size === 1},
			].map(({ input, result, check }) => ({ work: a.set, instance: Set, input, result, check	}))
		}, {
			name: 'weakset', tests: [
				{ input: undefined, check: (o: any, i: any) => o.has(i) == false},
				{ input: null, check: (o: any, i: any) => o.has(i) == false},
				{ input: 2, check: (o: any, i: any) => o.has(i) === false},
				{ input: [{}], check: (o: any, i: any) => o.has(i[0])},
				{ input: [3], check: (o: any, i: any) => o.has(i[0]) === false},
				{ input: new WeakSet, check: (o: any, i: any) => (i === o)},
			].map(({ input, result, check }) => ({ work: a.weakset, instance: WeakSet, input, result, check	}))
		}];

		for (const {name, tests } of sets) {
			describe(name, () => {
				for (const index in tests) {
					const { work, input, type, instance, result, check } = tests[index];
					let n = `${String(name)}: ${index} | [${typeof input}] i:${String(input)} => `;
					n += type ? ` | [${type}]` : '';
					n += instance ? ` | [${instance}]` : '';
					n += result ? ` | r:${result}` : '';
					n += check ? ` | c:${check}` : '';

					test(n, () => {
						const data = work(input);
						if (type) {
							assert.strictEqual(typeof data, type);
						}
						if (instance) {
							assert(data instanceof instance);
						}
						if (result) {
							assert.strictEqual(data, result);
						}
						if (check) {
							assert(check(data, input));
						}
						expect(check(work(input), input)).toBe(true)
					});
				}
			});
		}
	})

})

