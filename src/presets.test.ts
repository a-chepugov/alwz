import assert from 'assert';
import * as a from './index';

const isNaN = (o: any) => o !== o;

const MaxBigIntFromDbl = 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n;
const BI = BigInt;

const BMin = -(2 ** 7);
const BMax = (2 ** 7) - 1;
const UBMax = (2 ** 8) - 1;
const SMin = -(2 ** 15);
const SMax = (2 ** 15) - 1;
const USMax = (2 ** 16) - 1;
const IMin = -(2 ** 31);
const IMax = (2 ** 31) - 1;
const UIMax = (2 ** 32) - 1;
const LMin = Math.max(Number.MIN_SAFE_INTEGER, -(2 ** 63));
const LMax = Math.min(Number.MAX_SAFE_INTEGER, (2 ** 63) - 1);
const ULMax = Math.min(Number.MAX_SAFE_INTEGER, (2 ** 64) - 1);

const NumMin = -Number.MAX_VALUE;
const NumMax = Number.MAX_VALUE;
const NumMaxStr = String(NumMax);
const NumMinStr = String(NumMin);
const IntMin = Number.MIN_SAFE_INTEGER;
const IntMax = Number.MAX_SAFE_INTEGER;
const BIMaxDbl = BigInt(Number.MAX_VALUE);
const BIMaxDbl2 = BIMaxDbl * 2n;
const BIMaxDbl2S = String(BIMaxDbl2);
const _2p46 = 2 ** 46;

