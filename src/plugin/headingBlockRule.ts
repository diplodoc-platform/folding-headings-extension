import type ParserBlock from 'markdown-it/lib/parser_block';

import {TokenType} from './const';

// copied from https://github.com/markdown-it/markdown-it/blob/14.1.0/lib/rules_block/heading.mjs
// modified: support syntax ###+ for folding headings
export const headingBlockRule: ParserBlock.RuleBlock = (state, startLine, _endLine, silent) => {
    const {isSpace} = state.md.utils;

    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) {
        return false;
    }

    let ch = state.src.charCodeAt(pos);

    if (ch !== 0x23 /* # */ || pos >= max) {
        return false;
    }

    // count heading level
    let level = 1;
    ch = state.src.charCodeAt(++pos);
    while (ch === 0x23 /* # */ && pos < max && level <= 6) {
        level++;
        ch = state.src.charCodeAt(++pos);
    }

    let folding = false;
    if (ch === 0x2b /* + */) {
        folding = true;
        ch = state.src.charCodeAt(++pos);
    }

    if (level > 6 || (pos < max && !isSpace(ch))) {
        return false;
    }

    if (silent) {
        return true;
    }

    // Let's cut tails like '    ###  ' from the end of string

    max = state.skipSpacesBack(max, pos);
    const tmp = state.skipCharsBack(max, 0x23, pos); // #
    if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
        max = tmp;
    }

    state.line = startLine + 1;

    let token = state.push(TokenType.HeadingOpen, 'h' + String(level), 1);
    token.markup = '########'.slice(0, level) + (folding ? '+' : '');
    token.map = [startLine, state.line];
    token.meta ||= {};
    token.meta.folding = folding;

    token = state.push('inline', '', 0);
    token.content = state.src.slice(pos, max).trim();
    token.map = [startLine, state.line];
    token.children = [];

    token = state.push(TokenType.HeadingClose, 'h' + String(level), -1);
    token.markup = '########'.slice(0, level) + (folding ? '+' : '');
    token.meta ||= {};
    token.meta.folding = folding;

    return true;
};
