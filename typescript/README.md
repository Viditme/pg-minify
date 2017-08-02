## TypeScript for pg-minify

Complete TypeScript 2.0 declarations for the [pg-minify] module.

### Inclusion

Typescript should be able to pick up the definitions without any manual configuration.

### Usage

```ts
import * as minify from "pg-minify";

var sql = "SELECT 1; -- comments";

minify(sql); //=> SELECT 1;
```

[pg-minify]:https://github.com/vitaly-t/pg-minify