describe('presets', () => {

	describe('trivial ', () => {

		const sets = [
			[ '-------'             , [ 'boolean', 'number' , 'byte', 'short', 'int', 'long', 'ubyte', 'ushort', 'uint', 'ulong', 'string'                  , 'symbol'                              , ] ],
			[ undefined             , [ false    , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , ''                        , Symbol.for('')                        , ] ],
			[ null                  , [ false    , 0        , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , ''                        , Symbol.for('')                        , ] ],
			[ false                 , [ false    , 0        , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , ''                        , Symbol.for('')                        , ] ],
			[ true                  , [ true     , 1        , 1     , 1      , 1    , 1     , 1      , 1       , 1     , 1      , ' '                       , Symbol.for(' ')                       , ] ],
			[ NaN                   , [ false    , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , ''                        , Symbol.for('')                        , ] ],
			[ 0                     , [ false    , 0        , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , '0'                       , Symbol.for('0')                       , ] ],
			[ -2                    , [ true     , -2       , -2    , -2     , -2   , -2    , 0      , 0       , 0     , 0      , '-2'                      , Symbol.for('-2')                      , ] ],
			[ 2                     , [ true     , 2        , 2     , 2      , 2    , 2     , 2      , 2       , 2     , 2      , '2'                       , Symbol.for('2')                       , ] ],
			[ 2.5                   , [ true     , 2.5      , 2     , 2      , 2    , 2     , 2      , 2       , 2     , 2      , '2.5'                     , Symbol.for('2.5')                     , ] ],
			[ NumMin                , [ true     , NumMin   , BMin  , SMin   , IMin , LMin  , 0      , 0       , 0     , 0      , NumMinStr                 , Symbol.for(NumMinStr)                 , ] ],
			[ NumMax                , [ true     , NumMax   , BMax  , SMax   , IMax , LMax  , UBMax  , USMax   , UIMax , LMax   , NumMaxStr                 , Symbol.for(NumMaxStr)                 , ] ],
			[ -Infinity             , [ true     , -Infinity, BMin  , SMin   , IMin , LMin  , 0      , 0       , 0     , 0      , '-Infinity'               , Symbol.for('-Infinity')               , ] ],
			[ Infinity              , [ true     , Infinity , BMax  , SMax   , IMax , LMax  , UBMax  , USMax   , UIMax , LMax   , 'Infinity'                , Symbol.for('Infinity')                , ] ],
			[ 0n                    , [ false    , 0        , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , '0'                       , Symbol.for('0')                       , ] ],
			[ 3n                    , [ true     , 3        , 3     , 3      , 3    , 3     , 3      , 3       , 3     , 3      , '3'                       , Symbol.for('3')                       , ] ],
			[ -3n                   , [ true     , -3       , -3    , -3     , -3   , -3    , 0      , 0       , 0     , 0      , '-3'                      , Symbol.for('-3')                      , ] ],
			[ BIMaxDbl2             , [ true     , Infinity , BMax  , SMax   , IMax , LMax  , UBMax  , USMax   , UIMax , ULMax  , BIMaxDbl2S                , Symbol.for(BIMaxDbl2S )               , ] ],
			[ ''                    , [ false    , 0        , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , ''                        , Symbol.for('')                        , ] ],
			[ ' '                   , [ true     , 0        , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , ' '                       , Symbol.for(' ')                       , ] ],
			[ 'undefined'           , [ true     , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , 'undefined'               , Symbol.for('undefined')               , ] ],
			[ 'NaN'                 , [ true     , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , 'NaN'                     , Symbol.for('NaN')                     , ] ],
			[ '0'                   , [ true     , 0        , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , '0'                       , Symbol.for('0')                       , ] ],
			[ '3'                   , [ true     , 3        , 3     , 3      , 3    , 3     , 3      , 3       , 3     , 3      , '3'                       , Symbol.for('3')                       , ] ],
			[ '3.5'                 , [ true     , 3.5      , 3     , 3      , 3    , 3     , 3      , 3       , 3     , 3      , '3.5'                     , Symbol.for('3.5')                     , ] ],
			[ '-Infinity'           , [ true     , -Infinity, BMin  , SMin   , IMin , LMin  , 0      , 0       , 0     , 0      , '-Infinity'               , Symbol.for('-Infinity')               , ] ],
			[ 'abc'                 , [ true     , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , 'abc'                     , Symbol.for('abc')                     , ] ],
			[ Symbol.for('')        , [ false    , 0        , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , ''                        , Symbol.for('')                        , ] ],
			[ Symbol.for('123')     , [ true     , 123      , 123   , 123    , 123  , 123   , 123    , 123     , 123   , 123    , '123'                     , Symbol.for('123')                     , ] ],
			[ Symbol.for('NaN')     , [ true     , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , 'NaN'                     , Symbol.for('NaN')                     , ] ],
			[ Symbol.for('Infinity'), [ true     , Infinity , BMax  , SMax   , IMax , LMax  , UBMax  , USMax   , UIMax , LMax   , 'Infinity'                , Symbol.for('Infinity')                , ] ],
			[ { 6: 6 }              , [ true     , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , '[object Object]'         , Symbol.for('[object Object]')         , ] ],
			[ ['5.5']               , [ true     , 5.5      , 5     , 5      , 5    , 5     , 5      , 5       , 5     , 5      , '5.5'                     , Symbol.for('5.5')                     , ] ],
			[ [[[['5.5']]]]         , [ true     , 5.5      , 5     , 5      , 5    , 5     , 5      , 5       , 5     , 5      , '5.5'                     , Symbol.for('5.5')                     , ] ],
			[ [1.5, 2, 3]           , [ true     , 1.5      , 1     , 1      , 1    , 1     , 1      , 1       , 1     , 1      , '1.5'                     , Symbol.for('1.5')                     , ] ],
			[ () => 7               , [ true     , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , '() => 7'                 , Symbol.for('() => 7')                 , ] ],
			[ new Date(NaN)         , [ false    , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , ''                        , Symbol.for('')                        , ] ],
			[ new Date(0)           , [ false    , 0        , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , '1970-01-01T00:00:00.000Z', Symbol.for('1970-01-01T00:00:00.000Z'), ] ],
			[ new Date(99)          , [ true     , 99       , 99    , 99     , 99   , 99    , 99     , 99      , 99    , 99     , '1970-01-01T00:00:00.099Z', Symbol.for('1970-01-01T00:00:00.099Z'), ] ],
			[ new Date(_2p46)       , [ true     , _2p46    , BMax  , SMax   , IMax , _2p46 , UBMax  , USMax   , UIMax , _2p46  , '4199-11-24T01:22:57.664Z', Symbol.for('4199-11-24T01:22:57.664Z'), ] ],
			[ new Map()             , [ true     , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , '[object Map]'            , Symbol.for('[object Map]')            , ] ],
			[ new WeakMap()         , [ true     , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , '[object WeakMap]'        , Symbol.for('[object WeakMap]')        , ] ],
			[ new Set()             , [ true     , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , '[object Set]'            , Symbol.for('[object Set]')            , ] ],
			[ new WeakSet()         , [ true     , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , '[object WeakSet]'        , Symbol.for('[object WeakSet]')        , ] ],
			[ Promise.resolve()     , [ true     , NaN      , 0     , 0      , 0    , 0     , 0      , 0       , 0     , 0      , '[object Promise]'        , Symbol.for('[object Promise]')        , ] ],
		];
		// eslint-disable-next-line
		const [[ _, names ], ...datas ] = sets;

		for (let converterIndex = 0; converterIndex < names.length; converterIndex++) {
			const converterName = names[converterIndex];
			const converter = a.to(converterName);

			describe(converterName, () => {
				for (const data of datas) {
					const [ input, results ] = data;
					const result = results[converterIndex];
					const name = `${String(converterName)} (${String(input)}) -> ${String(result)}`;

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
				{ input: null, check: (o: any) => o.length === 0},
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
					const {work, input, type, instance, result, check} = tests[index];
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
					});
				}
			});
		}

	});

});

