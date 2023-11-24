Extendable library for typecasting.

# Usage

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## Import

### Examples

```javascript
import * as a from 'alwz';
// or
const a = require('alwz');
```

## Predefined

*   **See**: [presets](#presets)

convert data with presetted converters

### Examples

```javascript
a.boolean([false, true]); // false
a.byte('3'); // 3
a.short(false); // 0
a.int(true); // 1
a.long(NaN); // 0
a.uint(Infinity); // 4294967295
a.array('1'); // ['1']
a.array(['1', '2', '3']); // ['1', '2', '3']
```

## Utils

*   **See**: [utils](#utils)

construct complex data

### Examples

ensure an array output

```javascript
const array = a.utils.array;
const ArrayOfUByte = array(a.ubyte);
ArrayOfUByte([undefined, true, 2.3, '4', Infinity]); // [0, 1, 2, 4, 255]
```

simplify multidimensional arrays processing

```javascript
const array = a.utils.array;

const Bytes3dArray = array(array(array(a.byte)));

Bytes3dArray(1); // [[[1]]];
Bytes3dArray([[[null, NaN, 'a'], [true, '2', 3]], [[-Infinity]]]); // [[[0, 0, 0], [1, 2, 3]], [[-128]]];
```

create tuples

```javascript
const tuple = a.utils.tuple;
const Pair = tuple([a.uint, a.uint]);
Pair(['abc', 35, 100]); // [0, 35]

const NativePair = tuple([Number, Number]);
NativePair(['abc', 35, 100]); // [NaN, 35]
```

parse colon-separated number/string mixed records

```javascript
const PathArray = a.default.get('array')
  .clone()
  .string((i) => [...i.matchAll(/\/(\w+)/g)].map((i) => i[1]))
  .convert;

const DSV2Tuple = a.utils.tuple(
  [String, String, Number, Number, String, PathArray, PathArray],
  a.default.get('array')
    .clone()
    .string((i) => i.split(':'))
    .convert
);

const input = 'user:12345:1000:1000:ordinar user:/home/user:/bin/sh';
const result = DSV2Tuple(input);
const expected = ['user', '12345', 1000, 1000, 'ordinar user', ['home', 'user'], ['bin', 'sh']];
assert.deepStrictEqual(result, expected);
```

## Transform

*   **See**: [Converter](#converter)

create custom converters

### Examples

```javascript
const even = new a.Converter(
  (input) => typeof input === 'number' && input % 2 === 0,
  (input) => Number(input) % 2 === 0 ? Number(input) : 0
);

even
  .undefined(() => -2)
  .boolean((input) => input ? -4 : -6)
  .number(function(input) {
    const result = Math.trunc(Math.abs(input || 0) / 2) * 2;
    return this.is(result) ? result : this.fallback(input);
  })
  .string((input) => even.convert(Number(input)))
  .register(Array.isArray, (input) => even.convert(input[0]));

even.convert(8); // 8
even.convert(undefined); // -2
even.convert(false); // -6
even.convert(NaN); // 0
even.convert(9); // 8
even.convert('11'); // 10
even.convert([17, 18, 19]); // 16
```

## Selector

dynamically select convert function (based on predefined converters)

### Examples

```javascript
a.to('int')('24.5'); // 24
a.to('byte')(Infinity); // 127
a.to('bigint')('42.5'); // 42n
```

## Converters

registry of predefined converters

### Examples

```javascript
// retrieving with existence check
const Num = a.default.converter('number'); // Converter<number>
const Str = a.default.converter('string'); // Converter<string>
a.default.converter('123'); // Error

// direct retrieving
const Arr = a.default.get('array'); // Converter<Array>
const Unknown = a.default.get('123'); // undefined
```

## presets

### boolean

#### Examples

```javascript
boolean.convert('abc'); // true
boolean.convert(Symbol.for('')); // false
boolean.convert([]); // false
boolean.convert([0]); // false
boolean.convert([false, true]); // false
boolean.convert([123]); // true
```

### number

#### Examples

```javascript
number.convert(Infinity); // Infinity
number.convert('42'); // 42
number.convert('abc'); // NaN
number.convert(Symbol.for('42')); // 42
number.convert(new Date('1970-01-01T00:00:00.042Z')); // 42
number.convert(['42']); // 42
number.convert([ [ [ 42 ] ] ]); // 42
number.convert(new Date('1970-01-01T00:00:00.999Z')); // 999
```

### integers

    | type   |              min |              max |
    |--------|------------------|------------------|
    | byte   |             -128 |              127 |
    | short  |           -32768 |            32767 |
    | int    |      -2147483648 |       2147483647 |
    | long   | MIN_SAFE_INTEGER | MAX_SAFE_INTEGER |
    |--------|------------------|------------------|
    | ubyte  |                0 |              255 |
    | ushort |                0 |            65535 |
    | uint   |                0 |       4294967295 |
    | ulong  |                0 | MAX_SAFE_INTEGER |
    |--------|------------------|------------------|

#### Examples

```javascript
int.convert(undefined); // 0
int.convert(null); // 0
int.convert(NaN); // 0
int.convert('abc'); // 0
int.convert(true); // 1
int.convert(42.5); // 42
int.convert('42.5'); // 42
int.convert(['42.5']); // 42
int.convert(Symbol.for('42.5')); // 42
int.convert(new Date('1970-01-01T00:00:00.042Z')); // 42
int.convert(new Date(NaN)); // 0
```

### signed

cast to byte, short (2 bytes), int (4 bytes) or long (8 bytes)

#### Examples

```javascript
byte.convert(128); // 127
byte.convert(Infinity); // 127
byte.convert(-Infinity); // -128
short.convert(Infinity); // 32767
short.convert(-Infinity); // -32768
int.convert(Infinity); // 2147483647
int.convert(-Infinity); // -2147483648
long.convert(Infinity); // MAX_SAFE_INTEGER
long.convert(-Infinity); // MIN_SAFE_INTEGER
```

### unsigned

cast to ubyte, ushort (2 bytes), uint (4 bytes) or ulong (8 bytes)

#### Examples

```javascript
ubyte.convert(-7); // 0
ubyte.convert('a'); // 0
ubyte.convert(Infinity); // 255
ubyte.convert(-Infinity); // 0
ushort.convert(Infinity); // 65535
ushort.convert(-Infinity); // 0
uint.convert(Infinity); // 4294967295
uint.convert(-Infinity); // 0
ulong.convert(Infinity); // MAX_SAFE_INTEGER
ulong.convert(-Infinity); // 0
```

### double

#### Examples

```javascript
double.convert('42.5'); // 42.5
double.convert(Infinity); // Number.MAX_VALUE
double.convert(NaN); // 0
```

### bigint

#### Examples

```javascript
bigint.convert(42.5); // 42n
bigint.convert('42'); // 42n
bigint.convert('42.5'); // 0n
bigint.convert(Symbol.for('42')); // 42n
bigint.convert(new Date('1970-01-01T00:00:00.999Z')); // 999n
```

### string

#### Examples

```javascript
string.convert(); // ''
string.convert(null); // ''
string.convert(false); // ''
string.convert(true); // ' '
string.convert(42.5); // '42.5'
string.convert([1, 2, 3]); // '1'
string.convert(Symbol.for('42')); // '42'
string.convert(new Date('1970-01-01T00:00:00.999Z')); // '1970-01-01T00:00:00.999Z'
```

### symbol

#### Examples

```javascript
symbol.convert(false); // Symbol('')
symbol.convert(42.5); // Symbol('42.5')
symbol.convert('42.5'); // Symbol('42.5')
symbol.convert([1.5, 2, 3]); Symbol('1.5')
symbol.convert(new Date('1970-01-01T00:00:00.999Z')); // Symbol('1970-01-01T00:00:00.999Z')
```

### array

#### Examples

```javascript
array.convert(); // []
array.convert(null); // []
array.convert(false); // [false]
array.convert(123); // [123]
array.convert('1,2,3'); // ['1,2,3']
array.convert(new Set([1, 2, 3])); // [1, 2, 3]
array.convert(new Map([[1, 2], [3, 4], [5, 6]])); // [[1, 2], [3, 4], [5, 6]]
```

### fn

#### Examples

```javascript
fn.convert((a, b) => a + b); // (a, b) => a + b
fn.convert(123); // () => 123
```

### date

#### Examples

```javascript
date.convert(111); // Date('1970-01-01T00:00:00.111Z')
date.convert([222, 333]); // Date('1970-01-01T00:00:00.222Z')
date.convert('abc'); // Date(NaN)
```

### map

#### Examples

```javascript
map.convert([ [true, 1], 2, '3']); // Map { [true, 1] }
```

### weakmap

#### Examples

```javascript
weakmap.convert([ [Boolean, 'bool'], [Number, 'num'], [String, 'str'], [true, 1], 2, '3']); // WeakMap { [Boolean, 'bool'], [Number, 'num'], [String, 'str'] }
```

### set

#### Examples

```javascript
set.convert([1, '2', 3]); // Set {1, "2", 3}
```

### weakset

#### Examples

```javascript
weakset.convert([Boolean, Number, String, true, 2, '3']); // WeakSet { Boolean, Number, String }
```

### promise

#### Examples

```javascript
promise.convert(Promise.resolve(1)); // Promise { 1 }
promise.convert(42); // Promise { 42 }
```

## Converter

converts input data to specific type

### Parameters

*   `is` **IS\<T>** default input type checker. checks if conversion is necessary
*   `fallback` **Fallback\<T>** default value generator. runs if none of the available converters are suitable

### convert

converts data according to saved rules

#### Parameters

*   `input` **any** input data

#### Examples

converter creation

```javascript
const positive = new Converter(
  (input) => typeof input === 'number' && input > 0,
  (i) => i === 0 ? 0.1 : 0.2
);

positive
  .undefined(() => 0.3)
  .boolean((i) => i ? 1 : 0.4)
  .number(function(i) {
    const result = Math.abs(i)
    return this.is(result) ? result : this.fallback(i);
  })
  .string((i) => positive.convert(Number(i)))
  .symbol((i) => positive.convert(Symbol.keyFor(i)))
  .bigint((i) => positive.convert(Number(i)))
  .register(Array.isArray, (i) => positive.convert(i[0]))
  .register((i) => i === null, (i) => 0.5);

positive.convert(1); // 1
positive.convert(0); // 0.1 (fallback)
positive.convert(NaN); // 0.2 (fallback)
positive.convert(undefined); // 0.3 (has own handler)
positive.convert(false); // 0.4 (has own handler)
positive.convert(null); // 0.5 (has own handler)
positive.convert(2n); // 2
positive.convert(-3); // 3
positive.convert('4'); // 4
positive.convert([5, 6]); // 5
```

converter with conversion error

```javascript
const converter = new Converter((input) => typeof input === 'number', (i) => {
  throw new Error('Invalid source data: ' + i);
})
 .string((i) => converter.convert(Number(i)))
;

converter.convert(1); // 1
converter.convert('2'); // 2
converter.convert(3n); // Error
```

### register

add transform function for `INPUT` type

#### Parameters

*   `is` **IS\<INPUT>** input type checker, determines if input can be processed by `convert`
*   `convert` **Convert\<INPUT, T>** `INPUT` to `T` convert function

### unregister

remove transform function for `INPUT` type from conversions list

#### Parameters

*   `is` **IS\<INPUT>** input type checker

### undefined

conversion rule setter for `undefined` input

#### Parameters

*   `convert`  

### boolean

conversion rule setter for `boolean` input

#### Parameters

*   `convert`  

### number

conversion rule setter for `number` input

#### Parameters

*   `convert`  

### bigint

conversion rule setter for `bigint` input

#### Parameters

*   `convert`  

### string

conversion rule setter for `string` input

#### Parameters

*   `convert`  

### symbol

conversion rule setter for `symbol` input

#### Parameters

*   `convert`  

### clone

#### Examples

```javascript
const converter = new Converter((i) => typeof i === 'number', () => 0).undefined(() => 1);
const clone = converter.clone().undefined(() => 2)
converter.convert(); // 1
clone.convert(); // 2
```

## utils

extra utils functions

### Examples

```javascript
const { array, tuple } = a.utils;
```

### array

constrain data to an array elements of a given type

#### Parameters

*   `fn` **Convert\<any, T>** 
*   `initiator` **Convert\<any, [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<any>>**  (optional, default `presets.array.convert`)

#### Examples

```javascript
const numArray = array(Number);
numArray(); // []
numArray([]); // []
numArray([true, 2, "3", {}]); // [1, 2, 3, NaN]
```

Returns **Convert\<any, [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<T>>** 

### tuple

constrain data to a tuple with given types

#### Parameters

*   `fns` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<Convert\<any, any>>** 
*   `initiator` **Convert\<any, [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<any>>**  (optional, default `presets.array.convert`)

#### Examples

```javascript
const tplNSB = tuple(Number, String, Boolean);
tplNSB(); // [NaN, 'undefined', false]
tplNSB(null); // [NaN, 'undefined', false]
tplNSB([]); // [NaN, '', false]
tplNSB('5'); // [5, 'undefined', false]
tplNSB(['1', '2', '3']); // [1, '2', true]
```

Returns **Convert\<any, [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<any>>** 
