Extendable library for typecasting.

# Usage

## import

### Examples

```javascript
import * as a from 'alwz';
// or
const a = require('alwz');
```

## boolean

cast to boolean

### Examples

```javascript
a.boolean('abc'); // true
a.boolean([false]); // false
```

## number

cast to number

### Examples

```javascript
a.number('42'); // 42
a.number('abc'); // NaN
a.number(Symbol.for('42')); // 42
a.number(new Date('1970-01-01T00:00:00.042Z')); // 42
a.number(['42']); // 42
```

## int

cast to int

### Examples

```javascript
a.int(42.5); // 42
a.int('42.5'); // 42
a.int('abc'); // 0
a.number(Symbol.for('42.5')); // 42
```

## float

synonym for `number`

## bigint

cast to bigint

### Examples

```javascript
a.bigint(42.5); // 42n
a.bigint('42'); // 42n
a.bigint('42.5'); // 0n
a.bigint(Symbol.for('42')); // 42n
a.bigint(new Date('1970-01-01T00:00:00.999Z')); // 999n
```

## string

cast to string

### Examples

```javascript
a.string(42.5); // '42.5'
a.string(Symbol.for('42')); // '42'
a.string(new Date('1970-01-01T00:00:00.999Z')); // '1970-01-01T00:00:00.999Z'
a.string([1, 2, 3]); '1'
a.string(false); ''
a.string(true); ' '
```

## symbol

cast to symbol

### Examples

```javascript
a.symbol(42.5); // Symbol('42.5')
a.symbol(Symbol.for('42')); // Symbol('42')
a.symbol(new Date('1970-01-01T00:00:00.999Z')); // Symbol('1970-01-01T00:00:00.999Z')
a.symbol([1, 2, 3]); Symbol('1,2,3')
a.symbol(false); Symbol('')
```

## fn

cast to function

### Examples

```javascript
a.fn((a, b) => a + b); // (a, b) => a + b
a.fn(123); () => 123
```

## date

cast to date

### Examples

```javascript
a.date('111'); // Date('1970-01-01T00:00:00.111Z')
a.date('abc'); // Date(NaN)
```

## array

cast to array

### Examples

```javascript
a.array(); // []
a.array(null); // []
a.array(false); // [false]
a.array(123); // [123]
a.array('1,2,3'); // ['1,2,3']
a.array(new Set([1, 2, 3])); // [1, 2, 3]
```

## map

cast to map

## weakmap

cast to weakmap

## set

cast to set

### Examples

```javascript
a.set([1, '2', 3]); // Set {1, "2", "c"}
```

## weakset

cast to weakset

## promise

cast to promise

### Examples

```javascript
a.promise(Promise.resolve(1)); // Promise { 1 }
a.promise(42); // Promise { 42 }
```

## aggregator

aggregates converters

### Examples

```javascript
const converter = new a.Converter((input) => typeof input === 'number' && input > 0, () => 1);
converter
	.undefined(() => 1)
	.number((i) => {
		const result = Math.abs(i);
		return result > 0 ? result : converter.fallback();
	})
	.bigint((i) => converter.convert(Number(i)))
	.string((i) => converter.convert(Number(i)))
	.symbol((i) => converter.convert(Symbol.keyFor(i)))
	.register((i) => i instanceof Number, (i: any) => converter.convert(+i));

a.aggregator.register('positive', converter);

a.to('positive')('-7'); // 7
a.to('positive')('abc'); // 1
```

## to

### Examples

```javascript
a.to('int')('24.5'); // 24
a.to('bigint')('42.5'); // 42n
```

## Aggregator

Aggregates converters

### register

add converter

#### Parameters

*   `name`
*   `converter`

### unregister

del converter

#### Parameters

*   `name`

### converter

seek converter by name

#### Parameters

*   `name`

### to

generate simple function to convert data

#### Parameters

*   `name`

## Convertor

Converts input data to specific type

### Parameters

*   `is` **IS** input data type checker
*   `fallback`

### convert

converts data according to saved rules

#### Parameters

*   `i` **any** input data

### register

add `type checker` & `conversion rule` pair into conversions set

#### Parameters

*   `is` **IS** input data type checker
*   `converter` **[Convertor](#convertor)\<any, T>** conversion rule

### unregister

del `type checker` & `conversion rule` pair from conversions set

#### Parameters

*   `IS`
*   `is` **IS** input data type checker

### undefined

conversion rule for `undefined`

#### Parameters

*   `convertor`

### boolean

conversion rule for `boolean`

#### Parameters

*   `convertor`

### number

conversion rule for `number`

#### Parameters

*   `convertor`

### bigint

conversion rule for `bigint`

#### Parameters

*   `convertor`

### string

conversion rule for `string`

#### Parameters

*   `convertor`

### symbol

conversion rule for `symbol`

#### Parameters

*   `convertor`
