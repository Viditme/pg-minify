'use strict';

const LB = require('os').EOL;
const minify = require('../lib');
const errorLib = require('../lib/error');
const PEC = errorLib.parsingErrorCode;

describe('Minify/Positive', () => {

    describe('single-line comment', () => {
        it('must return an empty string', () => {
            expect(minify('--comment')).toBe('');
            expect(minify('--comment' + LB)).toBe('');
            expect(minify(LB + '--comment')).toBe('');
        });
    });

    describe('single-line comment with a prefix', () => {
        it('must return the prefix', () => {
            expect(minify('text--comment')).toBe('text');
            expect(minify(' text --comment')).toBe('text');
            expect(minify('text' + LB + '--comment')).toBe('text');
            expect(minify(' text ' + LB + '--comment')).toBe('text');
            expect(minify('text--comment' + LB)).toBe('text');
        });
    });

    describe('single-line comment with a suffix', () => {
        it('must return the suffix', () => {
            expect(minify('--comment' + LB + 'text')).toBe('text');
            expect(minify('--comment' + LB + ' text ')).toBe('text');
        });
    });

    describe('comments in strings', () => {
        it('must be skipped', () => {
            expect(minify('\'--comment\'')).toBe('\'--comment\'');
            expect(minify('\'--comment' + LB + 'text\'')).toBe('E\'--comment\\ntext\'');
            expect(minify('\'/*comment*/\'')).toBe('\'/*comment*/\'');
        });
    });

    describe('comments in identifiers', () => {
        it('must be skipped', () => {
            expect(minify('"--comment"')).toBe('"--comment"');
            expect(minify('"/*comment*/"')).toBe('"/*comment*/"');
        });
    });

    describe('empty text', () => {
        it('must be returned empty', () => {
            expect(minify('')).toBe('');
            expect(minify('\'\'')).toBe('\'\'');
        });
    });

    describe('multi-line text', () => {
        it('must be returned with E', () => {
            expect(minify('\'' + LB + '\'')).toBe('E\'\\n\'');
            expect(minify('\'' + LB + LB + '\'')).toBe('E\'\\n\\n\'');
            expect(minify('text \'' + LB + '\'')).toBe('text E\'\\n\'');
            expect(minify('text e\'' + LB + '\'')).toBe('text e\'\\n\'');
            expect(minify('e\'' + LB + '\'')).toBe('e\'\\n\'');
            expect(minify('E\'' + LB + '\'')).toBe('E\'\\n\'');
        });

        it('must truncate text correctly', () => {
            expect(minify('\' first ' + LB + ' last \'')).toBe('E\' first\\nlast \'');
            expect(minify('\' first ' + LB + ' second ' + LB + ' third \'')).toBe('E\' first\\nsecond\\nthird \'');
        });

        it('must add a space where necessary', () => {
            expect(minify('select\'\nvalue\'')).toBe('select E\'\\nvalue\'');
        });

        it('must not add a space to an empty string', () => {
            expect(minify('\'\nvalue\'')).toBe('E\'\\nvalue\'');
        });

    });

    describe('Special Comment', () => {

        describe('without compression', () => {
            expect(minify('/*!text*/')).toBe('/*!text*/');
        });

        describe('with compression', () => {
            expect(minify('prefix /*!text*/ suffix', {compress: true})).toBe('prefix/*!text*/suffix');
        });
    });

    describe('tabs in text', () => {
        it('must be replaced', () => {
            expect(minify('\t')).toBe('');
            expect(minify('\'\t\'')).toBe('E\'\\t\'');
            expect(minify('\'\\t\'')).toBe('\'\\t\'');
            expect(minify('e\' \t \'')).toBe('e\' \\t \'');
            expect(minify('\'\t first ' + LB + '\t second \t' + LB + '\t third \t\'')).toBe('E\'\\t first\\nsecond\\nthird \\t\'');
        });
    });

    describe('quotes in strings', () => {
        it('must be ignored', () => {
            expect(minify('\'\'')).toBe('\'\'');
            expect(minify('text \'\'')).toBe('text \'\'');
            expect(minify('\'text\\\\\'')).toBe('\'text\\\\\'');
            expect(minify('\'\'')).toBe('\'\'');
            expect(minify('\'\'\'\'\'\'')).toBe('\'\'\'\'\'\'');
        });
    });

    describe('redundant gaps', () => {
        it('must be all replaced with a single space', () => {
            expect(minify('a  b')).toBe('a b');
            expect(minify(' a     b ')).toBe('a b');
            expect(minify('a\tb')).toBe('a b');
            expect(minify('\ta\t\tb\t')).toBe('a b');
            expect(minify('a - b')).toBe('a - b');
        });
    });

    describe('with multiple lines', () => {
        it('must be ignored', () => {
            expect(minify('--comment' + LB + LB + 'text')).toBe('text');
            expect(minify('/*start' + LB + 'end*/')).toBe('');
            expect(minify('/*start' + LB + 'end*/text')).toBe('text');
            expect(minify('start-/*comment*/end')).toBe('start-end');
            expect(minify('start/*comment*/' + LB + 'end')).toBe('start end');
            expect(minify('start/*comment*/' + LB + ' end')).toBe('start end');
            expect(minify('/*comment*/end ' + LB)).toBe('end');
            expect(minify('/*start' + LB + 'end*/' + LB + 'text')).toBe('text');
            expect(minify(' /*hello*/ ' + LB + 'next')).toBe('next');
        });
    });

});

