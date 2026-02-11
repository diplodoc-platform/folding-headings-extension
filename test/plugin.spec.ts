import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import MarkdownIt from 'markdown-it';

import {transform as foldingHeadingsTransformer} from '../src/plugin/transform';

import {commonHeadingTokens, foldingHeadingTokens, sectionsHtmlResult} from './data';

function html(markup: string, opts?: Parameters<typeof foldingHeadingsTransformer>[0]) {
    const md = new MarkdownIt();
    md.use(foldingHeadingsTransformer({bundle: false, ...opts}));
    return md.render(markup);
}

function meta(markup: string, opts?: Parameters<typeof foldingHeadingsTransformer>[0]) {
    const md = new MarkdownIt();
    md.use(foldingHeadingsTransformer({bundle: false, ...opts}));
    const env: {meta?: {script?: string[]; style?: string[]}} = {};
    md.render(markup, env);
    return env.meta;
}

describe('Folding Headings - plugin', () => {
    beforeEach(() => {
        let tmp = 0.123456789;
        vi.spyOn(globalThis.Math, 'random').mockImplementation(() => {
            tmp += 0.000056789;
            return tmp;
        });
    });

    afterEach(() => {
        vi.spyOn(globalThis.Math, 'random').mockRestore();
    });

    it('should render common headings', () => {
        const markup = `

# Heading1
## Heading2
### Heading3
#### Heading4
##### Heading5
###### Heading6

        `.trim();

        const expected = `
<h1>Heading1</h1>
<h2>Heading2</h2>
<h3>Heading3</h3>
<h4>Heading4</h4>
<h5>Heading5</h5>
<h6>Heading6</h6>
`.trimStart();

        expect(html(markup)).toBe(expected);
    });

    it('should render folding headings', () => {
        const markup = `

#+ Heading1
##+ Heading2
###+ Heading3
####+ Heading4
#####+ Heading5
######+ Heading6

        `.trim();

        expect(html(markup)).toBe(sectionsHtmlResult);
    });

    it('should dont add assets to meta for common heading', () => {
        const markup = '# Heading';
        expect(meta(markup)).toBeUndefined();
    });

    it('should add default assets to meta', () => {
        const markup = '#+ Heading';
        expect(meta(markup)).toStrictEqual({
            script: ['_assets/folding-headings-extension.js'],
            style: ['_assets/folding-headings-extension.css'],
        });
    });

    it('should add custom assets to meta', () => {
        const markup = '#+ Heading';
        expect(meta(markup, {runtime: 'folding'})).toStrictEqual({
            script: ['folding'],
            style: ['folding'],
        });
    });

    it('should add custom assets to meta 2', () => {
        const markup = '#+ Heading';
        expect(
            meta(markup, {
                runtime: {script: 'folding.script', style: 'folding.style'},
            }),
        ).toStrictEqual({script: ['folding.script'], style: ['folding.style']});
    });

    it('should parse markup to common headings', () => {
        const md = new MarkdownIt().use(foldingHeadingsTransformer({bundle: false}));
        const markup = `
# Heading1

## Heading2
        `.trim();

        const tokens = toPlainObject(md.parse(markup, {}));
        expect(tokens).toStrictEqual(commonHeadingTokens);
    });

    it('should parse markup to folding headings', () => {
        const md = new MarkdownIt().use(foldingHeadingsTransformer({bundle: false}));
        const markup = `
#+ Feading1

##+ Feading2
        `.trim();

        const tokens = toPlainObject(md.parse(markup, {}));
        expect(tokens).toStrictEqual(foldingHeadingTokens);
    });

    it('should add folding flag to token.meta', () => {
        const md = new MarkdownIt().use(foldingHeadingsTransformer({bundle: false}));
        const markup = '##+ Heading2';
        const headingOpenToken = md.parse(markup, {})[1];
        expect(headingOpenToken.type === 'heading_open');
        expect(headingOpenToken.markup).toBe('##+');
        expect(headingOpenToken.meta).toStrictEqual({folding: true});
    });

    it('should close section before heading with same level', () => {
        const md = new MarkdownIt().use(foldingHeadingsTransformer({bundle: false}));
        const markup = `
##+ H2

### H3

## H2-2
        `.trim();
        const tokenTypes = pickTypes(md.parse(markup, {}));
        expect(tokenTypes).toStrictEqual([
            'heading_section_open',
            'heading_open',
            'inline',
            'heading_close',
            'heading_section_content_open',
            'heading_open',
            'inline',
            'heading_close',
            'heading_section_content_close',
            'heading_section_close',
            'heading_open',
            'inline',
            'heading_close',
        ]);
    });

    it('should close section before heading with lower level', () => {
        const md = new MarkdownIt().use(foldingHeadingsTransformer({bundle: false}));
        const markup = `
##+ H2

para2

###+ H3

para3

#+ H1
        `.trim();
        const tokenTypes = pickTypes(md.parse(markup, {}));
        expect(tokenTypes).toStrictEqual([
            'heading_section_open',
            'heading_open',
            'inline',
            'heading_close',
            'heading_section_content_open',
            'paragraph_open',
            'inline',
            'paragraph_close',
            'heading_section_open',
            'heading_open',
            'inline',
            'heading_close',
            'heading_section_content_open',
            'paragraph_open',
            'inline',
            'paragraph_close',
            'heading_section_content_close',
            'heading_section_close',
            'heading_section_content_close',
            'heading_section_close',
            'heading_section_open',
            'heading_open',
            'inline',
            'heading_close',
            'heading_section_content_open',
            'heading_section_content_close',
            'heading_section_close',
        ]);
    });

    it('should close section inside blockquoute', () => {
        const md = new MarkdownIt().use(foldingHeadingsTransformer({bundle: false}));
        const markup = `
> ##+ H2
> quoute
        `.trim();
        const tokenTypes = pickTypes(md.parse(markup, {}));
        expect(tokenTypes).toStrictEqual([
            'blockquote_open',
            'heading_section_open',
            'heading_open',
            'inline',
            'heading_close',
            'heading_section_content_open',
            'paragraph_open',
            'inline',
            'paragraph_close',
            'heading_section_content_close',
            'heading_section_close',
            'blockquote_close',
        ]);
    });

    it('should dont close section before blockquoute', () => {
        const md = new MarkdownIt().use(foldingHeadingsTransformer({bundle: false}));
        const markup = `
####+ H4

> ##+ H2
> quoute
        `.trim();
        const tokenTypes = pickTypes(md.parse(markup, {}));
        expect(tokenTypes).toStrictEqual([
            'heading_section_open',
            'heading_open',
            'inline',
            'heading_close',
            'heading_section_content_open',
            'blockquote_open',
            'heading_section_open',
            'heading_open',
            'inline',
            'heading_close',
            'heading_section_content_open',
            'paragraph_open',
            'inline',
            'paragraph_close',
            'heading_section_content_close',
            'heading_section_close',
            'blockquote_close',
            'heading_section_content_close',
            'heading_section_close',
        ]);
    });
});

function toPlainObject<T extends object>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

function pickTypes(tokens: MarkdownIt.Token[]): string[] {
    return tokens.map((token) => token.type);
}
