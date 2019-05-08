pg-minify
=========

Minifies PostgreSQL scripts.

[![Build Status](https://travis-ci.org/vitaly-t/pg-minify.svg?branch=master)](https://travis-ci.org/vitaly-t/pg-minify)
[![Coverage Status](https://coveralls.io/repos/vitaly-t/pg-minify/badge.svg?branch=master)](https://coveralls.io/r/vitaly-t/pg-minify?branch=master)
[![Downloads Count](http://img.shields.io/npm/dm/pg-minify.svg)](https://www.npmjs.com/package/pg-minify)
[![Join the chat at https://gitter.im/vitaly-t/pg-minify](https://badges.gitter.im/vitaly-t/pg-minify.svg)](https://gitter.im/vitaly-t/pg-minify?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**Features:**

* Removes both `/*multi-line*/` and `--single-line` comments
* Preserves special multi-line comments that start with `/*!`
* Concatenates multi-line strings into a single line with `\n`
* Fixes multi-line text, prefixing it with `E` where needed
* Removes redundant line gaps: line breaks, tabs and spaces
* Provides basic parsing and error reporting for invalid SQL
* Flattens the resulting script into a single line
* Optionally, compresses SQL for minimum space 

This library is originally for PostgreSQL, though it works for most of MS-SQL and MySQL.

**Limitations:**

* Multi-line quoted identifiers are not supported, throwing an error when encountered.
* Nested multi-line comments are not supported, throwing an error when encountered.

## Installing

```
$ npm install pg-minify
```

## Usage

```js
const minify = require('pg-minify');

const sql = 'SELECT 1; -- comments';

minify(sql); //=> SELECT 1;
```

with compression (removes all unnecessary spaces):

```js
const sql = 'SELECT * FROM "table" WHERE col = 123; -- comments';

minify(sql, {compress: true});
//=> SELECT*FROM"table"WHERE col=123;
```

The library's distribution includes [TypeScript] declarations.

## Error Handling

[SQLParsingError] is thrown on failed SQL parsing:

```js
try {
    minify('SELECT \'1');
} catch (error) {
    // error is minify.SQLParsingError instance
    // error.message:
    // Error parsing SQL at {line:1,col:8}: Unclosed text block.
}
```

## API

### minify(sql, [options]) ⇒ String

Minifies SQL into a single line, according to the `options`.

##### options.compress ⇒ Boolean

Compresses / uglifies the SQL to its bare minimum, by removing all unnecessary spaces.

* `false (default)` - keep minimum spaces, for easier read
* `true` - remove all unnecessary spaces 

## Testing

First, clone the repository and install DEV dependencies.

```
$ npm test
```

Testing with coverage:
```
$ npm run coverage
```

## License

Copyright © 2019 [Vitaly Tomilov](https://github.com/vitaly-t);
Released under the MIT license.

[SQLParsingError]:https://github.com/vitaly-t/pg-minify/blob/master/lib/error.js#L24
[TypeScript]:https://github.com/vitaly-t/pg-minify/tree/master/typescript