describe('Minify/Negative', () => {

    function errorCode(sql) {
        try {
            minify(sql);
        } catch (e) {
            return e.code;
        }
    }

    function getErrorPos(sql) {
        try {
            minify(sql);
        } catch (e) {
            return e.position;
        }
        return null;
    }

    describe('passing non-text', () => {
        const errMsg = 'Input SQL must be a text string.';
        it('must throw an error', () => {
            expect(() => {
                minify();
            }).toThrow(errMsg);
            expect(() => {
                minify(123);
            }).toThrow(errMsg);
        });
    });

    describe('nested multi-line comments', () => {
        /* Nested comments cannot be implemented without full tokenization,
        * because comments can be inside strings and identifiers, which can be
        * part of SQL as well as regular text, and there is no way of telling
        * which one it is. */
        it('must report correct error position', () => {
            expect(minify('/*text*/*/')).toBe('*/');
            expect(getErrorPos('/*/*text*/*/').column).toBe(3);
            expect(getErrorPos('/*text/**/').column).toBe(7);
            expect(getErrorPos('hello/*world!/**/').column).toBe(14);
        });
        it('must ignore closures in text', () => {
            expect(errorCode('/*\'*/\'*/')).toBe(PEC.unclosedText);
        });
    });

    describe('quotes in strings', () => {

        it('must report an error', () => {
            expect(errorCode('\'')).toBe(PEC.unclosedText);
            expect(errorCode('\'\'\'')).toBe(PEC.unclosedText);
            expect(errorCode('\'\'\' ')).toBe(PEC.unclosedText);
            expect(errorCode('\'\\\'')).toBe(PEC.unclosedText);
        });

        it('must report positions correctly', () => {
            expect(getErrorPos('\'').column).toBe(1);
            expect(getErrorPos(' \'').column).toBe(2);
            expect(getErrorPos('s\'').column).toBe(2);
            expect(getErrorPos('s \'').column).toBe(3);
        });

    });

    describe('unclosed multi-lines', () => {
        it('must report an error', () => {
            expect(errorCode('/*')).toBe(PEC.unclosedMLC);
            expect(errorCode('/*text')).toBe(PEC.unclosedMLC);
        });
    });

    describe('toString + inspect', () => {
        it('must produce the same output', () => {
            let error;
            try {
                minify('\'test');
            } catch (e) {
                error = e;
            }
            expect(error.toString()).toBe(error.inspect());
            expect(error.toString(1) != error.inspect()).toBe(true);
        });
    });
});
