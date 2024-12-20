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

## Types

*   **See**: [presets](#presets)

convert data with presetted converters

### Examples

```javascript
a.byte('3'); // 3
a.short(false); // 0
a.int(true); // 1
a.uint(Infinity); // 4294967295
a.long(NaN); // 0
a.long(['1', '2', '3']); // 1 | ['1','2','3'] => '1' => 1
a.array('abc'); // ['abc']
a.array([123, 'abc', {}, Math.max]); // [123, 'abc', {}, Math.max]
```

## Structures

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
Bytes3dArray([[[null, NaN, 'a'], [true, '2', 3]], [[Infinity]]]); // [[[0, 0, 0], [1, 2, 3]], [[127]]];
```

create tuples

```javascript
const tuple = a.utils.tuple;
const PairOfUint = tuple([a.uint, a.uint]);
PairOfUint(['abc', 3.5, 100]); // [0, 3]

const PairOfNumbers = tuple([Number, Number]);
PairOfNumbers(['abc', 3.5, 100]); // [NaN, 3.5]
```

## Transformations

*   **See**: [Converter](#converter)

create custom converters

### Examples

extend an existing converter

```javascript
// make boolean smarter
const bool = a.converters.get('boolean')
  .clone()
  .string(function(v) { // string input processing
    if (v === 'true' || v === 'yes') {
      return true;
    } else if (v === 'false' || v === 'no') {
      return false;
    } else {
      return this.types.number(Number(v));
    }
  })
  .convert;

bool('yes'); // true
bool('no'); // false
bool('false'); // false
```

parse colon-separated number/string records

```javascript
const PathArray = a.converters.get('array')
  .clone()
  .string((i) => [...i.matchAll(/\/(\w+)/g)].map((i) => i[1]))
  .convert;

const DSV2Tuple = a.utils.tuple(
  [String, String, Number, Number, String, PathArray, PathArray],
  a.converters.get('array')
    .clone()
    .string((i) => i.split(':'))
    .convert
);

const input = 'user:12345:1000:1000:ordinar user:/home/user:/bin/sh';
DSV2Tuple(input); // ['user', '12345', 1000, 1000, 'ordinar user', ['home', 'user'], ['bin', 'sh']];
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
// get list of predefined converters
Array.from(a.converters.keys()); // ['boolean', 'byte', 'int', 'long', 'double', 'string', ...];

// retrieving with existence check
const Num = a.converters.converter('number'); // Converter<number>
const Str = a.converters.converter('string'); // Converter<string>
a.converters.converter('123'); // Error

// direct retrieving
const Arr = a.converters.get('array'); // Converter<Array>
const Unknown = a.converters.get('123'); // undefined
```

## Predicates

*   **See**: [is](#is)

data type checks

### Examples

```javascript
const { is } = a;

is.void(0); // false
is.void(null); // true
is.value(null); // false
is.value(0); // true
is.ubyte(255); // true
is.int(Infinity); // false
is.object(null); // false
is.Iterable(new Set()); // true
```

## Checks

*   **See**: [Is](Is)

create readable check functions

### Examples

```javascript
const { Is } = a;

const isAlphaOrBeta = Is.variant(['Alpha', 'Beta']);
isAlphaOrBeta('Alpha'); // true;
isAlphaOrBeta('Gamma'); // false;

class X {}
class Y extends X {}

const isX = Is.instance(X);
isX(new X); // true
isX(new Y); // true
isX({}); // false
```

## Errors

*   **See**: [ErrorValue](#errorvalue)

create informative errors

### Examples

add additional value to an error

```javascript
const { ErrorValue } = a;
const inc = (input) => typeof input === 'number'
  ? input + 1
  : new ErrorValue('invalid list', { input, date: Date.now() }).throw();

inc('1'); // Error { message: 'invalid number', value: { input: '1', date: 946684800000 } }
```

intercept and wrap thrown ones

```javascript
try {
 throw new Error('oops, something went wrong');
} catch (error) {
 throw new ErrorValue('urgent message', { data: 'some additional data' }, { cause: error });
}
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

    |--------|------------------|------------------|
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
symbol.convert([1.5, 2, 3]); // Symbol('1.5')
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

### object

#### Examples

```javascript
object.convert(undefined); // {}
object.convert(null); // {}
object.convert(false); // Boolean { false }
object.convert(1); // Number { 1 }
object.convert('2'); // String { 2 }
object.convert([1, '2', 3n]); // [1, '2', 3n]
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
set.convert([1, '2', 3]); // Set {1, '2', 3}
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

## utils

extra utils functions

### Examples

```javascript
const { array, tuple, range, variant, object, dictionary } = a.utils;
```

### array

constrain data to an array elements of a given type

#### Parameters

*   `conversion` **Conversion\<any, OUTPUT>** item conversion
*   `initiator` **Conversion\<any, [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<any>>** input data initial conversion (optional, default `presets.array.convert`)

#### Examples

```javascript
const Numbers = array(Number);

Numbers(); // []
Numbers([]); // []
Numbers([true, 2, "3", {}]); // [1, 2, 3, NaN]
```

sparse arrays behavior

```javascript
// Be aware of sparse arrays behavior - conversion is not performed for empty items
numArray[1, , 3] // [1, , 3]
```

Returns **Conversion\<any, [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<OUTPUT>>**&#x20;

### tuple

constrain data to a tuple with given types

#### Parameters

*   `conversions` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<Conversion\<any, any>>** tuple elemets conversions
*   `initiator` **Conversion\<any, [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<any>>** input data initial conversion (optional, default `presets.array.convert`)

#### Examples

```javascript
const NumStrBool = tuple([Number, String, Boolean]);

NumStrBool(); // [NaN, 'undefined', false]
NumStrBool(null); // [NaN, 'undefined', false]
NumStrBool([]); // [NaN, '', false]
NumStrBool('5'); // [5, 'undefined', false]
NumStrBool(['1', '2', '3']); // [1, '2', true]
```

Returns **Conversion\<any, [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<any>>**&#x20;

### range

constrain variable value within a given range

#### Parameters

*   `lower` **OUTPUT** lower range border (optional, default `-Number.MAX_VALUE`)
*   `upper` **OUTPUT** upper range border (optional, default `Number.MAX_VALUE`)
*   `fallback` **Fallback\<OUTPUT>** fallback value generator
*   `conversion` **Conversion\<any, OUTPUT>** input data conversion (optional, default `presets.double.convert`)

#### Examples

```javascript
const range37 = range(3, 7);

range37(1); // 3
range37(5); // 5
range37(9); // 7


const range37WithCustomFallback = range(3, 7, () => -1);

range37WithCustomFallback(1); // -1
range37WithCustomFallback(5); // 5
range37WithCustomFallback(9); // -1


const rangeString = range('k', 'w', undefined, String);

rangeString('a'); // k
rangeString('n'); // n
rangeString('z'); // w
```

Returns **Conversion\<any, OUTPUT>**&#x20;

### variant

constrain variable to given variants

#### Parameters

*   `values` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<OUTPUT>** valid values list
*   `fallback` **Fallback\<OUTPUT>** fallback value generator (optional, default `()=>values[0]`)
*   `conversion` **Conversion\<any, OUTPUT>** input data conversion (optional, default `presets.double.convert`)

#### Examples

```javascript
const oneOf123 = variant([1, 2, 3]);

oneOf123(1); // 1
oneOf123(2); // 2
oneOf123(3); // 3
oneOf123(4); // 1
oneOf123(-5); // 1


const oneOf123WithCustomFallback = variant([1, 2, 3], () => -1);

oneOf123WithCustomFallback(4); // -1


oneOf123Strict([1, 2, 3], () => {
  throw new Error('invalid input');
});
oneOf123Strict(4); // throws an Error


const oneOfAB = variant(['a', 'b'], (i) => ['a', 'b'][i], String);

oneOfAB('a'); // 'a'
oneOfAB('b'); // 'b'
oneOfAB(0); // 'a'
oneOfAB(1); // 'b'
```

Returns **Conversion\<any, OUTPUT>**&#x20;

### object

cast data into an object with a given schema

#### Parameters

*   `schema` **Record<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), Conversion\<any, OUTPUT>>**&#x20;
*   `conversion` **Conversion\<any, OUTPUT>** input data conversion (optional, default `presets.object.convert`)

#### Examples

```javascript
const obj = object({
  a: a.ubyte,
  b: array(object({
    c: a.int,
    d: a.string,
  })),
});

obj(undefined); // { a: 0, b: [] }
obj({ a: 999, b: [{ c: 2.5, d: 3 }, null] }); // { a: 255, b: [{ c: 2, d: '3' }, { c: 0, d: '' }] }
```

Returns **Conversion\<any, OUTPUT>**&#x20;

### dictionary

cast data into a dictionary

#### Parameters

*   `conversion` &#x20;
*   `initiator` **Conversion\<any, any>** input data conversion (optional, default `presets.object.convert`)

#### Examples

```javascript
const dictOfInt = utils.dictionary(a.int);

dictOfInt(undefined); // { }
dictInt({ a: null, b: true, c: '2', d: [3, 4] }); // { a: 0, b: 1, c: 2, d: 3 }
```

Returns **Conversion\<any, Record<([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)), VALUE>>**&#x20;

## projection

project data into object according to schema

### Parameters

*   `schema` **Schema**&#x20;

### Examples

```javascript
const schema = {
  // shallow element
  a: (source) => source.x + 1,
  // nested schema
  b: {
    c: (source) => source.x + 2,
  },
  // options ( second argument )
  d: (source, options) => options,
  // mid-process result access
  e: (source, options, target) => { target._e = source.x + 3; },
  // call context
  f: function() { return this; },
};

const project = projection(schema);
const reshape = project(schema);
const source = { x: 1 };
const options = { z: 5 };
const context = { y: 11 };

project.call(context, source, options);
{
  a: 2,
  b: { c: 3 },
  d: { z: 5 },
  _e: 7, e: undefined,
  f: { y: 11 },
}
```

Returns **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)**&#x20;

## is

guard functions (pattern matching check)

### undefined

### null

### void

undefined or null

#### Examples

```javascript
is.void(null) // true
is.void(0) // false
```

### value

any value except undefined or null

#### Examples

```javascript
is.value(null) // false
is.value(0) // true
```

### boolean

#### Examples

```javascript
is.boolean(1) // false
is.boolean(true) // true
```

### number

#### Examples

```javascript
is.number(NaN) // true
is.number(Infinity) // true
is.number(1) // true
is.number('1') // false
```

#### integers

byte, short, int, long

##### Examples

```javascript
is.int(NaN) // false
is.long(Infinity) // false
is.uint(-1) // false
is.uint(1) // true
is.uint(1.5) // false
```

#### floats

double

##### Examples

```javascript
is.double(NaN) // false
is.double(Infinity) // false
is.double(1.5) // true
```

### bigint

### string

### symbol

### function

### object

any object (null excluded)

#### Examples

```javascript
is.object(null) // false
is.object({}) // true
```

### Error

### Array

#### Examples

```javascript
is.Array({}) // false
is.Array([]) // true
```

### Date

### RegExp

### Promise

### Set

### WeakSet

### Map

### WeakMap

### Iterable

can be iterated

#### Examples

```javascript
is.Iterable(new Map()); // true
is.Iterable([]); // true
is.Iterable({}); // false
```

### type

#### Parameters

*   `type` &#x20;

#### Examples

```javascript
const isString = type('string');
isString(1); // false
isString('1'); // true
```

### instance

#### Parameters

*   `prototype` &#x20;

#### Examples

```javascript
class Test {}
const isTest = instance(Test);
isTest({}); // false
isTest(new Test()); // true
```

### variant

#### Parameters

*   `list` &#x20;

#### Examples

```javascript
const isVariant = variant([1, 2, 3]);
isVariant(4); // false
isVariant(3); // true
```

### check

#### Parameters

*   `guard` &#x20;

#### Examples

```javascript
const isOdd = check((v) => v % 2 ? true : false);
isOdd(0); // false
isOdd(1); // true
```

## Converter

converts input data to specific type

*   at first checks if conversion is necessary
*   attempts conversion based on the input data type
*   searches for suitable conversions among registered
*   calls a fallback function

### Parameters

*   `is` **IS\<OUTPUT>** initial input data type check (predicate). determines if any conversion is necessary
*   `fallback` **Fallback\<OUTPUT>** fallback value generator. runs if none of the available conversions are suitable

### Examples

converter creation

```javascript
const positive = new Converter(
  (input) => typeof input === 'number' && input > 0,
  (input) => input === 0 ? 0.1 : 0.2
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

conversion with prohibited input types

```javascript
const converter = new Converter(
  (input) => typeof input === 'number',
  (input) => {
    throw new Error('unknown input data type:' + input);
  })
  .string((i) => {
    throw new Error('string input is forbidden:' + i);
  })
  .boolean(Number)
  .register(Array.isArray, (i) => converter.convert(i[0]));

converter.convert(true); // 1
converter.convert(2); // 2
converter.convert('3'); // Error
converter.convert([4]); // 4
converter.convert(Promise.resolve(5)); // Error
```

### convert

converts data according to saved conversion rules

#### Parameters

*   `input` **any** input data

### register

adds conversion function for `INPUT` type

#### Parameters

*   `is` **IS\<INPUT>** input data type check (predicate), determines if input can be processed by `conversion`
*   `conversion` **Conversion\<INPUT, OUTPUT>** `INPUT` to `OUTPUT` conversion function

### unregister

removes conversion for `INPUT` type

#### Parameters

*   `is` **IS\<INPUT>** input type check (predicate)

### type

set conversion rule for type `name` if `conversion` is defined or unset if undefined

#### Parameters

*   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** one of types (`typeof` result)
*   `conversion` **Conversion?**&#x20;

### undefined

conversion rule setter for `undefined` input

#### Parameters

*   `conversion` **Conversion?**&#x20;

### boolean

conversion rule setter for `boolean` input

#### Parameters

*   `conversion` **Conversion?**&#x20;

### number

conversion rule setter for `number` input

#### Parameters

*   `conversion` **Conversion?**&#x20;

### bigint

conversion rule setter for `bigint` input

#### Parameters

*   `conversion` **Conversion?**&#x20;

### string

conversion rule setter for `string` input

#### Parameters

*   `conversion` **Conversion?**&#x20;

### symbol

conversion rule setter for `symbol` input

#### Parameters

*   `conversion` **Conversion?**&#x20;

### clone

#### Examples

```javascript
const converter = new Converter(
  (i) => typeof i === 'number',
  () => 0
)
  .undefined(() => 1);

const clone = converter
  .clone()
  .undefined(() => 2);

converter.convert(); // 1
clone.convert(); // 2
```

## ErrorValue

**Extends Error**

Error with value property

### Parameters

*   `message` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?**&#x20;
*   `value` **any?**&#x20;
*   `options` **any?**&#x20;

### Properties

*   `value` **any?** can be used to store additional cause info

### throw

throw this instance of error
