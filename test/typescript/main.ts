/// <reference path='../../typescript/index.d.ts' />

import * as minify from 'pg-minify';

var s1 = minify('select * from table; --comment');
var s2 = minify('select * from table; --comment', {});
var s3 = minify('select * from table; --comment', {compress: true});

var options: minify.minifyOptions = {compress: true};
var s4 = minify('select * from table; --comment', options);
