export {SectionCN, DATA_KEY, SectionAttr} from '../common/const';

export const ENV_FLAG_NAME = 'has-folding-headings';

export const TokenType = {
    Heading: 'heading',
    HeadingOpen: 'heading_open',
    HeadingClose: 'heading_close',
    Section: 'heading_section',
    SectionOpen: 'heading_section_open',
    SectionClose: 'heading_section_close',
    Content: 'heading_section_content',
    ContentOpen: 'heading_section_content_open',
    ContentClose: 'heading_section_content_close',
} as const;
