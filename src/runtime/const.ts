export {SectionAttr, DATA_KEY} from '../common/const';

export const GLOBAL_KEY = 'heading_sections';

export const Selector = {
    Heading: '.yfm .heading-section > h1,h2,h3,h4,h5,h6',
    Section: '.yfm .heading-section',
    Content: '.yfm .heading-section-content',
} as const;

export const ClassName = {
    Open: 'open',
} as const;
