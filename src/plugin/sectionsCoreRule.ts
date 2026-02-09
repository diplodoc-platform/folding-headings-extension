import type Core from 'markdown-it/lib/parser_core';

import {DATA_KEY, ENV_FLAG_NAME, SectionAttr, SectionCN, TokenType} from './const';
import {generateID, headingLevel, last} from './utils';

type Section = {header: number; nesting: number};

export const sectionsCoreRule: Core.RuleCore = (state) => {
    const Token = state.Token;
    const tokens: typeof state.tokens = []; // output
    const sections: Section[] = [];
    let nestedLevel = 0;

    for (const token of state.tokens) {
        // record level of nesting
        if (token.type.search(TokenType.Heading) !== 0) {
            nestedLevel += token.nesting;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (last(sections) && nestedLevel < last(sections)!.nesting) {
            closeSectionsToCurrentNesting(nestedLevel);
        }

        const hasFolding = token.markup.endsWith('#+');

        // add sections before headers
        if (token.type === TokenType.HeadingOpen) {
            const section: Section = {
                header: headingLevel(token.tag),
                nesting: nestedLevel,
            };
            closeSections(section);
            if (hasFolding) {
                tokens.push(openSection());
                sections.push(section);
            }
        }

        tokens.push(token);

        if (token.type === TokenType.HeadingClose && hasFolding) {
            tokens.push(openContent());
        }
    }

    // end for every token
    closeAllSections();

    if (state.tokens.length !== tokens.length) {
        state.env ??= {};
        state.env[ENV_FLAG_NAME] = true;
    }

    state.tokens = tokens;

    function openSection() {
        const t = new Token(TokenType.SectionOpen, 'section', 1);
        t.attrPush(['class', SectionCN.Section]);
        t.attrPush([SectionAttr.DataKey, DATA_KEY]);
        t.attrPush([SectionAttr.DataId, generateID()]);
        t.block = true;
        return t;
    }

    function closeSection() {
        const t = new Token(TokenType.SectionClose, 'section', -1);
        t.block = true;
        return t;
    }

    function openContent() {
        const t = new Token(TokenType.ContentOpen, 'div', 1);
        t.attrPush(['class', SectionCN.Content]);
        t.block = true;
        return t;
    }

    function closeContent() {
        const t = new Token(TokenType.ContentClose, 'div', -1);
        t.block = true;
        return t;
    }

    function closeSections(section: Section) {
        while (
            last(sections) &&
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            section.header <= last(sections)!.header &&
            // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
            section.nesting <= last(sections)!.nesting
        ) {
            sections.pop();
            tokens.push(closeContent());
            tokens.push(closeSection());
        }
    }

    function closeSectionsToCurrentNesting(nesting: number) {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        while (last(sections) && nesting < last(sections)!.nesting) {
            sections.pop();
            tokens.push(closeContent());
            tokens.push(closeSection());
        }
    }

    function closeAllSections() {
        while (sections.pop()) {
            tokens.push(closeContent());
            tokens.push(closeSection());
        }
    }
};
